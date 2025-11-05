import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Stack, Typography, Button, Paper } from "@mui/material";
import { Suspense, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ModelViewer from "./components/ModelViewer";
import Item3D from "./components/Item3D";
import { useWarehouseLogic, type Item3DData, type RoomSize } from "./components/useWarehouseLogic";
import { MODELS, ROOM_LAYOUTS } from "./constants/models";

// ===== KIỂU DỮ LIỆU CHO ROOM =====
export type RoomData = {
  id: "small" | "medium" | "large";
  hasAC: boolean;
};

type Step3Custom3DProps = {
  room: RoomData;
  onBack: () => void;
  onNext: (items: Item3DData[]) => void;
};

export default function Step3Custom3D({ room, onBack, onNext }: Step3Custom3DProps) {
  const { t } = useTranslation("storageSize");
  const [items, setItems] = useState<Item3DData[]>([]);

  // ===== KÍCH THƯỚC PHÒNG =====
  const roomSize: RoomSize = useMemo(() => {
    switch (room.id) {
      case "small":
        return { width: 3.3, depth: 1.8 };
      case "medium":
        return { width: 3.3, depth: 3.2 };
      default:
        return { width: 4.8, depth: 3.2 };
    }
  }, [room.id]);

  // ===== LOGIC THÊM ITEM =====
  const { handleAdd } = useWarehouseLogic(items, setItems, room.id, roomSize);

  // ===== CHỌN MÔ HÌNH PHÒNG =====
  const roomModel =
    room.hasAC
      ? (MODELS.rooms[`${room.id}AC` as keyof typeof MODELS.rooms])
      : MODELS.rooms[room.id];

  const totalShelves =
    ROOM_LAYOUTS[room.id].rows * ROOM_LAYOUTS[room.id].perRow;

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {t("custom3d.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("custom3d.desc")}
      </Typography>

      {/* ===== CANVAS 3D ===== */}
      <Paper
        sx={{
          width: "100%",
          height: 500,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.3} />
          <Suspense fallback={null}>
            <ModelViewer url={roomModel} />
            {items.map((item) => (
              <Item3D
                key={item.id}
                url={item.url}
                position={item.position}
                type={item.type}
              />
            ))}
          </Suspense>
          <OrbitControls enablePan enableZoom />
          <Environment preset="warehouse" />
        </Canvas>
      </Paper>

      {/* ===== THANH CÔNG CỤ ===== */}
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button
          variant="outlined"
          onClick={() => handleAdd("shelf")}
          disabled={
            items.filter((i) => i.type === "shelf").length >= totalShelves
          }
        >
          {t("custom3d.addShelf")}
        </Button>

        {(["A", "B", "C", "D"] as const).map((type) => (
          <Button key={type} variant="outlined" onClick={() => handleAdd(type)}>
            {t("custom3d.addBox")} {type}
          </Button>
        ))}
      </Stack>

      {/* ===== NÚT ĐIỀU HƯỚNG ===== */}
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onBack}>
          {t("actions.back")}
        </Button>
        <Button
          variant="contained"
          disabled={items.length === 0}
          onClick={() => onNext(items)}
        >
          {t("actions.next")}
        </Button>
      </Stack>
    </Stack>
  );
}
