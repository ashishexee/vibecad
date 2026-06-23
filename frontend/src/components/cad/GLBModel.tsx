import { useRef, useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface GLBModelProps {
  url: string;
  updating: boolean;
  onBoundsReady?: (sphere: THREE.Sphere) => void;
}

export function GLBModel({ url, updating, onBoundsReady }: GLBModelProps) {
  const gltf = useLoader(GLTFLoader, url);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!gltf || !groupRef.current) return;

    const scene = gltf.scene;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.material = new THREE.MeshLambertMaterial({
          color: new THREE.Color("#A8A8A8"),
          transparent: updating,
          opacity: updating ? 0.4 : 1,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.set(-center.x, -center.y, -center.z);

    if (!reportedRef.current && onBoundsReady) {
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      onBoundsReady(new THREE.Sphere(new THREE.Vector3(0, 0, 0), sphere.radius));
      reportedRef.current = true;
    }
  }, [gltf, onBoundsReady, camera]);

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
      <group position={[0, 0, 0]}>
        <mesh transparent opacity={updating ? 0.3 : 1}>
          <boxGeometry args={[0.001, 0.001, 0.001]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
}
