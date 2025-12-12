import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Ornament, TreeState } from '../types';

interface OrnamentsProps {
  ornaments: Ornament[];
  treeState: TreeState;
}

const Polaroid: React.FC<{ data: Ornament; treeState: TreeState }> = ({ data, treeState }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(data.logoUrl);
  
  // Random offset for swinging animation
  const randomOffset = useMemo(() => Math.random() * 100, []);
  const rotateSpeed = useMemo(() => Math.random() * 0.5 + 0.5, []);

  // Animation Refs
  const currentPos = useRef(new THREE.Vector3(...data.scatterPosition)); // Start scattered
  const currentRot = useRef(new THREE.Euler(0, 0, 0));
  
  // Calculate target rotation for tree state (slightly random z-tilt)
  const treeRotation = useMemo(() => new THREE.Euler(0, 0, (Math.random() - 0.5) * 0.2), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // 1. POSITION LOGIC
    let targetPos = new THREE.Vector3();
    if (treeState === TreeState.TREE_SHAPE) {
      targetPos.set(...data.position);
    } else {
      targetPos.set(...data.scatterPosition);
      
      // Add "floating in space" drift when scattered
      targetPos.y += Math.sin(time * 0.5 + randomOffset) * 2;
      targetPos.x += Math.cos(time * 0.3 + randomOffset) * 2;
    }

    // Smoothly lerp position
    const lerpSpeed = treeState === TreeState.TREE_SHAPE ? 0.05 : 0.02; // Slower when floating away
    currentPos.current.lerp(targetPos, lerpSpeed);
    meshRef.current.position.copy(currentPos.current);


    // 2. ROTATION LOGIC
    if (treeState === TreeState.TREE_SHAPE) {
      // In tree mode: Face outward + slight swing like it's hanging
      // Look at center (0, y, 0) then flip to face out
      meshRef.current.lookAt(0, meshRef.current.position.y, 0);
      meshRef.current.rotateY(Math.PI); // Flip to face camera out
      
      // Add slight "wind" swing
      const swing = Math.sin(time * 2 + randomOffset) * 0.05;
      meshRef.current.rotation.z += swing;
      meshRef.current.rotation.x += swing * 0.5;

    } else {
      // In scattered mode: Tumble slowly
      meshRef.current.rotation.x += delta * 0.2 * rotateSpeed;
      meshRef.current.rotation.y += delta * 0.3 * rotateSpeed;
      meshRef.current.rotation.z += delta * 0.1 * rotateSpeed;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Polaroid Frame (White Paper) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial 
            color="#fffff0" // Off-white/Cream
            roughness={0.6}
            metalness={0.1}
        />
      </mesh>

      {/* The Photo Image */}
      <mesh position={[0, 0.15, 0.03]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
            map={texture} 
            side={THREE.DoubleSide}
        />
      </mesh>

      {/* Optional: Glossy layer over photo */}
      <mesh position={[0, 0.15, 0.035]}>
         <planeGeometry args={[1, 1]} />
         <meshStandardMaterial 
            color="#ffffff"
            transparent
            opacity={0.1}
            roughness={0}
            metalness={0.9}
         />
      </mesh>
    </group>
  );
};

export const Ornaments: React.FC<OrnamentsProps> = ({ ornaments, treeState }) => {
  return (
    <group>
      {ornaments.map((orn) => (
        <Polaroid key={orn.id} data={orn} treeState={treeState} />
      ))}
    </group>
  );
};