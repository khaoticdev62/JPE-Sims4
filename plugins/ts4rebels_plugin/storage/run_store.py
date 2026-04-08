
import uuid
import time

class RunStore:

    def __init__(self):
        self.runs = {}

    def create_run(self, type):
        run_id = str(uuid.uuid4())
        self.runs[run_id] = {
            "run_id": run_id,
            "type": type,
            "start": time.time()
        }
        return run_id
