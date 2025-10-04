"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, HAND_CONNECTIONS } from "@mediapipe/drawing_utils";

export default function HandNavigation() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // References for scroll state and rAF
  const pinchStartRef = useRef(null);
  const scrollAmountRef = useRef(0); // Accumulates scroll amount between rAF calls
  const rAFIdRef = useRef(null);     // Stores the requestAnimationFrame ID

  const [mounted, setMounted] = useState(false);

  const PINCH_DISTANCE_THRESHOLD = 0.08;
  // Reduced SCROLL_MULTIPLIER slightly for smoother initial feel
  const SCROLL_MULTIPLIER = 2500; 
  const MAX_SCROLL = 2000;

  useEffect(() => setMounted(true), []);

  // --- Animation Frame Loop for Smooth Scrolling ---
  const scrollLoop = () => {
    // Check if there is any accumulated scroll
    if (scrollAmountRef.current !== 0) {
      // 1. Perform the scroll action
      window.scrollBy({ 
        top: scrollAmountRef.current, 
        behavior: 'auto' // Use 'auto' to ensure the raw scroll amount is applied without extra easing
      });
      
      // 2. Clear the accumulated amount
      scrollAmountRef.current = 0;
    }

    // 3. Request the next animation frame
    rAFIdRef.current = requestAnimationFrame(scrollLoop);
  };

  useEffect(() => {
    if (!mounted) return;

    // Start the smooth scrolling loop
    rAFIdRef.current = requestAnimationFrame(scrollLoop);

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

      const originalLandmarks = results.multiHandLandmarks[0];
      
      // Apply the horizontal flip to the landmark coordinates (x = 1 - x)
      const flippedLandmarks = originalLandmarks.map(landmark => ({
        x: 1 - landmark.x, // Perform the horizontal flip
        y: landmark.y,
        z: landmark.z,
      }));

      // Draw connections (lines) using the flipped landmarks
      drawConnectors(ctx, flippedLandmarks, HAND_CONNECTIONS, { color: "#0f766e", lineWidth: 3 });
      // Draw landmarks (dots) using the flipped landmarks
      drawLandmarks(ctx, flippedLandmarks, { color: "#14b8a6", lineWidth: 2, radius: 5 });

      // Pinch detection (thumb tip = 4, index tip = 8)
      const thumbTip = flippedLandmarks[4];
      const indexTip = flippedLandmarks[8];
      const wrist = flippedLandmarks[0]; 
      
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PINCH_DISTANCE_THRESHOLD) {
        if (pinchStartRef.current === null) {
          // Start of pinch: Use the y-coordinate of the flipped wrist landmark
          pinchStartRef.current = wrist.y; 
        } else {
          // Pinch ongoing: Calculate the change since the last frame
          const deltaY = pinchStartRef.current - wrist.y;
          
          let scrollAmount = deltaY * SCROLL_MULTIPLIER;
          if (scrollAmount > MAX_SCROLL) scrollAmount = MAX_SCROLL;
          if (scrollAmount < -MAX_SCROLL) scrollAmount = -MAX_SCROLL;
          
          // CRITICAL FIX: Accumulate the scroll amount to be processed by rAF
          scrollAmountRef.current += scrollAmount;

          // Update the start point for the next frame
          pinchStartRef.current = wrist.y;
        }
      } else {
        // Pinch released
        pinchStartRef.current = null;
      }
    });

    // Initialize camera
    const startCamera = () => {
      // Check if videoRef is available and if it's not already streaming
      if (videoRef.current && !videoRef.current.srcObject) {
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
    
    // Cleanup function for useEffect
    return () => {
      // Stop the rAF loop
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
      }
      
      // Stop the camera stream on component unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
    
  }, [mounted]); // Dependency array

  if (!mounted) return null;

  return (
    <div className="camdiv">
      {/* The video element is hidden but necessary to feed frames to MediaPipe */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: "none" }} // Hide the raw video feed, use canvas for display
      />
      <canvas
        ref={canvasRef}
        style={{
          
          top: "20px",
          right: "20px",
          width: "200px",
          height: "200px",
          pointerEvents: "none",
          borderRadius:"10px",
          border: "2px solid #14b8a6", // Added a border for visibility
          zIndex: 1000 // Ensure it's above page content
        }}
      />
    </div>
  );
}