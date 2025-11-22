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
  const shouldRotate = ["shelf"].includes(type);

  const obj = model.scene.clone();

  return (
    <primitive
      object={obj}
      position={position}
      rotation={shouldRotate ? [0, Math.PI / 2, 0] : [0, 0, 0]}
    />
  );
}
