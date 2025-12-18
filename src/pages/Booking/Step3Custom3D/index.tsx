import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Stack, Typography, Button, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import ModelViewer from "./components/ModelViewer";
import Item3D from "./components/Item3D";
import ToolToolbar from "./components/ToolToolbar";
import { useWarehouseLogic, type Item3DData, type RoomSize } from "./components/useWarehouseLogic";
import { MODELS, ROOM_LAYOUTS } from "./constants/models";
import { MODEL_SPECS } from "./constants/modelSpecs";

import { fetchShelfTypes, type ShelfTypeApi } from "../../../api/shelfType";
import { fetchContainerTypes, type ContainerTypeApi } from "../../../api/containerType";

export type RoomData =
  | { id: "small" | "medium" | "large"; hasAC: boolean }
  | { id: string; type?: string; hasAC: boolean };

type CountsPayload = {
  shelves: number;
  boxes: number;
  totalShelves?: number;
  byType?: Record<string, number>;
};

type Step3Custom3DProps = {
  room: RoomData;
  onBack: () => void;
  onNext: (payload: { items: Item3DData[]; counts: CountsPayload }) => void;
};

function mapNameToType(name: string): "small" | "medium" | "large" | null {
  const n = (name ?? "").toLowerCase();
  if (n.includes("small")) return "small";
  if (n.includes("medium")) return "medium";
  if (n.includes("large")) return "large";
  return null;
}

