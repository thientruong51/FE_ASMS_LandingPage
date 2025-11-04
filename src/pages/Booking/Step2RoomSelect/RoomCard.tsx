import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useTranslation } from "react-i18next";

function ModelViewer({ url }: { url: string }) {
  const model = useGLTF(url);
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!model.scene) return;

    const box = new THREE.Box3().setFromObject(model.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    model.scene.position.x += -center.x;
    model.scene.position.y += -center.y;
    model.scene.position.z += -center.z;

    const camZ = size.z * 1.6;
    const camY = size.y * 0.5;
    camera.position.set(0, camY, camZ);
    if (controls) {
      (controls as any).target.set(0, camY * 0.8, 0);
      (controls as any).update();
    }
  }, [model.scene, camera, controls]);

  return <primitive object={model.scene} />;
}

export default function RoomCard({
  type,
  area,
  dimension,
  price,
  model,
  selected,
  onSelect,
}: {
  type: "small" | "medium" | "large";
  area: string;
  dimension: string;
  price: string;
  model: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation("storageSize");
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const name = t(`rooms.${type}.name`);
  const areaLabel = t("rooms.areaLabel");
  const priceLabel = t("rooms.priceLabel");

  return (
    <Paper
      ref={ref}
      onClick={onSelect}
      elevation={selected ? 6 : 3}
      sx={{
        flex: 1,
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        border: selected ? "2px solid #3CBD96" : "2px solid transparent",
        transform: selected ? "translateY(-4px)" : "none",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-6px)" },
      }}
    >
      {/* ========== VIEWER 3D ========== */}
      <Box
        sx={{
          height: 300,
          bgcolor: "#f5f5f5",
          position: "relative",
        }}
      >
        {!visible && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={30} color="primary" />
          </Box>
        )}

        {visible && (
          <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 2]} intensity={1.5} />
            <Suspense fallback={null}>
              <ModelViewer url={model} />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} />
            <Environment preset="warehouse" />
          </Canvas>
        )}
      </Box>

      {/* ========== TEXT ========== */}
      <Stack spacing={1.2} p={3} textAlign="center">
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {dimension}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {areaLabel}: {area}
        </Typography>

        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
          sx={{ mt: 1 }}
        >
          {price} / {priceLabel}
        </Typography>
      </Stack>
    </Paper>
  );
}

useGLTF.preload(
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847454/BASIC_jtoarm.glb"
);
useGLTF.preload(
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847449/BUSINESS_tstcam.glb"
);
useGLTF.preload(
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761847452/PREMIUM_rsg6ue.glb"
);
