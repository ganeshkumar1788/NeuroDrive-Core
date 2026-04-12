import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment, Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const HologramGrid = () => {
  const gridRef = useRef();
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 2) % 2;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      <gridHelper args={[100, 50, "#38BDF8", "#1e293b"]} rotation={[0, 0, 0]} ref={gridRef} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

const CarModel = () => {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) / 4;
    group.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.8, 1.8]} />
          <MeshDistortMaterial 
            color="#38BDF8" 
            speed={2} 
            distort={0.2} 
            radius={1}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Cabin */}
        <mesh position={[-0.2, 0.6, 0]}>
          <boxGeometry args={[1.8, 0.6, 1.4]} />
          <meshStandardMaterial color="#38BDF8" wireframe transparent opacity={0.4} />
        </mesh>

        {/* Energy Core */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <MeshWobbleMaterial color="#38BDF8" speed={3} factor={0.6} emissive="#38BDF8" emissiveIntensity={2} />
        </mesh>

        {/* Floating Rings */}
        {[1, 1.2, 1.4].map((r, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.02, 16, 100]} />
            <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1} />
          </mesh>
        ))}
      </Float>
    </group>
  );
};

export default function Scene() {
  const theme = useStore((state) => state.theme);
  const bgColor = theme === 'dark' ? '#020617' : '#f8fafc';
  const primaryColor = theme === 'dark' ? '#38BDF8' : '#334155';
  const secondaryColor = theme === 'dark' ? '#1E40AF' : '#94a3b8';

  return (
    <div className={`w-full h-full transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[8, 3, 12]} fov={40} />
        <color attach="background" args={[bgColor]} />
        
        <ambientLight intensity={theme === 'dark' ? 0.2 : 0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 2 : 1} color={primaryColor} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color={secondaryColor} />
        
        <Suspense fallback={null}>
          <CarModel />
          <HologramGrid />
          <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
          <Environment preset={theme === 'dark' ? "city" : "park"} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
