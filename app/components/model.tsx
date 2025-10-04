"use client";

import "@google/model-viewer";

export default function EyeModel() {
  return (
    <>
    <model-viewer
      alt="Realistic Human Eye"
      src="/static/models/realistic_human_eye.glb"
      shadow-intensity="0"
      camera-controls
      animation-mixer
      autoplay
      style={{ width: "100%", height: "250px" }}
    >
    </model-viewer>
    </>
  );
}
