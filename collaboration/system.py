"""
Collaboration System for JPE Sims 4 Mod Translator.

This module enables real-time collaboration between modders using
WebSocket connections and shared document editing capabilities.
"""

import asyncio
import json
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Callable, Any, Set
from dataclasses import dataclass, field
from datetime import datetime
import websockets
from enum import Enum

from engine.ir import ProjectIR
from diagnostics.sentinel import SentinelExceptionLogger


class CollaborationRole(Enum):
    """Role of a collaborator in a project."""
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"


class OperationType(Enum):
    """Types of collaborative operations."""
    INSERT = "insert"
    DELETE = "delete"
    REPLACE = "replace"
    FORMAT = "format"


@dataclass
class Collaborator:
    """Represents a collaborator connected to a shared project."""
    user_id: str
    username: str
    role: CollaborationRole
    join_time: datetime
    last_activity: datetime
    cursor_positions: Dict[str, int]  # filename -> position
    is_online: bool = True


@dataclass
class DocumentOperation:
    """Represents an operation performed on a shared document."""
    operation_id: str
    user_id: str
    file_path: str
    operation_type: OperationType
    position: int
    content: str = ""
    length: int = 0  # For delete operations
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class SharedProject:
    """Represents a project being shared among collaborators."""
    project_id: str
    name: str
    owner_id: str
    collaborators: Dict[str, Collaborator] = field(default_factory=dict)
    document_operations: List[DocumentOperation] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)
    current_file: str = ""  # Currently focused file


class CollaborationServer:
    """WebSocket server for handling real-time collaboration."""
    
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
        self.shared_projects: Dict[str, SharedProject] = {}
        self.document_locks: Dict[str, asyncio.Lock] = {}
        self.sentinel_logger = SentinelExceptionLogger()
    
    async def register_client(self, websocket: websockets.WebSocketServerProtocol):
        """Register a new client WebSocket connection."""
        self.connected_clients.add(websocket)
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.remove(websocket)
    
    async def handle_message(self, websocket: websockets.WebSocketServerProtocol, message: str):
        """Handle incoming messages from clients."""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "join_project":
                await self.handle_join_project(websocket, data)
            elif message_type == "leave_project":
                await self.handle_leave_project(websocket, data)
            elif message_type == "document_change":
                await self.handle_document_change(websocket, data)
            elif message_type == "cursor_move":
                await self.handle_cursor_move(websocket, data)
            elif message_type == "get_document":
                await self.handle_get_document(websocket, data)
            elif message_type == "add_collaborator":
                await self.handle_add_collaborator(websocket, data)
            elif message_type == "remove_collaborator":
                await self.handle_remove_collaborator(websocket, data)
            else:
                await self.send_error(websocket, "Invalid message type")
        except json.JSONDecodeError:
            await self.send_error(websocket, "Invalid JSON message")
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"message": message}
            )
            await self.send_error(websocket, f"Server error: {str(e)}")
    
    async def handle_join_project(self, websocket: websockets.WebSocketServerProtocol, data: Dict[str, Any]):
        """Handle a client joining a shared project."""
        try:
            project_id = data["project_id"]
            user_id = data["user_id"]
            username = data["username"]
            role = CollaborationRole(data.get("role", "viewer"))
            
            if project_id not in self.shared_projects:
                # Create new shared project
                self.shared_projects[project_id] = SharedProject(
                    project_id=project_id,
                    name=data.get("project_name", f"Project {project_id}"),
                    owner_id=user_id
                )
            
            project = self.shared_projects[project_id]
            
            # Add collaborator
            collaborator = Collaborator(
                user_id=user_id,
                username=username,
                role=role,
                join_time=datetime.now(),
                last_activity=datetime.now()
            )
            project.collaborators[user_id] = collaborator
            
            # Notify all clients about the new collaborator
            await self.broadcast_to_project(
                project_id,
                {
                    "type": "collaborator_joined",
                    "user_id": user_id,
                    "username": username,
                    "role": role.value
                }
            )
            
            # Send current project state to the new client
            await websocket.send(json.dumps({
                "type": "project_state",
                "project_id": project_id,
                "collaborators": [
                    {
                        "user_id": c.user_id,
                        "username": c.username,
                        "role": c.role.value,
                        "is_online": c.is_online
                    }
                    for c in project.collaborators.values()
                ]
            }))
        
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"data": data}
            )
            await self.send_error(websocket, f"Error joining project: {str(e)}")
    
    async def handle_document_change(self, websocket: websockets.WebSocketServerProtocol, data: Dict[str, Any]):
        """Handle document change operations."""
        try:
            project_id = data["project_id"]
            user_id = data["user_id"]
            file_path = data["file_path"]
            op_type = OperationType(data["operation_type"])
            position = data["position"]
            content = data.get("content", "")
            length = data.get("length", 0)
            
            if project_id not in self.shared_projects:
                await self.send_error(websocket, "Project not found")
                return
            
            project = self.shared_projects[project_id]
            if user_id not in project.collaborators:
                await self.send_error(websocket, "User not authorized for this project")
                return
            
            # Check if user has edit permissions
            collaborator = project.collaborators[user_id]
            if collaborator.role not in [CollaborationRole.OWNER, CollaborationRole.EDITOR]:
                await self.send_error(websocket, "Insufficient permissions to edit")
                return
            
            # Create document operation
            doc_op = DocumentOperation(
                operation_id=str(uuid.uuid4()),
                user_id=user_id,
                file_path=file_path,
                operation_type=op_type,
                position=position,
                content=content,
                length=length
            )
            project.document_operations.append(doc_op)
            
            # Update last accessed time
            project.last_accessed = datetime.now()
            
            # Broadcast change to all project collaborators
            await self.broadcast_to_project(
                project_id,
                {
                    "type": "document_change_broadcast",
                    "operation": {
                        "id": doc_op.operation_id,
                        "user_id": user_id,
                        "file_path": file_path,
                        "operation_type": op_type.value,
                        "position": position,
                        "content": content,
                        "length": length
                    }
                }
            )
        
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"data": data}
            )
            await self.send_error(websocket, f"Error processing document change: {str(e)}")
    
    async def handle_cursor_move(self, websocket: websockets.WebSocketServerProtocol, data: Dict[str, Any]):
        """Handle cursor movement notifications."""
        try:
            project_id = data["project_id"]
            user_id = data["user_id"]
            file_path = data["file_path"]
            position = data["position"]
            
            if project_id in self.shared_projects:
                project = self.shared_projects[project_id]
                if user_id in project.collaborators:
                    project.collaborators[user_id].cursor_positions[file_path] = position
                    project.collaborators[user_id].last_activity = datetime.now()
                    
                    # Broadcast cursor move to other collaborators
                    await self.broadcast_to_project(
                        project_id,
                        {
                            "type": "cursor_moved",
                            "user_id": user_id,
                            "file_path": file_path,
                            "position": position
                        },
                        exclude_user_id=user_id
                    )
        
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"data": data}
            )
    
    async def broadcast_to_project(self, project_id: str, message: Dict[str, Any], 
                                  exclude_user_id: Optional[str] = None):
        """Broadcast a message to all clients in a project."""
        # This is a simplified version - in a real implementation, we'd need to 
        # map client connections to projects
        message_json = json.dumps(message)
        for client in self.connected_clients:
            try:
                await client.send(message_json)
            except Exception as e:
                # Remove disconnected clients
                if client in self.connected_clients:
                    self.connected_clients.remove(client)
                self.sentinel_logger.log_exception(
                    e,
                    context_info={"client_host": client.remote_address}
                )
    
    async def send_error(self, websocket: websockets.WebSocketServerProtocol, error_message: str):
        """Send an error message to a client."""
        await websocket.send(json.dumps({
            "type": "error",
            "message": error_message
        }))
    
    async def start_server(self):
        """Start the WebSocket collaboration server."""
        try:
            server = await websockets.server.serve(
                self.register_client,
                self.host,
                self.port
            )
            print(f"Collaboration server started on {self.host}:{self.port}")
            
            await server.wait_closed()
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"host": self.host, "port": self.port}
            )
            raise


