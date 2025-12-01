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
  const { camera } = useThree();

  useEffect(() => {
    if (!model?.scene) return;

    const box = new THREE.Box3().setFromObject(model.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    model.scene.position.x += -center.x;
    model.scene.position.y += -center.y;
    model.scene.position.z += -center.z;

    const camZ = Math.max(1, size.z * 1.6);
    const camY = Math.max(0.5, size.y * 0.5);
    camera.position.set(0, camY, camZ);

    // @ts-ignore
    if (camera.controls) {
      // @ts-ignore
      camera.controls.target.set(0, camY * 0.8, 0);
      // @ts-ignore
      camera.controls.update();
    }
  }, [model, camera]);

  return <primitive object={model.scene} />;
}

export default function RoomCard({
  type,
  area,
  dimension,
  price,
  model,
  desc,
  selected,
  onSelect,
  available,
}: {
  type: "small" | "medium" | "large" | string;
  area: string;
  dimension: string;
  price: string;
  model: string;
  desc?: string;
  selected: boolean;
  onSelect: () => void;
  available?: number;
}) {
  const { t } = useTranslation("storageSize");
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const controlsRef = useRef<any>(null);

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

  const name = t(`rooms.${type}.name`, { defaultValue: type });
  const areaLabel = t("rooms.areaLabel");
  const priceLabel = t("rooms.priceLabel");
  const descLabel = t("rooms.decsLabel");
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
        minWidth: 260,
      }}
    >
      <Box sx={{ height: 300, bgcolor: "#f5f5f5", position: "relative" }}>
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
          <Canvas
            camera={{ position: [2, 1, 3], fov: 60 }}
            onCreated={(state) => {
              (state.camera as any).controls = controlsRef.current;
            }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 2]} intensity={1.5} />

            <Suspense
              fallback={
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              }
            >
              <ModelViewer url={model} />
            </Suspense>

            <OrbitControls ref={controlsRef} enablePan={false} enableZoom={false} makeDefault />
            <Environment preset="warehouse" />
          </Canvas>
        )}
      </Box>

      <Stack spacing={1.2} p={3} textAlign="center">
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {name}
        </Typography>

        {/* <-- added description display (if provided) --> */}
        {desc && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
           {descLabel}: {desc}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          {dimension}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {areaLabel}: {area}
        </Typography>

        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mt: 1 }}>
          {price} / {priceLabel}
        </Typography>

        {typeof available === "number" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("priceTable.title", { mode: "" })}
            Sẵn sàng: {available} {available > 1 ? "phòng" : "phòng"}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
