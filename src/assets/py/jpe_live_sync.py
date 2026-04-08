import sims4.commands
import sims4.api
import services
import logging
from sims4.utils import flexmethod
from functools import wraps

# JPE Studio — Industrial Live Bridge
# Optimized for high-fidelity engine telemetry and real-time JPE translation.

class JpeLiveSync:
    """
    JpeLiveSync - Synchronizes Sims 4 engine state with JRE Studio.
    Passively monitors for exceptions and broadcasts 'Spectral' heartbeat pulses.
    """
    
    VERSION = "2.1.0-Industrial"
    LOG_HEADER = "[JPE-LIVE]"

    @classmethod
    def broadcast(cls, message, type="INFO"):
        """Broadcasts a tagged message to the Client.log for the IDE to ingest."""
        print(f"{cls.LOG_HEADER} [{type}] {message}")

    @classmethod
    def init_sync(cls):
        cls.broadcast(f"Engine Link Established: {cls.VERSION}", "SYNC")

# --- Command Interface (Industrial Discovery) ---

@sims4.commands.Command('jpe.ping', command_type=sims4.commands.CommandType.Live)
def jpe_ping(_connection=None):
    output = sims4.commands.CheatOutput(_connection)
    output("JPE Engine Link: ACTIVE")
    JpeLiveSync.broadcast("Manual Ping Received", "SYNC")

@sims4.commands.Command('jpe.debug', command_type=sims4.commands.CommandType.Live)
def jpe_debug(mode=None, _connection=None):
    output = sims4.commands.CheatOutput(_connection)
    output(f"JPE Debug Mode: {mode or 'DEFAULT'}")
    JpeLiveSync.broadcast(f"Debug Mode Shifted: {mode}", "DEBUG")

# --- Exception Hook (FR22: Live Alert Translation) ---

try:
    import sims4.exception_log
    original_log_exception = sims4.exception_log.log_exception

    @wraps(original_log_exception)
    def jpe_hooked_log_exception(exception, message=None, *args, **kwargs):
        # Broadcast the exception to JPE Studio before the standard game log
        JpeLiveSync.broadcast(f"EXCEPTION: {message or str(exception)}", "EXCEPTION")
        return original_log_exception(exception, message=message, *args, **kwargs)

    sims4.exception_log.log_exception = jpe_hooked_log_exception
    JpeLiveSync.broadcast("Exception Hook Injected Successfully", "BOOT")

except Exception as e:
    JpeLiveSync.broadcast(f"Failed to inject Exception Hook: {str(e)}", "ERROR")

# Finalize Ignition
JpeLiveSync.init_sync()
