import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface MagicParticlesProps {
  state: TreeState;
}

const COUNT = 3000;
const TREE_HEIGHT = 18;
const TREE_RADIUS = 7;
const SCATTER_RADIUS = 25;

// Helper to generate random point in sphere
const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

export const MagicParticles: React.FC<MagicParticlesProps> = ({ state }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Buffers to store current, target, and speed data for physics-like transitions
  const particles = useMemo(() => {
    const tempParticles = [];
    const colorOptions = [
      new THREE.Color('#005533'), // Emerald
      new THREE.Color('#004422'), // Dark Emerald
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#F0E68C'), // Khaki Gold
      new THREE.Color('#001133'), // Deep Sapphire (accent)
    ];

    for (let i = 0; i < COUNT; i++) {
      // 1. SCATTER POSITION (Random Sphere)
      const scatterPos = getRandomSpherePoint(SCATTER_RADIUS);

      // 2. TREE POSITION (Spiral Cone)
      // Normalize height 0 to 1
      const p = i / COUNT; 
      // y goes from -Height/2 to Height/2
      const y = (p * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      
      // Radius decreases as we go up
      // Add some noise to radius for organic look
      const radiusAtHeight = (TREE_RADIUS * (1 - p)) + (Math.random() * 0.5);
      
      // Spiral angle
      const angle = p * 50 + (Math.random() * Math.PI * 2); 
      
      const x = Math.cos(angle) * radiusAtHeight;
      const z = Math.sin(angle) * radiusAtHeight;

      // Color logic: Higher items more likely to be gold (star-like), inside more green
      let color = colorOptions[Math.floor(Math.random() * 2)]; // Default greens
      if (Math.random() > 0.85) color = colorOptions[2]; // 15% Gold
      if (Math.random() > 0.95) color = colorOptions[3]; // 5% Bright Gold
      
      // Scale variation
      const scale = Math.random() * 0.2 + 0.1;

      tempParticles.push({
        scatterPos: new THREE.Vector3(...scatterPos),
        treePos: new THREE.Vector3(x, y, z),
        currentPos: new THREE.Vector3(...scatterPos), // Start scattered
        color: color,
        scale: scale,
        speed: Math.random() * 0.05 + 0.02, // Interpolation speed
        wobbleOffset: Math.random() * 100
      });
    }
    return tempParticles;
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      // Initialize colors once
      particles.forEach((particle, i) => {
        meshRef.current!.setColorAt(i, particle.color);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [particles]);

  useFrame((stateContext) => {
    if (!meshRef.current) return;

    const time = stateContext.clock.getElapsedTime();
    const isTree = state === TreeState.TREE_SHAPE;

    particles.forEach((particle, i) => {
      // Determine Target
      const target = isTree ? particle.treePos : particle.scatterPos;

      // Add floating wobble effect
      const wobble = isTree ? 0.05 : 0.5; // Less wobble when in tree form for structure
      const wx = Math.sin(time + particle.wobbleOffset) * wobble;
      const wy = Math.cos(time * 0.5 + particle.wobbleOffset) * wobble;
      const wz = Math.sin(time * 0.3 + particle.wobbleOffset) * wobble;

      const targetWithWobble = target.clone().add(new THREE.Vector3(wx, wy, wz));

      // Lerp Position
      // We use a simple linear interpolation for smooth transition
      particle.currentPos.lerp(targetWithWobble, particle.speed);

      // Rotate particles slightly for glimmer
      dummy.position.copy(particle.currentPos);
      dummy.scale.setScalar(particle.scale);
      dummy.rotation.set(
        Math.sin(time + i) * 0.5,
        Math.cos(time + i) * 0.5,
        0
      );
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    // Rotate the whole tree slowly if in tree state
    if (isTree) {
       meshRef.current.rotation.y += 0.001;
    } else {
       // Slow rotation in scatter mode too for dynamism
       meshRef.current.rotation.y += 0.0005; 
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      {/* Tetrahedrons look like abstract jewels/leaves */}
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        toneMapped={false} 
        emissive={new THREE.Color("#000000")}
        roughness={0.2}
        metalness={0.9}
      />
    </instancedMesh>
  );
};
