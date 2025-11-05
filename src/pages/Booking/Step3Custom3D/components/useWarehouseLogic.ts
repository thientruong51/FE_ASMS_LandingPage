import { useRef } from "react";
import { MODELS, ROOM_LAYOUTS } from "../constants/models";

export type Item3DData = {
  id: string;
  type: string;
  url: string;
  position: [number, number, number];
};

export type RoomSize = {
  width: number;
  depth: number;
};

export function useWarehouseLogic(
  items: Item3DData[],
  setItems: React.Dispatch<React.SetStateAction<Item3DData[]>>,
  roomId: "small" | "medium" | "large",
  roomSize: RoomSize
) {
  const isAddingRef = useRef(false);

  const handleAdd = (type: "shelf" | "A" | "B" | "C" | "D") => {
    if (isAddingRef.current) return;
    isAddingRef.current = true;
    requestAnimationFrame(() => (isAddingRef.current = false));

    const url = type === "shelf" ? MODELS.shelf : MODELS.boxes[type];
    let position: [number, number, number];

    if (type === "shelf") {
      const shelves = items.filter((i: Item3DData) => i.type === "shelf");
      const cfg = ROOM_LAYOUTS[roomId];
      const totalShelvesAllowed = cfg.rows * cfg.perRow;

      if (shelves.length >= totalShelvesAllowed) return;

      const row = Math.floor(shelves.length / cfg.perRow);
      const col = shelves.length % cfg.perRow;

      const totalWidth =
        cfg.perRow * cfg.shelfWidth +
        (cfg.perRow - 1) * cfg.shelfSpacing;
      const startX = -totalWidth / 2 + cfg.shelfWidth / 2;
      const x = startX + row * (cfg.shelfWidth + cfg.shelfSpacing);
      const startZ =
        -roomSize.depth / 2 +
        cfg.shelfDepth / 2 +
        cfg.wallGap +
        col * (cfg.shelfDepth + cfg.rowGap);

      position = [x + cfg.offset.x, cfg.offset.y, startZ + cfg.offset.z];
    } else {
      const shelves = items.filter((i: Item3DData) => i.type === "shelf");
      const levelsY = [0.05, 0.55, 1.05, 1.57];

      if (shelves.length === 0) {
        // nếu chưa có kệ thì đặt trên sàn
        position = [
          (Math.random() - 0.5) * 2,
          -1.26,
          (Math.random() - 0.5) * 2,
        ];
      } else {
        const isD = type === "D";
        let shelfFound: Item3DData | null = null;
        let levelFound = -1;
        let sideFound: "left" | "right" = "left";

        // Tìm tầng còn chỗ
        for (const shelf of shelves) {
          const sp = shelf.position;
          const boxesOnShelf = items.filter(
            (b: Item3DData) =>
              b.type !== "shelf" &&
              Math.abs((b.position?.[0] ?? 0) - sp[0]) < 0.6 &&
              Math.abs((b.position?.[2] ?? 0) - sp[2]) < 0.6
          );

          for (let l = 0; l < levelsY.length; l++) {
            if (isD && l !== 3) continue;
            if (!isD && l === 3) continue;

            const boxesAtLevel = boxesOnShelf.filter(
              (b: Item3DData) =>
                Math.abs((b.position?.[1] ?? 0) - (sp[1] + levelsY[l])) < 0.1
            );
            if (boxesAtLevel.length >= 2) continue;

            const leftUsed = boxesAtLevel.some(
              (b: Item3DData) => (b.position?.[0] ?? 0) < sp[0]
            );
            const rightUsed = boxesAtLevel.some(
              (b: Item3DData) => (b.position?.[0] ?? 0) > sp[0]
            );

            if (!leftUsed || !rightUsed) {
              shelfFound = shelf;
              levelFound = l;
              sideFound = !leftUsed ? "left" : "right";
              break;
            }
          }
          if (shelfFound) break;
        }

        if (!shelfFound) {
          const last = shelves[shelves.length - 1];
          position = [
            last.position[0] + (Math.random() - 0.5) * 0.6,
            -1.26,
            last.position[2] + (Math.random() - 0.5) * 0.6,
          ];
        } else {
          const sp = shelfFound.position;
          const xOffset = sideFound === "left" ? -0.25 : 0.25;
          position = [sp[0] + xOffset - 0.25, sp[1] + levelsY[levelFound], sp[2]-0.05];
        }
      }
    }

    setItems((prev: Item3DData[]) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        url,
        position,
      },
    ]);
  };

  return { handleAdd };
}
