import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function ModelViewer({ url }: { url: string }) {
  const model = useGLTF(url);
  const scene = model.scene.clone();

  const box = new THREE.Box3().setFromObject(scene);
  const center = new THREE.Vector3();
  box.getCenter(center);
  scene.position.sub(center);

  return <primitive object={scene} />;
}
