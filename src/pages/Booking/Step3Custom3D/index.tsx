// pages/Booking/Step3Custom3D.tsx
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Stack, Typography, Button, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import ModelViewer from "./components/ModelViewer";
import Item3D from "./components/Item3D";
import ToolToolbar from "./components/ToolToolbar";
import { useWarehouseLogic, type Item3DData, type RoomSize } from "./components/useWarehouseLogic";
import { MODELS, ROOM_LAYOUTS } from "./constants/models";

export type RoomData = { id: "small" | "medium" | "large"; hasAC: boolean; };

type Step3Custom3DProps = {
  room: RoomData;
  onBack: () => void;
  onNext: (items: Item3DData[]) => void;
};

export default function Step3Custom3D({ room, onBack, onNext }: Step3Custom3DProps) {
  const { t } = useTranslation("storageSize");
  const [items, setItems] = useState<Item3DData[]>([]);

  const roomSize: RoomSize = useMemo(() => {
    switch (room.id) {
      case "small": return { width: 3.3, depth: 1.8 };
      case "medium": return { width: 3.3, depth: 3.2 };
      default: return { width: 4.8, depth: 3.2 };
    }
  }, [room.id]);

  const { handleAdd } = useWarehouseLogic(items, setItems, room.id, roomSize);

  const roomModel = room.hasAC ? MODELS.rooms[`${room.id}AC` as keyof typeof MODELS.rooms] : MODELS.rooms[room.id];
  const totalShelves = ROOM_LAYOUTS[room.id].rows * ROOM_LAYOUTS[room.id].perRow;

  // remove helpers
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

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {/* hiển thị song ngữ tiêu đề */}
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
        <Button variant="outlined" onClick={onBack}>{t("actions.back")} </Button>
        <Button variant="contained" disabled={items.length === 0} onClick={() => onNext(items)}>
          {t("actions.next")} 
        </Button>
      </Stack>
    </Stack>
  );
}
