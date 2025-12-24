import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { PointerLockControls, Environment, Stars, Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import config from './gameConfig.json';

function Bullet({ position, rotation }) {
  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.translateZ(-delta * 50);
    if (ref.current.position.distanceTo(new THREE.Vector3(0,0,0)) > 100) {
        ref.current.visible = false;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <sphereGeometry args={[0.05]} />
      <meshBasicMaterial color="yellow" />
    </mesh>
  );
}

function Enemy({ id, position, onHit, type }) {
  const [hp, setHp] = useState(config.difficulty === 'hard' ? 200 : 100);
  const [dead, setDead] = useState(false);
  const ref = useRef();

  useFrame((state) => {
    if (dead) return;
    ref.current.rotation.y += 0.01;
    // Configurable movement speed
    const speed = config.enemySpeed || 2;
    ref.current.position.z += Math.sin(state.clock.elapsedTime * speed + id) * 0.02;
    ref.current.position.x += Math.cos(state.clock.elapsedTime * speed + id) * 0.02;
  });

  if (dead) return null;

  return (
    <mesh 
      ref={ref} 
      position={position} 
      userData={{ isEnemy: true, id, hp, setHp, setDead }}
      castShadow
    >
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color={hp < 50 ? "red" : (config.enemyColor || "orange")} />
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </mesh>
  );
}

function Weapon({ setKills }) {
  const { camera, scene } = useThree();
  const [ammo, setAmmo] = useState(20);
  const gunRef = useRef();
  const lastShot = useRef(0);

  useEffect(() => {
    const onClick = () => {
      if (ammo <= 0) return;
      
      const now = Date.now();
      if (now - lastShot.current < 200) return;
      lastShot.current = now;

      setAmmo(a => {
        const next = a - 1;
        const ammoEl = document.getElementById('ammo');
        if(ammoEl) ammoEl.innerText = next;
        return next;
      });

      // Spawn Bullet (visual only for now in this simple template)
      // In a real app we'd add this to a state array
      
      // Raycast for instant hit (hitscan)
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children);
      
      for (let hit of intersects) {
        if (hit.object.userData.isEnemy) {
             const { hp, setHp, setDead } = hit.object.userData;
             const newHp = hp - 25;
             setHp(newHp);
             if (newHp <= 0) {
                 setDead(true);
                 setKills(k => {
                     const next = k + 1;
                     const killsEl = document.getElementById('kills');
                     if(killsEl) killsEl.innerText = next;
                     return next;
                 });
             }
             break;
        }
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [ammo, camera, scene]);

  return <group ref={gunRef} position={[0.3, -0.3, -0.5]} />;
}

export function Scene() {
  const [kills, setKills] = useState(0);
  
  // Texture Loader for Ground
  const texName = config.groundTexture ? `/assets/${config.groundTexture}` : '/assets/stone.bmp';
  const texture = useLoader(THREE.TextureLoader, texName);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);

  return (
    <>
      <ambientLight intensity={config.ambientIntensity || 0.5} color={config.lightColor || "white"} />
      <pointLight position={[0, 10, 0]} intensity={0.8} />
      
      <PointerLockControls />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={texture} color={config.groundColor || "#333"} />
      </mesh>

      {config.enemies.map(e => (
        <Enemy key={e.id} id={e.id} position={[e.x, 1, e.z]} type={e.type} />
      ))}

      <Weapon setKills={setKills} />
      
      {config.sky === 'space' && <Stars />}
      {config.sky === 'cloudy' && <Cloud />}
      {config.sky === 'day' && <Sky />}
      <fog attach="fog" args={[config.fogColor || '#000', 0, config.fogDistance || 30]} />
    </>
  );
}