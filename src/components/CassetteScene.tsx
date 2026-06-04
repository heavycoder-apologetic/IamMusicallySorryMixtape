import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { Cassette } from './Cassette';

export function CassetteScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.1, 3.4]} fov={32} />

      {/* soft neutral ambient */}
      <ambientLight intensity={0.55} color="#f1f1ee" />

      {/* key — clean white from upper right */}
      <directionalLight
        position={[3, 3, 4]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* fill — soft cool from left, very low */}
      <pointLight position={[-3, 0, 2]} intensity={0.35} color="#c8d0d6" distance={8} decay={2} />

      {/* rim — cool grey from behind */}
      <pointLight position={[0, -2, -3]} intensity={0.3} color="#aab1b6" distance={10} decay={2} />

      <Suspense fallback={null}>
        <Cassette />
        <Environment preset="studio" environmentIntensity={0.4} />
      </Suspense>

      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.55}
        scale={6}
        blur={2.6}
        far={2}
        color="#0a0a0a"
      />
    </Canvas>
  );
}
