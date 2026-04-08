
class TranslatorService:

    def __init__(self, index_store, run_store, issue_store):
        self.index = index_store
        self.runs = run_store
        self.issues = issue_store

    def translate(self, mod_ids, mode="normal"):
        results = []

        for mod_id in mod_ids:
            mod = self.index.get_mod(mod_id)

            try:
                # Placeholder for JPE core pipeline integration
                status = "translated" if mode != "dry_run" else "dry_run_ok"

            except Exception as e:
                self.issues.create_issue(
                    mod_id=mod_id,
                    severity="major",
                    category="Translation",
                    summary=str(e)
                )
                status = "failed"

            results.append({"mod_id": mod_id, "status": status})

        return results
