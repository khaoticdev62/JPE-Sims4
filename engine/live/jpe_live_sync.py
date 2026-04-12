# JPE Studio — jpe_live_sync.py (Story 13.1)
# The Sims 4 Industrial Script-Mod bridge for real-time telemetry.

import socket
import json
import time
import threading
import traceback
import sys
import importlib
import sims4.commands
import sims4.exception_log
from functools import wraps

# Configuration
JPE_HOST = '127.0.0.1'
JPE_PORT = 9988 

class JpeSpectralLink:
    _instance = None
    _socket = None
    _connected = False
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(JpeSpectralLink, cls).__new__(cls)
        return cls._instance

    def connect(self):
        with self._lock:
            if self._connected:
                return
            
            try:
                self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self._socket.settimeout(2.0)
                self._socket.connect((JPE_HOST, JPE_PORT))
                self._connected = True
                self.send_event("HANDSHAKE", {
                    "message": "JPE Spectral Link Established",
                    "version": "2.1.0-Industrial",
                    "pid": sys.executable
                })
                # Start listener thread
                threading.Thread(target=self._command_listener, daemon=True).start()
            except Exception:
                self._connected = False

    def send_event(self, event_type, payload, severity="info"):
        if not self._connected:
            self.connect()
        
        if not self._connected:
            return

        try:
            message = {
                "type": event_type,
                "timestamp": int(time.time() * 1000),
                "severity": severity,
                "payload": payload
            }
            raw_data = json.dumps(message) + "\n"
            with self._lock:
                self._socket.sendall(raw_data.encode('utf-8'))
        except Exception:
            self._connected = False

    def _command_listener(self):
        """Persistent thread to handle inbound commands from JPE Studio"""
        buffer = ""
        while self._connected:
            try:
                data = self._socket.recv(4096).decode('utf-8')
                if not data:
                    self._connected = False
                    break
                
                buffer += data
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    if line.strip():
                        self._process_command(line)
            except Exception:
                self._connected = False
                break

    def _process_command(self, raw_command):
        try:
            cmd = json.loads(raw_command)
            cmd_type = cmd.get("type")
            payload = cmd.get("payload")

            if cmd_type == "RELOAD_MODULE":
                module_name = payload.get("module")
                if module_name in sys.modules:
                    importlib.reload(sys.modules[module_name])
                    self.send_event("LOG", {"message": f"Hot-patched module: {module_name}"})
            
            elif cmd_type == "PING":
                self.send_event("PONG", {"timestamp": time.time()})

        except Exception as e:
            self.send_event("EXCEPTION", {"message": f"Command Processing Error: {str(e)}"}, severity="error")

# --- Exception Hooking (Story 13.1) ---

original_log_exception = sims4.exception_log.log_exception

@wraps(original_log_exception)
def jpe_hooked_exception(exception, message=None, *args, **kwargs):
    try:
        link = JpeSpectralLink()
        formatted_trace = traceback.format_exc()
        link.send_event("EXCEPTION", {
            "message": message or str(exception),
            "traceback": formatted_trace,
            "exception_type": type(exception).__name__
        }, severity="critical")
    except:
        pass
    return original_log_exception(exception, message=message, *args, **kwargs)

sims4.exception_log.log_exception = jpe_hooked_exception

# --- Cheat Commands ---

@sims4.commands.Command('jpe.link', command_type=sims4.commands.CommandType.Live)
def jpe_manual_link(_connection=None):
    output = sims4.commands.CheatOutput(_connection)
    link = JpeSpectralLink()
    link.connect()
    if link._connected:
        output("JPE Spectral Link established.")
    else:
        output("Link Failed. Verify JPE Studio is running.")

# Initialize on mod load
try:
    JpeSpectralLink().connect()
except:
    pass
