# JPE Studio — jpe_live_sync.py (Epic 9)
# The Sims 4 Script-Mod bridge for real-time telemetry.

import socket
import json
import time
import threading
import sims4.commands
from sims4.tuning.instance_manager import InstanceManager

# Configuration
JPE_HOST = '127.0.0.1'
JPE_PORT = 9988 # Default JPE Studio Spectral Link Port

class JpeSpectralLink:
    _instance = None
    _socket = None
    _connected = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(JpeSpectralLink, cls).__new__(cls)
        return cls._instance

    def connect(self):
        if self._connected:
            return
        
        try:
            self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._socket.settimeout(1.0)
            self._socket.connect((JPE_HOST, JPE_PORT))
            self._connected = True
            self.send_event("HEARTBEAT", {"message": "Sims 4 Script Bridge Active", "latency": 1, "cpu": 2, "memory": 512})
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
            self._socket.sendall(raw_data.encode('utf-8'))
        except Exception:
            self._connected = False

# --- Hooks ---

def jpe_on_tuning_loaded(instance_manager):
    link = JpeSpectralLink()
    link.send_event("TUNING_EXEC", {"manager": str(instance_manager.TYPE)})

# Hooking into the InstanceManager
# Note: In a real script mod, this would use a proper @inject or override
# InstanceManager.on_start = jpe_on_tuning_loaded

@sims4.commands.Command('jpe.link', command_type=sims4.commands.CommandType.Live)
def jpe_manual_link(_connection=None):
    output = sims4.commands.CheatOutput(_connection)
    link = JpeSpectralLink()
    link.connect()
    if link._connected:
        output("JPE Spectral Link established.")
    else:
        output("Failed to establish link. Ensure JPE Studio is running.")

# Heartbeat thread
def heartbeat_worker():
    link = JpeSpectralLink()
    while True:
        if link._connected:
            link.send_event("HEARTBEAT", {"cpu": 5, "latency": 15, "memory": 1024})
        time.sleep(5)

# Uncomment to start heartbeat in game
# threading.Thread(target=heartbeat_worker, daemon=True).start()
