import struct
from typing import List, Dict, Set


class ResourceExtractor:
    """Extracts Resource Keys from Sims 4 DBPF .package files."""

    @staticmethod
    def extract_resource_keys(file_path: str) -> List[Dict[str, any]]:
        """
        Parses the DBPF header and index to extract all resource keys.
        Returns a list of dicts with 'type', 'group', 'instance' as hex strings,
        and meta information for extraction like 'offset', 'size', 'compressed_size', 'flags'.
        """
        keys = []
        try:
            with open(file_path, "rb") as f:
                header = f.read(96)
                if len(header) < 96:
                    return []

                magic = header[0:4].decode("ascii", errors="ignore")
                if magic != "DBPF":
                    return []

                index_count = struct.unpack("<I", header[36:40])[0]
                index_offset = struct.unpack("<I", header[44:48])[0]

                if index_offset == 0 or index_count == 0:
                    index_offset = struct.unpack("<I", header[60:64])[0]

                f.seek(index_offset)

                for _ in range(index_count):
                    entry = f.read(32)
                    if len(entry) < 32:
                        break

                    # Type(4), Group(4), Instance(8), Offset(4), Size(4), CompressedSize(4), Flags(4)
                    rtype, rgroup, rinst, roff, rsize, rcsize, rflags = struct.unpack(
                        "<IIQIIII", entry
                    )

                    keys.append(
                        {
                            "type": f"0x{rtype:08X}",
                            "group": f"0x{rgroup:08X}",
                            "instance": f"0x{rinst:016X}",
                            "offset": roff,
                            "size": rsize,
                            "compressed_size": rcsize,
                            "flags": rflags,
                        }
                    )
        except Exception as e:
            print(f"Error parsing package {file_path}: {e}")

        return keys

    @staticmethod
    def get_resource_content(file_path: str, resource_meta: Dict[str, any]) -> bytes:
        """
        Extracts and decompresses a specific resource from a DBPF package.
        """
        import zlib

        try:
            with open(file_path, "rb") as f:
                f.seek(resource_meta["offset"])

                # Check if it's compressed (flags bit 0 usually)
                is_compressed = resource_meta["flags"] & 0x01

                if is_compressed:
                    data = f.read(resource_meta["compressed_size"])
                    # Sims 4 uses ZLIB. If it starts with 0x78 0x9c, it's standard ZLIB.
                    # Sometimes there's a custom header (e.g. RefPack/QFS), but XML is usually ZLIB.
                    try:
                        return zlib.decompress(data)
                    except Exception:
                        # Fallback: some resources might have a 2-byte header (e.g. 0x5A42 for ZLIB)
                        if data.startswith(b"ZB"):  # ZLIB
                            return zlib.decompress(data[2:])
                        return data  # Return as is if decompression fails
                else:
                    return f.read(resource_meta["size"])
        except Exception as e:
            print(f"Extraction failed for {file_path}: {e}")
            return b""

    @staticmethod
    def find_conflicts(
        mod_resources: Dict[str, List[Dict[str, str]]],
    ) -> List[Dict[str, any]]:
        """
        Identify resource overlaps between different mods.
        mod_resources: { mod_id: [ {type, group, instance}, ... ] }
        """
        resource_map: Dict[
            str, Set[str]
        ] = {}  # "type-group-instance": {mod_id1, mod_id2}

        for mod_id, keys in mod_resources.items():
            for key in keys:
                res_id = f"{key['type']}-{key['group']}-{key['instance']}"
                if res_id not in resource_map:
                    resource_map[res_id] = set()
                resource_map[res_id].add(mod_id)

        conflicts = []
        for res_id, mods in resource_map.items():
            if len(mods) > 1:
                conflicts.append(
                    {"resource_id": res_id, "conflicting_mods": list(mods)}
                )

        return conflicts
