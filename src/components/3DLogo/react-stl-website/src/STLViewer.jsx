import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

function Model() {
  const geometry = useLoader(STLLoader, "/BUBBLECODE.stl");
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#eef2f4ff" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

export default function STLViewer() {
  return (
    <Canvas
      shadows
      camera={{ position: [3, 3, 5], fov: 60 }}
      style={{ width: "100vw", height: "100vh", background: "#111" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 7.5]} intensity={1.5} />
      <Suspense fallback={null}>
        <Stage>
          <Model />
        </Stage>
      </Suspense>
      <OrbitControls enableDamping autoRotate autoRotateSpeed={2} />
    </Canvas>
  );
}
