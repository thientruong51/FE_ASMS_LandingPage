import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import {  Stack, Typography, Button, Paper } from "@mui/material";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";

const MODELS = {
  rooms: {
    small: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/PHONG_SMALL_bjalft.glb",
    smallAC: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847448/PHONG_SMALL_may_lanh_cyv1yy.glb",
    medium: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847447/PHONG_MEDIUM_zos1eu.glb",
    mediumAC: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847446/PHONG_MEDIUM_may_lanh_oskv0t.glb",
    large: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847446/PHONG_LARGE_hu7i9i.glb",
    largeAC: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847444/PHONG_LARGE_may_lanh_ab7z38.glb",
  },
  shelf: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847444/KE_1550X1057X2045_jvuubl.glb",
  boxes: {
    A: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/THUNG_A_uu6f3w.glb",
    B: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847443/THUNG_B_qp8ysr.glb",
    C: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847443/THUNG_C_wtagvu.glb",
    D: "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847446/THUNG_D_cs1w1m.glb",
  },
};

function ModelViewer({ url }: { url: string }) {
  const model = useGLTF(url);
  const scene = model.scene.clone();

  const box = new THREE.Box3().setFromObject(scene);
  const center = new THREE.Vector3();
  box.getCenter(center);
  scene.position.sub(center);

  return <primitive object={scene} />;
}

function Item3D({ url, position }: { url: string; position: [number, number, number] }) {
  const model = useGLTF(url);
  return <primitive object={model.scene.clone()} position={position} />;
}

export default function Step3Custom3D({
  room,
  onBack,
  onNext,
}: {
  room: { id: string; hasAC: boolean };
  onBack: () => void;
  onNext: (items: any[]) => void;
}) {
  const { t } = useTranslation("storageSize");
  const [items, setItems] = useState<
    { id: number; type: string; url: string; position: [number, number, number] }[]
  >([]);

  const roomModel =
    room.id === "small"
      ? room.hasAC
        ? MODELS.rooms.smallAC
        : MODELS.rooms.small
      : room.id === "medium"
      ? room.hasAC
        ? MODELS.rooms.mediumAC
        : MODELS.rooms.medium
      : room.hasAC
      ? MODELS.rooms.largeAC
      : MODELS.rooms.large;

  const handleAdd = (type: "shelf" | "A" | "B" | "C" | "D") => {
    const url = type === "shelf" ? MODELS.shelf : MODELS.boxes[type];
    const position: [number, number, number] = [
      Math.random() * 4 - 2,
      0,
      Math.random() * 4 - 2,
    ];
    setItems((prev) => [...prev, { id: Date.now(), type, url, position }]);
  };

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {t("custom3d.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("custom3d.desc")}
      </Typography>

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
              <Item3D key={item.id} url={item.url} position={item.position} />
            ))}
          </Suspense>
          <OrbitControls enablePan enableZoom />
          <Environment preset="warehouse" />
        </Canvas>
      </Paper>

      {/* ======= THANH CÔNG CỤ THÊM ITEM ======= */}
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button variant="outlined" onClick={() => handleAdd("shelf")}>
          {t("custom3d.addShelf")}
        </Button>
        <Button variant="outlined" onClick={() => handleAdd("A")}>
          {t("custom3d.addBox")} A
        </Button>
        <Button variant="outlined" onClick={() => handleAdd("B")}>
          {t("custom3d.addBox")} B
        </Button>
        <Button variant="outlined" onClick={() => handleAdd("C")}>
          {t("custom3d.addBox")} C
        </Button>
        <Button variant="outlined" onClick={() => handleAdd("D")}>
          {t("custom3d.addBox")} D
        </Button>
      </Stack>

      {/* ======= NÚT ĐIỀU HƯỚNG ======= */}
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

useGLTF.preload(MODELS.rooms.small);
useGLTF.preload(MODELS.rooms.smallAC);
useGLTF.preload(MODELS.rooms.medium);
useGLTF.preload(MODELS.rooms.mediumAC);
useGLTF.preload(MODELS.rooms.large);
useGLTF.preload(MODELS.rooms.largeAC);
useGLTF.preload(MODELS.shelf);
useGLTF.preload(MODELS.boxes.A);
useGLTF.preload(MODELS.boxes.B);
useGLTF.preload(MODELS.boxes.C);
useGLTF.preload(MODELS.boxes.D);
