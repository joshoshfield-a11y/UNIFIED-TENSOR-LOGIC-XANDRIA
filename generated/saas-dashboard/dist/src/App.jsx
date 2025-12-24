import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', paddingTop: 'env(safe-area-inset-top)' }}>
      <h1>Xandria Mobile</h1>
      <p>Running on Device</p>
      <button onClick={() => alert('Native Bridge Active')}>Test Bridge</button>
    </div>
  );
}