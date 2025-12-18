import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

const MODEL_URL =
  "https://res.cloudinary.com/dkfykdjlm/image/upload/v1761849473/10_SMALL_6_MEDIUM_4_LARGE_yhmtao.glb";

export default function FacilityTour() {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const [, setBounds] = useState<THREE.Box3 | null>(null);
const { t } = useTranslation("servicesOverview");
  return (
    <Box sx={{ width: "100%", bgcolor: "#f9fafc" }}>
      {/* ======= PHẦN TEXT ======= */}
      <Container sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h3" fontWeight={700} color= "primary.main">
            {t("facility.title")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700 }}
          >
            {t("facility.desc")}
          </Typography>
          <Button
           variant="contained"
                    sx={{
                      backgroundColor: "#3CBD96",
                      color: "white",
                      borderRadius: "999px",
                      fontWeight: 600,
                      textTransform: "none",
                      px: 3,
                      "&:hover": { backgroundColor: "#35a982" },
                    }}
            onClick={() => {
              const canvas = document.querySelector("canvas");
              if (canvas?.requestFullscreen) canvas.requestFullscreen();
            }}
          >{t("facility.btn")}   
          </Button>
        </Stack>
      </Container>

      {/* ======= PHẦN 3D VIEWER ======= */}
      <Box
        sx={{
          width: "100%",
          height: "100vh", 
          borderRadius: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Canvas
          camera={{ position: [0, 2, 20], fov: 45 }}
          onCreated={({ camera }) =>
            (cameraRef.current = camera as THREE.PerspectiveCamera)
          }
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[30, 40, 20]} intensity={1.5} />
          <Suspense fallback={null}>
            <FacilityScene controlsRef={controlsRef} setBounds={setBounds} />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            minPolarAngle={Math.PI / 3.5}
            maxPolarAngle={Math.PI / 1}
          />

          <Environment preset="warehouse" />
        </Canvas>
      </Box>
    </Box>
  );
}

function FacilityScene({
  controlsRef,
  setBounds,
}: {
  controlsRef: any;
  setBounds: (b: THREE.Box3) => void;
}) {
  const model = useGLTF(MODEL_URL);
  const { camera, gl } = useThree();

  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { box, size, center };
  }, [model.scene]);

  useEffect(() => {
    const { box, center } = bounds;
    setBounds(box);

    const camHeight = 1.2;
    const offset = 8;

    // 🚪 Vị trí ban đầu
    const startZ = box.max.z + offset;
    camera.position.set(center.x, camHeight, startZ);

    // 🎯 Target ban đầu
    const target = new THREE.Vector3(center.x, camHeight, startZ - 0.01);

    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }

    // 🔹 Di chuyển dọc trục Z-
    const moveDir = new THREE.Vector3(0, 0, -1);

    // 🧱 Giới hạn di chuyển
    const minZ = box.min.z + 2;
    const maxZ = box.max.z + offset;
    const minY = box.min.y + 1;
    const maxY = box.max.y - 1;

    let isHovered = false;
    const handleEnter = () => (isHovered = true);
    const handleLeave = () => (isHovered = false);

    const handleWheel = (e: WheelEvent) => {
      if (!isHovered) return;
      e.preventDefault();

      const step = e.deltaY > 0 ? 1.5 : -1.5;
      const newPos = camera.position
        .clone()
        .add(moveDir.clone().multiplyScalar(step));
      const newTarget = target.clone().add(moveDir.clone().multiplyScalar(step));

      newPos.z = THREE.MathUtils.clamp(newPos.z, minZ, maxZ);
      newPos.y = THREE.MathUtils.clamp(newPos.y, minY, maxY);
      newTarget.z = THREE.MathUtils.clamp(newTarget.z, minZ - 0.5, maxZ - 0.5);

      gsap.to(camera.position, {
        x: center.x,
        y: newPos.y,
        z: newPos.z,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => controlsRef.current?.update(),
      });

      gsap.to(target, {
        x: center.x,
        y: newTarget.y,
        z: newTarget.z,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          if (controlsRef.current) {
            controlsRef.current.target.copy(target);
            controlsRef.current.update();
          }
        },
      });
    };

    const canvasEl = gl.domElement;
    canvasEl.addEventListener("mouseenter", handleEnter);
    canvasEl.addEventListener("mouseleave", handleLeave);
    canvasEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvasEl.removeEventListener("mouseenter", handleEnter);
      canvasEl.removeEventListener("mouseleave", handleLeave);
      canvasEl.removeEventListener("wheel", handleWheel);
    };
  }, [bounds, camera, controlsRef, gl, setBounds]);

  return <primitive object={model.scene} />;
}

useGLTF.preload(MODEL_URL);
