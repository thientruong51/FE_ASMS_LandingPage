import  { Suspense, useEffect, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";


function ModelViewer({ url }: { url: string }) {
  const model = useGLTF(url);
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!model?.scene) return;

    // compute bbox
    const box = new THREE.Box3().setFromObject(model.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // move model so its center is at origin
    model.scene.position.x += -center.x;
    model.scene.position.y += -center.y;
    model.scene.position.z += -center.z;

    // cast camera to perspective so TS knows about fov
    const cam = camera as THREE.PerspectiveCamera;

    // pick camera offsets based on model size
    const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
    const fov = (cam.fov || 70) * (Math.PI / 180);
    const camZ = (maxDim / 2) / Math.tan(fov / 2) * 1.5; // slight padding
    const camY = size.y * 0.35 + Math.max(0.2, maxDim * 0.05) - 0.3;

    cam.position.set(0, camY, camZ);
    cam.lookAt(new THREE.Vector3(0, camY * 0.2, 0));
    cam.updateProjectionMatrix();

    // update OrbitControls target if ref available
    if (controlsRef.current && typeof controlsRef.current.target?.set === "function") {
      controlsRef.current.target.set(0, camY * 0.2, 0);
      controlsRef.current.update();
    } else {
      // fallback: attempt to find traverse function safely (best-effort)
      const root = model.scene.parent || model.scene;
      if (root && typeof (root as any).traverse === "function") {
        // no-op here; kept only for completeness
      }
    }
  }, [model, camera, gl]);

  return (
    <>
      <primitive object={model.scene} />
      {/* Provide controls inside the viewer so we can target them via ref */}
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} />
    </>
  );
}

export default function BoxCard({
  label,
  size,
  priceMonth,
  priceWeek,
  selected,
  onSelect,
  modelUrl,
}: {
  label: string;
  size: string;
  priceMonth: string;
  priceWeek: string;
  selected: boolean;
  onSelect: () => void;
  id?: string;
  modelUrl?: string;
}) {
  const { t } = useTranslation("booking");

  // IntersectionObserver to defer rendering heavy canvas until in view
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

  // preload model for snappier UX
  useEffect(() => {
    if (modelUrl) {
      try {
        useGLTF.preload(modelUrl);
      } catch (e) {
        // ignore preload errors
      }
    }
  }, [modelUrl]);

  return (
    <Paper
      onClick={() => onSelect()}
      sx={{
        p: 3,
        borderRadius: 4,
        textAlign: "center",
        border: selected ? "2px solid #3CBD96" : "1px solid #ddd",
        boxShadow: selected
          ? "0 0 0 2px rgba(60,189,150,0.3)"
          : "0 4px 12px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Stack spacing={1.2} alignItems="center">
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {label}
        </Typography>

        <MuiBox
          ref={ref}
          sx={{
            width: 240,
            height: 140,
            position: "relative",
            bgcolor: "#f5f5f5",
            borderRadius: 1,
            overflow: "hidden",
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
              <CircularProgress size={24} />
            </MuiBox>
          )}

          {visible && modelUrl ? (
            <Canvas camera={{ position: [2, 2, 3], fov: 45 }}
            gl={{ toneMappingExposure: 0.3 }}>

              <Suspense fallback={null}>
                <ModelViewer url={modelUrl} />
              </Suspense>
              {/* We no longer place OrbitControls here — ModelViewer includes them */}
              <Environment preset="studio" />
            </Canvas>
          ) : visible && !modelUrl ? (
            <MuiBox
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                No preview
              </Typography>
            </MuiBox>
          ) : null}
        </MuiBox>

        <Typography variant="body2" color="text.secondary">
          {size}
        </Typography>

        <Stack spacing={0.3}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {priceMonth}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {priceWeek}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
