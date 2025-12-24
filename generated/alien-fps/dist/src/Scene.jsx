import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { PointerLockControls, Environment, Stars } from '@react-three/drei';
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
  const [hp, setHp] = useState(100);
  const [dead, setDead] = useState(false);
  const ref = useRef();

  useFrame((state) => {
    if (dead) return;
    ref.current.rotation.y += 0.01;
    ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    
    // Simple chase logic
    // const playerPos = state.camera.position;
    // ref.current.lookAt(playerPos.x, 1, playerPos.z);
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
      <meshStandardMaterial color={hp < 50 ? "red" : "orange"} />
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
        document.getElementById('ammo').innerText = next;
        return next;
      });

      gunRef.current.position.z += 0.2;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object.userData.isEnemy);
      
      if (hit) {
        const enemyData = hit.object.userData;
        if (enemyData.hp > 0) {
            enemyData.setHp(h => {
                const newHp = h - 34;
                if (newHp <= 0) {
                    enemyData.setDead(true);
                    setKills(k => {
                        const nk = k + 1;
                        document.getElementById('kills').innerText = nk;
                        return nk;
                    });
                }
                return newHp;
            });
            hit.object.material.color.set('white');
            setTimeout(() => hit.object.material.color.set('red'), 100);
        }
      }
    };
    
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [ammo, camera, scene]);

  useFrame((state, delta) => {
    gunRef.current.position.lerp(new THREE.Vector3(0.3, -0.4, -0.6), delta * 10);
  });

  return (
    <group ref={gunRef} position={[0.3, -0.4, -0.6]}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.2, 0.6]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      <pointLight position={[0, 0, -0.3]} distance={2} intensity={0.5} color="cyan" />
    </group>
  );
}

export function Scene() {
  const [kills, setKills] = useState(0);
  const floorTex = useLoader(THREE.TextureLoader, '/assets/stone.bmp');
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(10, 10);

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} castShadow intensity={1} />
      
      <Weapon setKills={setKills} />
      
      {config.enemies.map(e => (
          <Enemy key={e.id} id={e.id} position={[e.x, 1, e.z]} type={e.type} />
      ))}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={floorTex} />
      </mesh>
      
      <PointerLockControls />
      <Environment preset={config.theme === 'space' ? 'night' : 'city'} />
      {config.theme === 'space' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
    </>
  );
}