class CollaborationClient:
    """Client-side component for connecting to collaboration server."""
    
    def __init__(self, server_url: str):
        self.server_url = server_url
        self.websocket = None
        self.project_id = None
        self.user_id = None
        self.username = None
        self.role = None
        self.on_document_change: Optional[Callable[[DocumentOperation], None]] = None
        self.on_collaborator_change: Optional[Callable[[str, str, str], None]] = None
        self.sentinel_logger = SentinelExceptionLogger()
    
    async def connect(self):
        """Connect to the collaboration server."""
        try:
            self.websocket = await websockets.client.connect(self.server_url)
            print("Connected to collaboration server")
            
            # Start listening for messages
            asyncio.create_task(self.listen_for_messages())
            
            return True
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"server_url": self.server_url}
            )
            return False
    
    async def disconnect(self):
        """Disconnect from the collaboration server."""
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
    
    async def listen_for_messages(self):
        """Listen for messages from the server."""
        try:
            async for message in self.websocket:
                await self.handle_server_message(json.loads(message))
        except websockets.exceptions.ConnectionClosed:
            print("Connection to collaboration server closed")
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"connection": str(self.websocket)}
            )
    
    async def handle_server_message(self, data: Dict[str, Any]):
        """Handle incoming messages from the server."""
        msg_type = data.get("type")
        
        if msg_type == "collaborator_joined":
            if self.on_collaborator_change:
                self.on_collaborator_change(
                    "joined", 
                    data.get("username", ""), 
                    data.get("role", "")
                )
        elif msg_type == "document_change_broadcast":
            if self.on_document_change:
                op_data = data["operation"]
                doc_op = DocumentOperation(
                    operation_id=op_data["id"],
                    user_id=op_data["user_id"],
                    file_path=op_data["file_path"],
                    operation_type=OperationType(op_data["operation_type"]),
                    position=op_data["position"],
                    content=op_data["content"],
                    length=op_data.get("length", 0)
                )
                self.on_document_change(doc_op)
        elif msg_type == "cursor_moved":
            # Handle cursor movement if needed
            pass
        elif msg_type == "error":
            print(f"Collaboration error: {data.get('message')}")
    
    async def join_project(self, project_id: str, user_id: str, username: str, role: str = "viewer"):
        """Join a shared project."""
        if not self.websocket:
            raise Exception("Not connected to server")
        
        self.project_id = project_id
        self.user_id = user_id
        self.username = username
        self.role = role
        
        await self.websocket.send(json.dumps({
            "type": "join_project",
            "project_id": project_id,
            "user_id": user_id,
            "username": username,
            "role": role
        }))
    
    async def leave_project(self):
        """Leave the current project."""
        if not self.websocket or not self.project_id:
            return
        
        await self.websocket.send(json.dumps({
            "type": "leave_project",
            "project_id": self.project_id,
            "user_id": self.user_id
        }))
        
        self.project_id = None
        self.user_id = None
        self.username = None
        self.role = None
    
    async def send_document_change(self, file_path: str, operation_type: str, 
                                  position: int, content: str = "", length: int = 0):
        """Send a document change to the server."""
        if not self.websocket or not self.project_id:
            raise Exception("Not connected to a project")
        
        await self.websocket.send(json.dumps({
            "type": "document_change",
            "project_id": self.project_id,
            "user_id": self.user_id,
            "file_path": file_path,
            "operation_type": operation_type,
            "position": position,
            "content": content,
            "length": length
        }))
    
    async def send_cursor_position(self, file_path: str, position: int):
        """Send cursor position to other collaborators."""
        if not self.websocket or not self.project_id:
            return
        
        await self.websocket.send(json.dumps({
            "type": "cursor_move",
            "project_id": self.project_id,
            "user_id": self.user_id,
            "file_path": file_path,
            "position": position
        }))


