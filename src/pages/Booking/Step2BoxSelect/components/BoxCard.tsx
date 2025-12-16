import { Suspense, useEffect, useRef, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Box as MuiBox,
  CircularProgress,
} from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

function ModelViewer({ url }: { url: string }) {
  const model = useGLTF(url);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

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

    const cam = camera as THREE.PerspectiveCamera;
    const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
    const fov = (cam.fov || 70) * (Math.PI / 180);
    const camZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5;
    const camY = size.y * 0.35 + Math.max(0.2, maxDim * 0.05) - 0.3;

    cam.position.set(0, camY, camZ);
    cam.lookAt(new THREE.Vector3(0, camY * 0.2, 0));
    cam.updateProjectionMatrix();

    if (controlsRef.current && typeof controlsRef.current.target?.set === "function") {
      controlsRef.current.target.set(0, camY * 0.2, 0);
      controlsRef.current.update();
    }
  }, [model, camera]);

  return (
    <>
      <primitive object={model.scene} />
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} />
    </>
  );
}

function renderPrice(p?: string | number) {
  if (p === undefined || p === null || p === "") return "";
  if (typeof p === "number") return `${p.toLocaleString()} đ`;
  return String(p);
}

function isImageUrl(url?: string) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(url);
}

export default function BoxCard({
  label,
  size,
  priceMonth,
  priceWeek,
  selected,
  onSelect,
  modelUrl,

  qtyAc,
  qtyNor,
}: {
  label: string;
  size: string;
  priceMonth?: string | number;
  priceWeek?: string | number;
  selected: boolean;
  onSelect: () => void;
  id?: string;
  modelUrl?: string;

  // 👉 thêm mới
  qtyAc?: number | null;
  qtyNor?: number | null;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
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

  // preload GLTF if modelUrl looks like GLTF (not an image)
  useEffect(() => {
    if (!modelUrl) return;
    if (!isImageUrl(modelUrl)) {
      try {
        (useGLTF as any).preload?.(modelUrl);
      } catch {
        // ignore
      }
    }
  }, [modelUrl]);

  return (
    <Paper
      onClick={() => onSelect()}
      sx={{
        p: 2.2,
        borderRadius: 4,
        textAlign: "center",
        border: selected ? "2px solid #3CBD96" : "1px solid #eee",
        boxShadow: selected
          ? "0 0 0 2px rgba(60,189,150,0.08)"
          : "0 4px 18px rgba(0,0,0,0.03)",
        cursor: "pointer",
        transition: "transform .16s ease, box-shadow .16s ease",
        "&:hover": { transform: "translateY(-6px)" },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
          {label}
        </Typography>

        <MuiBox
          ref={ref}
          sx={{
            width: "100%",
            height: 120,
            position: "relative",
            bgcolor: "#fafafa",
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!visible && (
            <MuiBox
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={20} />
            </MuiBox>
          )}

          {visible && modelUrl && isImageUrl(modelUrl) ? (
            <img
              src={modelUrl}
              alt={label}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : visible && modelUrl && !isImageUrl(modelUrl) ? (
            <Canvas
              camera={{ position: [2, 2, 3], fov: 45 }}
              style={{ width: "100%", height: "100%" }}
              gl={{ toneMappingExposure: 0.3 }}
            >
              <Suspense fallback={null}>
                <ModelViewer url={modelUrl} />
              </Suspense>
              <Environment preset="studio" />
            </Canvas>
          ) : visible && !modelUrl ? (
            <Typography variant="caption" color="text.secondary">
              No preview
            </Typography>
          ) : null}
        </MuiBox>

        {/* size */}
        <Typography variant="caption" color="text.secondary">
          {size}
        </Typography>

        {/* 👉 Hiển thị số lượng tại đây */}
        {(qtyAc != null || qtyNor != null) && (
          <Stack spacing={0.3} sx={{ mt: 0.5 }}>
            {qtyAc != null && (
              <Typography variant="caption" color="primary.main" fontWeight={600}>
                AC: {qtyAc}
              </Typography>
            )}

            {qtyNor != null && (
              <Typography variant="caption" color="secondary.main" fontWeight={600}>
                NOR: {qtyNor}
              </Typography>
            )}
          </Stack>
        )}

        {/* price */}
        <Stack spacing={0.3}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {renderPrice(priceMonth)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {renderPrice(priceWeek)}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
