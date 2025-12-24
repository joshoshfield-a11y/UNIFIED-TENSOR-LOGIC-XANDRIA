import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Canvas shadows camera={{ fov: 75 }}>
      <Scene />
    </Canvas>
  </React.StrictMode>
);