class CollaborationManager:
    """Main manager for collaboration features in the application."""
    
    def __init__(self):
        self.server = CollaborationServer()
        self.client: Optional[CollaborationClient] = None
        self.active_project_id: Optional[str] = None
        self.my_user_id: Optional[str] = None
        self.my_username: Optional[str] = None
        self.current_collaborators: Dict[str, str] = {}  # user_id -> username
        self.sentinel_logger = SentinelExceptionLogger()
    
    async def start_collaboration_server(self, host: str = "localhost", port: int = 8765):
        """Start the local collaboration server."""
        self.server = CollaborationServer(host=host, port=port)
        await self.server.start_server()
    
    async def connect_to_collaboration(self, server_url: str):
        """Connect to a collaboration server."""
        self.client = CollaborationClient(server_url)
        return await self.client.connect()
    
    async def join_project(self, project_id: str, username: str, role: str = "viewer"):
        """Join a shared project."""
        if not self.client:
            raise Exception("Not connected to collaboration server")
        
        # Generate a user ID
        user_id = str(uuid.uuid4())
        self.my_user_id = user_id
        self.my_username = username
        
        success = await self.client.join_project(project_id, user_id, username, role)
        if success:
            self.active_project_id = project_id
            # Set up callbacks
            self.client.on_document_change = self.handle_document_change
            self.client.on_collaborator_change = self.handle_collaborator_change
        
        return success
    
    async def leave_project(self):
        """Leave the current project."""
        if not self.client:
            return
        
        await self.client.leave_project()
        self.active_project_id = None
        self.my_user_id = None
        self.my_username = None
        self.current_collaborators = {}
    
    def handle_document_change(self, doc_op: DocumentOperation):
        """Handle a document change from another collaborator."""
        print(f"Document changed by {doc_op.user_id}: {doc_op.operation_type.value} at position {doc_op.position}")
        # This would normally update the local document in the UI
        # For now, just log the change
    
    def handle_collaborator_change(self, action: str, username: str, role: str):
        """Handle a collaborator joining or leaving."""
        if action == "joined":
            print(f"{username} joined as {role}")
            # Add to collaborators list
            if self.my_user_id:  # Don't add ourselves
                # In a real implementation, we'd get the user_id from the server
                pass
        elif action == "left":
            print(f"{username} left the project")
            # Remove from collaborators list
    
    async def send_document_change(self, file_path: str, operation_type: str, 
                                 position: int, content: str = "", length: int = 0):
        """Send a document change to collaborators."""
        if not self.client or not self.active_project_id:
            return
        
        await self.client.send_document_change(file_path, operation_type, position, content, length)
    
    async def send_cursor_position(self, file_path: str, position: int):
        """Send cursor position to other collaborators."""
        if not self.client or not self.active_project_id:
            return
        
        await self.client.send_cursor_position(file_path, position)
    
    def get_collaborators(self) -> List[Dict[str, str]]:
        """Get list of current collaborators."""
        return [
            {"username": username, "role": "unknown"}
            for user_id, username in self.current_collaborators.items()
        ] + [{"username": self.my_username, "role": "self"}] if self.my_username else []


# Global collaboration manager instance
collaboration_manager = CollaborationManager()