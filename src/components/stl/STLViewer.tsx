import React, { Suspense, Component, useState, ReactNode, ErrorInfo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, Environment } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from 'three'; // Imported for THREE.BufferGeometry type

// --- Error Boundary with TypeScript ---

// Define the props for the ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

// Define the state for the ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div className="p-4 text-red-500">Error loading 3D model. Please check the file and try again.</div>;
    }
    return this.props.children;
  }
}

// --- Model Component with TypeScript ---

function Model(): JSX.Element | null {
  // Explicitly type the geometry loaded by STLLoader
  const geometry = useLoader(STLLoader, "/BUBBLECODE-2.stl") as THREE.BufferGeometry;
  const [isVibrating, setIsVibrating] = useState(false);

  // Create spring animation for vibration
  const { vibrationScale, vibrationRotation } = useSpring({
    vibrationScale: isVibrating ? [0.0102, 0.0098, 0.0102] : [0.01, 0.01, 0.01],
    vibrationRotation: isVibrating ? [-Math.PI / 2 + 0.05, 0, 0.05] : [-Math.PI / 2, 0, 0],
    config: {
      mass: 1,
      tension: 400,
      friction: 10,
      duration: 150
    }
  });

  // Handle click event (type is inferred as () => void)
  const handleClick = () => {
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 150); // Stop vibrating after 150ms
  };
  // Guard clause if geometry isn't loaded
  if (!geometry) return null;

  return (
    <animated.mesh
      geometry={geometry}
      // @ts-ignore: @react-spring/three's animated types can be complex
      // and sometimes don't align perfectly with standard three.js prop types,
      // even when they function correctly at runtime.
      rotation={vibrationRotation}
      // @ts-ignore: Same reason as above for the scale prop.
      scale={vibrationScale}
      onClick={handleClick}
    >
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.2}
        roughness={0.2}
        transparent={true}
        opacity={0.7}
        clearcoat={1}
        clearcoatRoughness={0.2}
        ior={1.6}
        transmission={0.8}
        thickness={2}
        envMapIntensity={1.5}
        attenuationColor="#ffffff"
        attenuationDistance={0.5}
        reflectivity={0.5}
        iridescence={0.3}
        iridescenceIOR={1.3}
        sheen={1}
        sheenRoughness={0.4}
        sheenColor="#ffffff"
      />
    </animated.mesh>
  );
}

// --- Main App Component with TypeScript ---

export default function STLViewer(): JSX.Element {
  return (
    <ErrorBoundary>
      <div style={{ width: "100vw", height: "100vh", position: "relative"}}>
        <Canvas
          shadows={false}
          camera={{ position: [3, 3, 5], fov: 60 }}
          gl={{ antialias: true }}
        >
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 7.5]} intensity={1.2} />
          <spotLight position={[-5, 5, 0]} angle={0.15} penumbra={1} intensity={1.5} />
          <pointLight position={[-3, 0, -3]} intensity={0.5} />
          <pointLight position={[3, 0, 3]} intensity={0.5} />
          
          {/* Environment preset */}
          <Environment preset="apartment" background={false} blur={0.8} />
          
          {/* Suspense for model loading */}
          <Suspense fallback={
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#ffffff" wireframe />
            </mesh>
          }>
            <Stage shadows={false}>
              <Model />
            </Stage>
          </Suspense>
          
          {/* Controls */}
          <OrbitControls enableDamping autoRotate autoRotateSpeed={2} />
        </Canvas>
        
        {/* Loading text overlay */}
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          color: "white",
          pointerEvents: "none",
          fontSize: "14px",
          fontFamily: "sans-serif"
        }}>
          Loading model...
        </div>
      </div>
    </ErrorBoundary>
  );
}