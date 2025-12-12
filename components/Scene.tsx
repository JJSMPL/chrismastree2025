import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera, Text3D, Center } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { MagicParticles } from './MagicParticles';
import { TreeState } from '../types';

interface SceneProps {
  treeState: TreeState;
}

const LogoStar: React.FC<{ visible: boolean }> = ({ visible }) => {
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (!groupRef.current || !visible) return;
        const time = state.clock.getElapsedTime();
        // Pulse effect
        const scale = 1 + Math.sin(time * 3) * 0.05;
        groupRef.current.scale.setScalar(scale);
        
        if (lightRef.current) {
            lightRef.current.intensity = 3 + Math.sin(time * 3) * 1;
        }
    });

    if (!visible) return null;

    return (
        <group ref={groupRef} position={[0, 9.5, 0]}>
            <Center>
                <Text3D
                    font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
                    size={0.8}
                    height={0.2}
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                >
                    Smpl
                    <meshStandardMaterial
                        color="#FFD700"
                        emissive="#FF8C00"
                        emissiveIntensity={0.8}
                        metalness={1}
                        roughness={0.05}
                        toneMapped={false}
                    />
                </Text3D>
            </Center>
            {/* Glow Light */}
            <pointLight ref={lightRef} intensity={3} color="#FFD700" distance={10} decay={2} />
        </group>
    );
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas 
      dpr={[1, 2]} 
      gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={['#020205']} />
      
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={50} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#001133" />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#0055ff" />
        <spotLight 
          position={[0, 20, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={2} 
          castShadow 
          color="#ffffff" 
        />

        {/* The "Smpl" Logo Star with Pulse Animation */}
        <LogoStar visible={treeState === TreeState.TREE_SHAPE} />

        {/* Main Particle Tree */}
        <MagicParticles state={treeState} />

        {/* Environment Enhancements */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />

        {/* Post Processing for Glow and Cinema Look */}
        <EffectComposer enableNormalPass={false}>
            {/* High intensity bloom for the magical glow */}
          <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.5} radius={0.6} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          maxDistance={50}
          minDistance={10}
          autoRotate={treeState === TreeState.SCATTERED}
          autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
};