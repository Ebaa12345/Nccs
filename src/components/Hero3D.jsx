// 📁 src/components/Hero3D.jsx
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Torus, Stars, Float, Environment } from "@react-three/drei";

function Core() {
  const meshRef = useRef();
  const groupRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.25;
    meshRef.current.rotation.x += delta * 0.08;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Core distorted sphere */}
      <Sphere ref={meshRef} args={[1.3, 128, 128]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.42}
          speed={1.8}
          roughness={0.15}
          metalness={0.9}
          emissive="#3b82f6"
          emissiveIntensity={0.25}
        />
      </Sphere>

      {/* Outer wireframe rings (engineering feel) */}
      <Torus args={[2.1, 0.015, 16, 100]} rotation={[Math.PI / 2.2, 0, 0]}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.55} />
      </Torus>
      <Torus args={[2.4, 0.008, 16, 100]} rotation={[Math.PI / 2.8, Math.PI / 6, 0]}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </Torus>
      <Torus args={[1.75, 0.006, 16, 100]} rotation={[Math.PI / 1.8, -Math.PI / 5, 0]}>
        <meshBasicMaterial color="#a5b4fc" transparent opacity={0.3} />
      </Torus>
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    state.camera.position.x += (state.pointer.x * 0.6 - state.camera.position.x) * 0.03;
    state.camera.position.y += (state.pointer.y * 0.4 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Hero3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#818cf8" />
          <pointLight position={[-5, -3, -5]} intensity={0.8} color="#38bdf8" />

          <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.9}>
            <Core />
          </Float>

          <Stars radius={30} depth={40} count={1200} factor={2.2} saturation={0} fade speed={0.6} />
          <Environment preset="city" />
          <Rig />
        </Suspense>
      </Canvas>
    </div>
  );
}
