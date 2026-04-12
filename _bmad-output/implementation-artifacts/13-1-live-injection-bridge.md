# Story 13.1: Industrial Live-Link Inbound Bridge

## Description
As a modder, I want a real-time bridge between JPE Studio and The Sims 4 so that I can receive live error reports, analyze them with AI, and inject fixes without restarting the game.

## Acceptance Criteria
- [ ] JPE Studio starts a TCP Socket Server on port `9988` upon "Live Mode" activation.
- [ ] The `jpe_live_sync.py` bridge hooks `sims4.exception_log` and streams tracebacks to the server.
- [ ] JPE Studio captures these tracebacks and displays them in a high-fidelity "Spectral Diagnostics" feed.
- [ ] JPE Studio provides an "AI Flash-Fix" button that suggests code changes based on the traceback.
- [ ] JPE Studio can send a "RELOAD" command to the TS4 bridge to trigger `importlib.reload` or tuning instance refresh.

## Technical Context
- **Protocol**: JSON-serialized TCP packets. 
- **Exception Hook (Python)**:
    ```python
    import sims4.exception_log
    from functools import wraps
    @wraps(sims4.exception_log.log_exception)
    def jpe_hooked_exception(exception, message=None, *args, **kwargs):
        # socket.send(json.dumps({"type": "EXCEPTION", "trace": traceback.format_exc()}))
        return original_log_exception(exception, message=message, *args, **kwargs)
    ```
- **Hot-Reload (Python)**:
    ```python
    import importlib
    importlib.reload(target_module)
    ```
- **Hot-Reload (Tuning)**:
    ```python
    from sims4.tuning.instance_manager import InstanceManager
    # instance_manager.reload_instance(instance_id)
    ```

## Success Metrics
- Average latency from Game Exception to IDE Alert: < 500ms.
- 100% successful re-injection rate for script-mod logic changes.
- Successful AI traceback-to-source mapping.

## Status
Status: `ready-for-dev`
建设
