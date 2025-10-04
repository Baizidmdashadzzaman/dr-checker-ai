"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, HAND_CONNECTIONS } from "@mediapipe/drawing_utils";

export default function HandNavigation() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pinchStartRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const PINCH_DISTANCE_THRESHOLD = 0.08;
  const SCROLL_MULTIPLIER = 3000;
  const MAX_SCROLL = 2000;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Match canvas size to video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw mirrored video
      ctx.save();
      ctx.scale(-1, 1); // flip horizontally
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

      const landmarks = results.multiHandLandmarks[0];

      // Draw connections (lines)
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: "#0f766e", lineWidth: 3 });
      // Draw landmarks (dots)
      drawLandmarks(ctx, landmarks, { color: "#14b8a6", lineWidth: 2, radius: 5 });

      // Pinch detection (thumb tip = 4, index tip = 8)
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PINCH_DISTANCE_THRESHOLD) {
        if (pinchStartRef.current === null) {
          pinchStartRef.current = landmarks[0].y;
        } else {
          const deltaY = pinchStartRef.current - landmarks[0].y;
          let scrollAmount = deltaY * SCROLL_MULTIPLIER;
          if (scrollAmount > MAX_SCROLL) scrollAmount = MAX_SCROLL;
          if (scrollAmount < -MAX_SCROLL) scrollAmount = -MAX_SCROLL;
          window.scrollBy(0, scrollAmount);
          pinchStartRef.current = landmarks[0].y;
        }
      } else {
        pinchStartRef.current = null;
      }
    });

    // Initialize camera
    const startCamera = () => {
      if (!videoRef.current || !videoRef.current.srcObject) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            const camera = new Camera(videoRef.current, {
              onFrame: async () => await hands.send({ image: videoRef.current }),
              width: 640,
              height: 480,
            });
            camera.start();
          })
          .catch((err) => console.error("Cannot access camera:", err));
      }
    };

    startCamera();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div  style={{  }} className="camdiv">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "200px", height: "200px" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "200px",
          height: "200px",
          pointerEvents: "none",
          borderRadius:"10px",
        }}
      />
    </div>
  );
}
