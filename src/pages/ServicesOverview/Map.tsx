import { Box } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useTranslation } from "react-i18next";

const MODEL_URL =
    "https://res.cloudinary.com/dkfykdjlm/image/upload/v1763061547/10_SMALL_6_MEDIUM_4_LARGE_dong_cua_rmwunc.glb";

/* ================= STEP CONFIG ================= */
/**
 * Quy ước:
 * step 1  -> gần cửa
 * step tăng -> đi sâu vào trong
 */
const STEP_DISTANCE = 1.6; // khoảng cách mỗi step
const BASE_OFFSET = 8;     // offset ban đầu ngoài cửa

/* ================= MAP ================= */

interface MapProps {
    step?: number | null;
    yawDeg?: number | null;
}

export default function Map({ step, yawDeg }: MapProps) {
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<any>(null);
    const [, setBounds] = useState<THREE.Box3 | null>(null);
    useTranslation("servicesOverview");

    return (
        <Box sx={{ width: "100%", bgcolor: "#f9fafc" }}>
           

            {/* ======= 3D VIEW ======= */}
            <Box
                sx={{
                    width: "100%",
                    height: "100vh",
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
                        <FacilityScene
                            controlsRef={controlsRef}
                            setBounds={setBounds}
                            step={step}
                            yawDeg={yawDeg}
                        />
                    </Suspense>

                    <OrbitControls
                        ref={controlsRef}
                        makeDefault
                        enablePan={false}
                        enableZoom={false}
                        enableRotate
                        minPolarAngle={Math.PI / 3.5}
                        maxPolarAngle={Math.PI / 1}

                    />

                    <Environment preset="warehouse" />
                </Canvas>
            </Box>
        </Box>
    );
}

/* ================= FACILITY SCENE ================= */

function FacilityScene({
    controlsRef,
    setBounds,
    step,
    yawDeg,
}: {
    controlsRef: any;
    setBounds: (b: THREE.Box3) => void;
    step?: number | null;
    yawDeg?: number | null;
}) {
    const model = useGLTF(MODEL_URL);
    const { camera, gl } = useThree();

    const bounds = useMemo(() => {
        const box = new THREE.Box3().setFromObject(model.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        return { box, center };
    }, [model.scene]);

    const targetRef = useRef<THREE.Vector3 | null>(null);

    /* ===== INIT CAMERA ===== */
    useEffect(() => {
        const { box, center } = bounds;
        setBounds(box);

        const camHeight = 1.2;
        const startZ = box.max.z + BASE_OFFSET;

        camera.position.set(center.x, camHeight, startZ);

        const LOOK_AHEAD = 1.2; // 0.8 – 1.5 là đẹp

        const target = new THREE.Vector3(
            center.x,
            camHeight,
            startZ - LOOK_AHEAD
        );
        targetRef.current = target;

        controlsRef.current?.target.copy(target);
        controlsRef.current?.update();
    }, [bounds, camera, controlsRef, setBounds]);

    /* ===== STEP CONTROL (FROM OUTSIDE) ===== */
    useEffect(() => {
        if (step == null || !targetRef.current) return;

        const { box, center } = bounds;

        const camHeight = 1.2;
        const desiredZ =
            box.max.z + BASE_OFFSET - step * STEP_DISTANCE;

        const minZ = box.min.z + 2;
        const maxZ = box.max.z + BASE_OFFSET;

        const finalZ = THREE.MathUtils.clamp(desiredZ, minZ, maxZ);

        const newTargetZ = finalZ - 0.5;

        gsap.to(camera.position, {
            x: center.x,
            y: camHeight,
            z: finalZ,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => controlsRef.current?.update(),
        });

        gsap.to(targetRef.current, {
            x: center.x,
            y: camHeight,
            z: newTargetZ,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => {
                controlsRef.current?.target.copy(targetRef.current!);
                controlsRef.current?.update();
            },
        });
    }, [step, bounds, camera, controlsRef]);
    useEffect(() => {
        if (!controlsRef.current || yawDeg == null) return;

        const controls = controlsRef.current;

        // yawDeg: độ → radian
        const targetAzimuth = THREE.MathUtils.degToRad(yawDeg);

        // OrbitControls không expose setter, nhưng có property nội bộ
        gsap.to(controls, {
            azimuthAngle: targetAzimuth,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => controls.update(),
        });
    }, [yawDeg, controlsRef]);
    /* ===== WHEEL CONTROL (MANUAL) ===== */
    useEffect(() => {
        if (!targetRef.current) return;

        const moveDir = new THREE.Vector3(0, 0, -1);
        const { box } = bounds;

        const minZ = box.min.z + 2;
        const maxZ = box.max.z + BASE_OFFSET;

        let isHovered = false;
        const handleEnter = () => (isHovered = true);
        const handleLeave = () => (isHovered = false);

        const handleWheel = (e: WheelEvent) => {
            if (!isHovered) return;
            e.preventDefault();

            const delta = e.deltaY > 0 ? STEP_DISTANCE : -STEP_DISTANCE;

            const newZ = THREE.MathUtils.clamp(
                camera.position.z + delta * moveDir.z,
                minZ,
                maxZ
            );

            const targetZ = newZ - 0.5;

            gsap.to(camera.position, {
                z: newZ,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: () => controlsRef.current?.update(),
            });

            gsap.to(targetRef.current!, {
                z: targetZ,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: () => {
                    controlsRef.current?.target.copy(targetRef.current!);
                    controlsRef.current?.update();
                },
            });
        };

        const el = gl.domElement;
        el.addEventListener("mouseenter", handleEnter);
        el.addEventListener("mouseleave", handleLeave);
        el.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            el.removeEventListener("mouseenter", handleEnter);
            el.removeEventListener("mouseleave", handleLeave);
            el.removeEventListener("wheel", handleWheel);
        };
    }, [bounds, camera, controlsRef, gl]);

    return <primitive object={model.scene} />;
}

useGLTF.preload(MODEL_URL);
