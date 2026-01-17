import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const Building = ({ position, height, color }: { position: [number, number, number], height: number, color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh position={position} ref={meshRef}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
      {/* Neon Edge */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, height, 1)]} />
        <lineBasicMaterial color={new THREE.Color(color).multiplyScalar(2)} toneMapped={false} />
      </lineSegments>
    </mesh>
  );
};

const ProceduralCity = () => {
  const buildings = useMemo(() => {
    const items = [];
    const size = 12;
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        if (Math.random() > 0.75) {
            const height = Math.random() * 10 + 3;
            const isNeon = Math.random() > 0.8;
            const color = isNeon ? (Math.random() > 0.5 ? '#0ea5e9' : '#d946ef') : '#1e293b';
            items.push({ position: [x * 2.5, height / 2, z * 2.5] as [number, number, number], height, color });
        }
      }
    }
    return items;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      <gridHelper args={[60, 60, 0x0ea5e9, 0x05050a]} position={[0, 0.1, 0]} />
    </group>
  );
};

export const CityScene: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas camera={{ position: [20, 15, 20], fov: 45 }}>
        <fog attach="fog" args={['#05050a', 5, 50]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#d946ef" />
        <ProceduralCity />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-black/20" /> {/* Dimmer overlay for text readability */}
    </div>
  );
};