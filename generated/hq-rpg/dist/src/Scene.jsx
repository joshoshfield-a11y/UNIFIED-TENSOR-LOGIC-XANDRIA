import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text, Sparkles, MeshReflectorMaterial, Stars, Sky } from '@react-three/drei';
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
    const onClick = (e) => {};
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  window.movePlayer = (point) => setTarget(new THREE.Vector3(point.x, 1, point.z));

  return (
    <group>
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
        {/* Selection Ring */}
        <mesh position={[target.x, 0.1, target.z]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial color="cyan" transparent opacity={0.5} />
        </mesh>
    </group>
  );
}

function Enemy({ position, type }) {
  const ref = useRef();
  const damage = useStore(state => state.damage);
  const [dead, setDead] = useState(false);
  
  useFrame((state, delta) => {
    if (dead) return;
    ref.current.rotation.y += delta * 0.5;
    ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
  });

  const onHit = (e) => {
      e.stopPropagation();
      damage(5);
      // Flash red
      ref.current.material.color.set('red');
      setTimeout(() => ref.current.material.color.set('#ff0055'), 200);
  };

  if (dead) return null;

  return (
    <mesh ref={ref} position={position} onClick={onHit} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff0055" />
      <Text position={[0, 1.2, 0]} fontSize={0.5} color="white" outlineWidth={0.05} outlineColor="black">{type}</Text>
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
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.5}
        map={texture}
      />
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
      
      {/* Atmosphere */}
      {config.theme === 'space' ? (
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      ) : (
          <Sky sunPosition={[100, 20, 100]} />
      )}
      
      <fog attach="fog" args={['#101010', 5, 40]} />
    </>
  );
}