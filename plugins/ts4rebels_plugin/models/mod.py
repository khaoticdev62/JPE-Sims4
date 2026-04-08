
from dataclasses import dataclass, field

@dataclass
class Mod:
    mod_id: str
    name: str
    creator: str | None = None
    category: str | None = None
    files: list = field(default_factory=list)
