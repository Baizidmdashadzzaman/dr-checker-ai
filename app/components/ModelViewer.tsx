"use client";

import "@google/model-viewer"; // only loads in client

export default function ModelViewer() {
  return (
    <model-viewer
      src="/static/models/realistic_human_eye.glb"
      alt="Realistic Human Eye"
      shadow-intensity="1"
      camera-controls
      animation-name="*"
      autoplay
      style={{ width: '100%', height: '250px' }}
    />
  );
}

