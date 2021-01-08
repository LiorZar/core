from typing import Any, Dict
from .const import clamp, zclamp, mix, fract


class Fn:
    def __init__(self, data: str):
        self.bytes = []
        self.vals = []
        vi: int = 0
        vf: float = 0
        for i in range(0, len(data), 2):
            vi = int(data[i : i + 2], 16)
            self.bytes.append(vi)
            vf = vi / 255.0
            self.vals.append(vf)

        self.size: int = len(self.bytes)
        self.factor: float = self.size - 1.0
        self.bytes.append(vi)
        self.vals.append(vf)

    def value(self, t: float) -> float:
        i: float = self.factor * zclamp(t)
        f: float = fract(i)
        j: int = int(i)
        return mix(f, self.vals[j], self.vals[j + 1])


class FNS:
    def __init__(self) -> None:
        self.fn: Dict[str, Fn] = {}

    def Parse(self, fns: Dict[str, Any]):
        for fname in fns:
            self.fn[fname] = Fn(fns[fname])

    def get(self, name: str) -> Fn:
        return self.fn.get(name)


gFN: FNS = FNS()
