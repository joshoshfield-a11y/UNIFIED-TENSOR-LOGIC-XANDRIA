import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { PointerLockControls, Environment, Stars, Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import config from './gameConfig.json';

// --- CONTROLS MAPPING ---
const keys = { w: false, a: false, s: false, d: false, space: false, shift: false, mouse: false };

function PlayerController() {
  const { camera } = useThree();
  const [velocity] = useState(new THREE.Vector3());
  const [mode, setMode] = useState('walk'); // walk, fly
  const [size, setSize] = useState(1);
  const [morph, setMorph] = useState('human');
  
  // Capability flags
  const { canFly, canResize, canClimb, hasJetpack, morphs } = config.player || {};
  
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (keys[k] !== undefined) keys[k] = true;
      if (k === ' ') keys.space = true;
      if (e.key === 'Shift') keys.shift = true;
      
      // Toggle Fly
      if (k === 'f' && (canFly || hasJetpack)) {
          setMode(m => m === 'fly' ? 'walk' : 'fly');
          console.log("Mode:", mode === 'fly' ? 'walk' : 'fly');
      }
      
      // Resize
      if (canResize) {
          if (e.key === '[') setSize(s => Math.max(0.1, s * 0.5));
          if (e.key === ']') setSize(s => Math.min(10, s * 2.0));
      }
      
      // Morph
      if (morphs && morphs.length > 0 && k === 'm') {
          const next = morphs[(morphs.indexOf(morph) + 1) % morphs.length];
          setMorph(next || 'human');
          console.log("Morphed to:", next);
      }
    };
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (keys[k] !== undefined) keys[k] = false;
      if (k === ' ') keys.space = false;
      if (e.key === 'Shift') keys.shift = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    }
  }, [canFly, hasJetpack, canResize, morphs, morph, mode]);

  useFrame((state, delta) => {
    // 1. Handle Speed & Size
    const speed = (config.playerSpeed || 5) * size * (keys.shift ? 2 : 1);
    
    // 2. Determine Movement Direction
    const direction = new THREE.Vector3();
    const front = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    // Flatten for walking (unless flying)
    if (mode === 'walk') {
        front.y = 0; front.normalize();
        right.y = 0; right.normalize();
    }

    if (keys.w) direction.add(front);
    if (keys.s) direction.sub(front);
    if (keys.d) direction.add(right);
    if (keys.a) direction.sub(right);
    
    if (direction.length() > 0) direction.normalize().multiplyScalar(speed * delta);

    // 3. Apply Movement
    camera.position.add(direction);
    
    // 4. Handle Physics / Verticality
    if (mode === 'walk') {
        // Gravity
        velocity.y += (config.gravity || -9.8) * delta;
        
        // Jump
        if (keys.space && camera.position.y <= size * 1.6) {
             velocity.y = (config.jumpHeight || 5);
        }
        
        camera.position.y += velocity.y * delta;
        
        // Ground Collision
        if (camera.position.y < size * 1.6) {
            camera.position.y = size * 1.6;
            velocity.y = 0;
        }
        
        // Wall Climb Check (Simplified: if moving forward into object, move up)
        if (canClimb) {
             const ray = new THREE.Raycaster(camera.position, front, 0, 2 * size);
             const hits = ray.intersectObjects(state.scene.children.filter(o => o.geometry && o.geometry.type === 'BoxGeometry'));
             if (hits.length > 0 && keys.w) {
                 camera.position.y += speed * delta;
                 velocity.y = 0; // Cancel gravity while climbing
             }
        }
        
    } else if (mode === 'fly') {
        if (keys.space) camera.position.y += speed * delta;
        if (keys.shift) camera.position.y -= speed * delta;
        velocity.y = 0;
    }
    
    // Update Camera Near/Far for size
    camera.near = 0.1 * size;
    camera.updateProjectionMatrix();
  });
  
  return null;
}

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
  const [ammo, setAmmo] = useState(200);
  const gunRef = useRef();
  const lastShot = useRef(0);
  
  const isMinigun = config.items && config.items.some(i => i.id === 'w_minigun');
  const fireRate = isMinigun ? 50 : 200;

  useEffect(() => {
    const onMouseDown = () => keys.mouse = true;
    const onMouseUp = () => keys.mouse = false;
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useFrame(() => {
    if (keys.mouse) {
      if (ammo <= 0) return;
      const now = Date.now();
      if (now - lastShot.current < fireRate) return;
      lastShot.current = now;

      setAmmo(a => {
        const next = a - 1;
        const el = document.getElementById('ammo');
        if(el) el.innerText = next;
        return next;
      });

      // Raycast
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children);
      
      for (let hit of intersects) {
        if (hit.object.userData.isEnemy) {
             const { hp, setHp, setDead } = hit.object.userData;
             const newHp = hp - (isMinigun ? 10 : 25);
             setHp(newHp);
             if (newHp <= 0) {
                 setDead(true);
                 setKills(k => {
                     const next = k + 1;
                     const el = document.getElementById('kills');
                     if(el) el.innerText = next;
                     return next;
                 });
             }
             break;
        }
      }
    }
  });

  return <group ref={gunRef} position={[0.3, -0.3, -0.5]} />;
}

export function Scene() {
  const [kills, setKills] = useState(0);
  
  const texName = config.groundTexture ? `/assets/${config.groundTexture}` : '/assets/stone.bmp';
  const texture = useLoader(THREE.TextureLoader, texName);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);

  return (
    <>
      <ambientLight intensity={config.ambientIntensity || 0.5} color={config.lightColor || "white"} />
      <pointLight position={[0, 10, 0]} intensity={0.8} />
      
      <PointerLockControls />
      <PlayerController />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={texture} color={config.groundColor || "#333"} />
      </mesh>
      
      {/* Walls for climbing test */}
      <mesh position={[20, 10, 0]} receiveShadow>
        <boxGeometry args={[10, 20, 10]} />
        <meshStandardMaterial color="#555" />
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