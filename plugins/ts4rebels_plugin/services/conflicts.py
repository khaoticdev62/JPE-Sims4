class ConflictDetector:
    def __init__(self, index_store, issue_store):
        self.index = index_store
        self.issues = issue_store

    def analyze(self):
        mods = self.index.list_mods()
        conflicts = []

        # Map resource IDs to mod IDs
        resource_map = {}  # "T-G-I": [mod_id1, mod_id2]

        for mod in mods:
            # Handle both list of dicts and list of objects
            mod_id = getattr(mod, "mod_id", None) or (
                mod.get("mod_id") if isinstance(mod, dict) else None
            )
            mod_files = getattr(mod, "files", []) or (
                mod.get("files", []) if isinstance(mod, dict) else []
            )

            for file_info in mod_files:
                for res in file_info.get("resources", []):
                    # Use signature if available, otherwise TGI
                    if res.get("signature"):
                        res_key = f"TUNING:{res['signature']}"
                    else:
                        res_key = f"{res['type']}-{res['group']}-{res['instance']}"

                    if res_key not in resource_map:
                        resource_map[res_key] = []
                    if mod_id not in resource_map[res_key]:
                        resource_map[res_key].append(mod_id)

        # Calculate scores based on overlaps
        overlap_scores = {}  # (mod_a, mod_b): { 'count': 0, 'samples': [] }
        for res_key, mod_ids in resource_map.items():
            if len(mod_ids) > 1:
                for i, a in enumerate(mod_ids):
                    for b in mod_ids[i + 1 :]:
                        pair = tuple(sorted((a, b)))
                        if pair not in overlap_scores:
                            overlap_scores[pair] = {"count": 0, "samples": []}
                        overlap_scores[pair]["count"] += 1
                        if len(overlap_scores[pair]["samples"]) < 3:
                            overlap_scores[pair]["samples"].append(res_key)

        for (id_a, id_b), data in overlap_scores.items():
            count = data["count"]
            score = min(100, count * 10)  # 10 overlap = 100% conflict
            samples_str = ", ".join(data["samples"])

            if score > 0:
                name_b = next(
                    (
                        getattr(m, "name", m.get("name") if isinstance(m, dict) else m)
                        for m in mods
                        if (
                            getattr(
                                m,
                                "mod_id",
                                m.get("mod_id") if isinstance(m, dict) else m,
                            )
                        )
                        == id_b
                    ),
                    id_b,
                )

                self.issues.create_issue(
                    mod_id=id_a,
                    severity="critical"
                    if score > 80
                    else "major"
                    if score > 40
                    else "minor",
                    category="Conflict",
                    summary=f"Conflict with {name_b}",
                    details=f"Shared {count} resources. Overlaps include: {samples_str}",
                )
                conflicts.append((id_a, id_b, score))

        return conflicts