export default function Step3Custom3D({ room, onBack, onNext }: Step3Custom3DProps) {
  const { t } = useTranslation("storageSize");
  const [items, setItems] = useState<Item3DData[]>([]);
  const [_apiLoaded, setApiLoaded] = useState(false);

  const [shelfPriceMap, setShelfPriceMap] = useState<Record<string, number>>({});
  const [boxPricesMap, setBoxPricesMap] = useState<Record<string, number>>({});
  const [perShelfPrice, setPerShelfPrice] = useState<number | undefined>(undefined);
  const [perBoxPrice, setPerBoxPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [shelves, containers]: [ShelfTypeApi[], ContainerTypeApi[]] = await Promise.all([
          fetchShelfTypes(),
          fetchContainerTypes(),
        ]);

        if (!mounted) return;

        const shelfStorage = shelves.find((s) => (s.name ?? "").toLowerCase().includes("shelf_storage")) ?? shelves[0];
        if (shelfStorage) {
          if (shelfStorage.imageUrl) MODELS.shelf = shelfStorage.imageUrl;
          MODEL_SPECS.shelf = {
            width: Number(shelfStorage.width ?? shelfStorage.length ?? MODEL_SPECS.shelf.width),
            depth: Number(shelfStorage.length ?? shelfStorage.width ?? MODEL_SPECS.shelf.depth),
            height: Number(shelfStorage.height ?? MODEL_SPECS.shelf.height),
          };
        }

        const spm: Record<string, number> = {};
        for (const s of shelves) {
          const key = (s.name ?? s.shelfTypeId ?? `shelf_${s.shelfTypeId}`).toString();
          if (typeof s.price === "number") spm[key] = s.price;
        }
        if (shelfStorage && typeof shelfStorage.price === "number") setPerShelfPrice(shelfStorage.price);
        setShelfPriceMap(spm);

        const mapKey = (txt: string) => txt.toLowerCase().replace(/_storage$/i, "").replace(/[^a-z]/g, "");
        const bpm: Record<string, number> = {};
        for (const ct of containers) {
          const name = (ct.type ?? ct.containerTypeId ?? "").toString();
          if (!/storage/i.test(name)) continue;
          const key = mapKey(name);
          const upper = key.toUpperCase();
          if (!["A", "B", "C", "D"].includes(upper)) continue;

          if (ct.imageUrl) (MODELS.boxes as any)[upper] = ct.imageUrl;
          MODEL_SPECS[upper] = {
            width: Number(ct.length ?? ct.width ?? MODEL_SPECS[upper]?.width ?? 0.5),
            depth: Number(ct.width ?? ct.length ?? MODEL_SPECS[upper]?.depth ?? 0.5),
            height: Number(ct.height ?? MODEL_SPECS[upper]?.height ?? 0.45),
          };

          if (typeof ct.price === "number") bpm[upper] = ct.price;
        }

        const firstContainer = containers.find(Boolean);
        if (firstContainer && typeof firstContainer.price === "number") setPerBoxPrice(firstContainer.price);
        setBoxPricesMap(bpm);

        try {
          const drei = await import("@react-three/drei");
          if (MODELS.shelf) drei.useGLTF.preload(MODELS.shelf);
          for (const k of ["A", "B", "C", "D"]) {
            const url = (MODELS.boxes as any)[k];
            if (url) drei.useGLTF.preload(url);
          }
        } catch {
          // ignore
        }

        setApiLoaded(true);
      } catch (e) {
        setApiLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const roomKey: "small" | "medium" | "large" = useMemo(() => {
    if ((room as any).type) {
      const r = mapNameToType((room as any).type);
      if (r) return r;
    }
    if (room.id === "small" || room.id === "medium" || room.id === "large") return room.id;
    const mapped = mapNameToType((room as any).name ?? room.id);
    if (mapped) return mapped;
    return "small";
  }, [room]);

  const roomSize: RoomSize = useMemo(() => {
    switch (roomKey) {
      case "small":
        return { width: 3.3, depth: 1.8 };
      case "medium":
        return { width: 3.3, depth: 3.2 };
      default:
        return { width: 4.8, depth: 3.2 };
    }
  }, [roomKey]);

  const { handleAdd } = useWarehouseLogic(items, setItems, roomKey, roomSize);

  const roomModel = useMemo(() => {
    const baseKey = roomKey as keyof typeof MODELS.rooms;
    const acKey = `${roomKey}AC` as keyof typeof MODELS.rooms;
    if ((room as any).hasAC && MODELS.rooms[acKey]) return MODELS.rooms[acKey] as string;
    if (MODELS.rooms[baseKey]) return MODELS.rooms[baseKey] as string;
    return MODELS.rooms.small as string;
  }, [roomKey, (room as any).hasAC]);

  const layout = (ROOM_LAYOUTS as any)[roomKey];
  const totalShelves = layout ? layout.rows * layout.perRow : 0;

  const handleRemoveOne = (type: string) => {
    const idx = items.findIndex((i) => i.type === type);
    if (idx === -1) return;
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const handleRemoveAll = (type: string) => {
    setItems(items.filter((i) => i.type !== type));
  };

  const countByType = (type: string) => items.filter((i) => i.type === type).length;

  const computeCounts = (): CountsPayload => {
    const byType: Record<string, number> = {};
    for (const it of items) {
      const key = (it.type ?? "unknown").toString();
      byType[key] = (byType[key] ?? 0) + 1;
    }
    const shelves = items.filter((i) => /shelf/i.test(i.type ?? "")).length;
    const boxes = items.filter((i) => {
      const t = (i.type ?? "").toString();
      if (/^[ABCD]$/i.test(t)) return true;
      if (/box|container|crate/i.test(t)) return true;
      return false;
    }).length;

    return { shelves, boxes, totalShelves: totalShelves || undefined, byType };
  };

  const resolvePriceForType = (type: string | undefined): number | undefined => {
    if (!type) return undefined;
    if (shelfPriceMap[type] !== undefined) return shelfPriceMap[type];
    if (/shelf/i.test(type)) {
      const found = Object.keys(shelfPriceMap).find((k) => k.toLowerCase().includes("shelf") || k.toLowerCase() === type.toLowerCase());
      if (found) return shelfPriceMap[found];
      return perShelfPrice;
    }
    const up = type.toUpperCase();
    if (boxPricesMap[up] !== undefined) return boxPricesMap[up];
    if (/^[ABCD]$/i.test(type) || /box|container|crate/i.test(type)) return perBoxPrice;
    return undefined;
  };

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {t("custom3d.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {t("custom3d.desc")}
      </Typography>

      <Paper sx={{ width: "100%", height: 500, borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.3} />
          <Suspense fallback={null}>
            <ModelViewer url={roomModel} />
            {items.map((item) => (
              <Item3D key={item.id} url={item.url} position={item.position} type={item.type} />
            ))}
          </Suspense>
          <OrbitControls enablePan enableZoom />
          <Environment preset="warehouse" />
        </Canvas>
      </Paper>

      <ToolToolbar
        totalShelves={totalShelves}
        countByType={countByType}
        onAdd={(type) => handleAdd(type as any)}
        onRemoveOne={handleRemoveOne}
        onRemoveAll={handleRemoveAll}
      />

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack}>
          {t("actions.back")}
        </Button>
        <Button
          variant="contained"
          disabled={items.length === 0}
          onClick={() => {
            const counts = computeCounts();

            const itemsWithPrices: Item3DData[] = items.map((it) => {
              const resolved = resolvePriceForType(it.type?.toString() ?? "");
              return {
                ...it,
                price: resolved !== undefined ? resolved : (it as any).price,
              } as Item3DData & { price?: number };
            });

            const countsWithPricing = {
              ...counts,
              pricingInfo: { perShelfPrice, perBoxPrice, boxPricesMap, shelfPriceMap },
            } as CountsPayload & { pricingInfo?: any };

            onNext({ items: itemsWithPrices, counts: countsWithPricing });
          }}
        >
          {t("actions.next")}
        </Button>
      </Stack>
    </Stack>
  );
}
