import { useGLTF } from "@react-three/drei";

export default function Item3D({
  url,
  position,
  type,
}: {
  url: string;
  position: [number, number, number];
  type: string;
}) {
  const model = useGLTF(url);
  const shouldRotate = ["shelf", "A", "C", "D"].includes(type);

  return (
    <primitive
      object={model.scene.clone()}
      position={position}
      rotation={shouldRotate ? [0, Math.PI / 2, 0] : [0, 0, 0]}
    />
  );
}
