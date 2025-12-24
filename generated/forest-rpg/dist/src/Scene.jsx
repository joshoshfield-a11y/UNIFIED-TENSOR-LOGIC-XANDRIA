import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from './store';
import config from './gameConfig.json';

function Player() {
  const ref = useRef();
  const [target, setTarget] = useState(new THREE.Vector3(0, 1, 0));
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.lerp(target, delta * config.playerSpeed);
      ref.current.lookAt(target);
    }
  });

  useEffect(() => {
    const onClick = (e) => {
       // Logic handled in Ground
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  window.movePlayer = (point) => setTarget(new THREE.Vector3(point.x, 1, point.z));

  return (
    <mesh ref={ref} position={[0, 1, 0]} castShadow>
      <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
      <meshStandardMaterial color="#00ff41" emissive="#002200" roughness={0.2} />
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
        <group position={[0, 1.2, 0]}>
           <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="white" /></mesh>
           <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="white" /></mesh>
        </group>
      </Float>
    </mesh>
  );
}

function Enemy({ position, type }) {
  const ref = useRef();
  const damage = useStore(state => state.damage);
  
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.5;
    ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} onClick={() => damage(10)} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff0055" />
      <Text position={[0, 1.2, 0]} fontSize={0.5} color="white">{type}</Text>
    </mesh>
  );
}

function Ground() {
  const texture = useLoader(THREE.TextureLoader, '/assets/grass.bmp');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow 
      onClick={(e) => window.movePlayer && window.movePlayer(e.point)}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      
      <Player />
      <Ground />
      
      {config.enemies.map(e => (
          <Enemy key={e.id} position={[e.x, 1, e.z]} type={e.type} />
      ))}

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
      <Environment preset={config.theme === 'space' ? 'city' : 'park'} />
      <fog attach="fog" args={['#000', 5, 40]} />
    </>
  );
}