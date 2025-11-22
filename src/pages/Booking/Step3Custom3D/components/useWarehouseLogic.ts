import { useRef } from "react";
import { MODELS, ROOM_LAYOUTS } from "../constants/models";
import { MODEL_SPECS } from "../constants/modelSpecs";

export type Item3DData = {
  id: string;
  type: string;
  url: string;
  position: [number, number, number];
};

export type RoomSize = { width: number; depth: number };

export function useWarehouseLogic(
  items: Item3DData[],
  setItems: React.Dispatch<React.SetStateAction<Item3DData[]>>,
  roomId: "small" | "medium" | "large",
  roomSize: RoomSize
) {
  const isAddingRef = useRef(false);

  const isCollidingWithAny = (
    pos: [number, number, number],
    boxSize: { width: number; depth: number; height: number },
    ignoreIds: Set<string> = new Set()
  ): boolean => {
    const [x, y, z] = pos;
    const hx = boxSize.width / 2;
    const hy = boxSize.height / 2;
    const hz = boxSize.depth / 2;

    for (const it of items) {
      if (it.type === "shelf") continue;
      if (ignoreIds.has(it.id)) continue;
      const spec = MODEL_SPECS[it.type] ?? { width: 0.5, depth: 0.5, height: 0.45 };
      const [ix, iy, iz] = it.position;
      const ihx = spec.width / 2;
      const ihy = spec.height / 2;
      const ihz = spec.depth / 2;
      const overlapX = Math.abs(ix - x) < hx + ihx - 0.001;
      const overlapY = Math.abs(iy - y) < hy + ihy - 0.001;
      const overlapZ = Math.abs(iz - z) < hz + ihz - 0.001;
      if (overlapX && overlapY && overlapZ) return true;
    }
    return false;
  };

  const findSlotOnShelves = (boxType: string, spacing = 0.01): [number, number, number] | null => {
    const cfg = ROOM_LAYOUTS[roomId];
    const shelves = items.filter((i) => i.type === "shelf");
    const levelsY = [0.05, 0.55, 1.05, 1.57];
    const boxSpec = MODEL_SPECS[boxType];
    const shelfSpec = MODEL_SPECS["shelf"];
    if (!boxSpec || !shelfSpec || !cfg) return null;

    const SLOT_FIRST_OFFSETS: Record<string, { offsetX: number; offsetZ: number }> = {
      A: { offsetX: -0.5, offsetZ: -0.05 },
      B: { offsetX: -0.58, offsetZ: 0.3 },
      C: { offsetX: -0.48, offsetZ: -0.03 },
      D: { offsetX: -0.5, offsetZ: -0.05 },
    };

    const typeOffsets = SLOT_FIRST_OFFSETS[boxType] ?? { offsetX: 0, offsetZ: 0 };

    for (const shelf of shelves) {
      const sp = shelf.position;
      const boxesOnShelf = items.filter(
        (b) =>
          b.type !== "shelf" &&
          Math.abs(b.position[0] - sp[0]) < shelfSpec.width / 2 + 0.2 &&
          Math.abs(b.position[2] - sp[2]) < shelfSpec.depth / 2 + 0.2
      );

      const slotsX = Math.max(1, Math.floor((shelfSpec.width + spacing) / (boxSpec.width + spacing)));
      const slotsZ = Math.max(1, Math.floor((shelfSpec.depth + spacing) / (boxSpec.depth + spacing)));
      const slotsPerLevel = slotsX * slotsZ;
      const stepX = boxSpec.width + spacing;
      const stepZ = boxSpec.depth + spacing;
      const firstOffsetX = -((slotsX + 0.1) * stepX) / 2 + typeOffsets.offsetX;
      const firstOffsetZ = -((slotsZ + 0.75) * stepZ) / 2 + typeOffsets.offsetZ;

      const occ = levelsY.map(() => 0);
      for (const b of boxesOnShelf) {
        const spec = MODEL_SPECS[b.type];
        if (!spec) continue;
        const bLevel = levelsY.findIndex((ly) => Math.abs((sp[1] + ly) - b.position[1]) < spec.height);
        if (bLevel >= 0) occ[bLevel] += 1;
      }

      const lowerThreeFull = occ[0] >= slotsPerLevel && occ[1] >= slotsPerLevel && occ[2] >= slotsPerLevel;
      const level4Full = occ[3] >= slotsPerLevel;

      for (let l = 0; l < levelsY.length; l++) {
        if (boxType === "D" && l !== 3) continue;
        if (boxType !== "D" && l === 3) continue;
        if (boxType === "D" && l === 3 && lowerThreeFull) continue;
        if (boxType !== "D" && l === 2 && level4Full) continue;

        for (let xi = 0; xi < slotsX; xi++) {
          const xPos = sp[0] + firstOffsetX + xi * stepX;
          for (let zi = 0; zi < slotsZ; zi++) {
            const zPos = sp[2] + firstOffsetZ + zi * stepZ;
            const posCandidate: [number, number, number] = [xPos, sp[1] + levelsY[l], zPos - 0.05];
            if (!isCollidingWithAny(posCandidate, boxSpec)) return posCandidate;
          }
        }
      }
    }
    return null;
  };

  const findNearestFreeAround = (
    spawnPos: [number, number, number],
    boxSpec: { width: number; depth: number; height: number },
    maxRadius = 1.5
  ): [number, number, number] | null => {
    const [sx, sy, sz] = spawnPos;
    const step = Math.max(boxSpec.width, boxSpec.depth) + 0.05;
    for (let r = 0; r <= Math.ceil(maxRadius / step); r++) {
      const radius = r * step;
      const dirs = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [dx, dz] of dirs) {
        const nx = sx + dx * radius;
        const nz = sz + dz * radius;
        const candidate: [number, number, number] = [nx, sy, nz];
        if (!isCollidingWithAny(candidate, boxSpec)) return candidate;
      }
    }
    return null;
  };

  const handleAdd = (type: "shelf" | "A" | "B" | "C" | "D", spawnPos?: [number, number, number]) => {
    if (isAddingRef.current) return;
    isAddingRef.current = true;
    requestAnimationFrame(() => (isAddingRef.current = false));

    const url = type === "shelf" ? MODELS.shelf : MODELS.boxes[type];
    const spec = MODEL_SPECS[type] ?? { width: 0.5, depth: 0.5, height: 0.45 };
    let position: [number, number, number] | undefined;

    if (spawnPos) {
      if (!isCollidingWithAny(spawnPos, spec)) position = spawnPos;
      else {
        const adjusted = findNearestFreeAround(spawnPos, spec);
        if (adjusted) position = adjusted;
      }
    }

    if (!position) {
      if (type === "shelf") {
        const shelves = items.filter((i) => i.type === "shelf");
        const cfg = ROOM_LAYOUTS[roomId];
        const totalShelvesAllowed = cfg.rows * cfg.perRow;
        if (shelves.length >= totalShelvesAllowed) return;
        const row = Math.floor(shelves.length / cfg.perRow);
        const col = shelves.length % cfg.perRow;
        const totalWidth = cfg.perRow * cfg.shelfWidth + (cfg.perRow - 1) * cfg.shelfSpacing;
        const startX = -totalWidth / 2 + cfg.shelfWidth / 2;
        const x = startX + row * (cfg.shelfWidth + cfg.shelfSpacing);
        const startZ = -roomSize.depth / 2 + cfg.shelfDepth / 2 + cfg.wallGap + col * (cfg.shelfDepth + cfg.rowGap);
        position = [x + cfg.offset.x, cfg.offset.y, startZ + cfg.offset.z];
      } else {
        const slot = findSlotOnShelves(type);
        if (slot) position = slot;
      }
    }

    if (!position) {
      const shelves = items.filter((i) => i.type === "shelf");
      if (shelves.length > 0) {
        const last = shelves[shelves.length - 1];
        const fallback: [number, number, number] = [
          last.position[0] + (Math.random() - 0.5) * 0.6,
          -1.26,
          last.position[2] + (Math.random() - 0.5) * 0.6,
        ];
        position = findNearestFreeAround(fallback, spec) ?? fallback;
      } else {
        const random: [number, number, number] = [(Math.random() - 0.5) * 2, -1.26, (Math.random() - 0.5) * 2];
        position = findNearestFreeAround(random, spec) ?? random;
      }
    }

    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        url,
        position: position as [number, number, number],
      },
    ]);
  };

  return { handleAdd };
}
