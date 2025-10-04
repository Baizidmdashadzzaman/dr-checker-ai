"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, HAND_CONNECTIONS } from "@mediapipe/drawing_utils";

// --- Custom Cursor CSS (Outside the component for cleaner JSX/JS) ---
// IMPORTANT: The !important is often necessary to override browser defaults on <body>
const customCursorStyle = `

  #custom-cursor {
    position: fixed; 
    width: 25px; /* Slightly larger for visibility */
    height: 25px;
    background-color: #ef4444; /* Tailwind red-500 */
    border: 3px solid #fff;
    border-radius: 50%;
    z-index: 99999; /* Ensure it is on top of everything */
    pointer-events: none; /* Allows clicks/interaction to pass through */
    transition: transform 0.05s ease-out, opacity 0.2s; /* Smoother tracking */
    opacity: 0; /* Start hidden */
  }
`;

export default function HandNavigation() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null); // Reference for the custom cursor element
  const styleRef = useRef(null);  // Reference for the injected style element

  // References for scroll state and rAF
  const pinchStartRef = useRef(null);
  const scrollAmountRef = useRef(0);
  const rAFIdRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  const PINCH_DISTANCE_THRESHOLD = 0.08;
  const SCROLL_MULTIPLIER = 2500; 
  const MAX_SCROLL = 2000;

  useEffect(() => setMounted(true), []);

  // --- Animation Frame Loop for Smooth Scrolling ---
  const scrollLoop = () => {
    if (scrollAmountRef.current !== 0) {
      window.scrollBy({ 
        top: scrollAmountRef.current, 
        behavior: 'auto' 
      });
      scrollAmountRef.current = 0;
    }
    rAFIdRef.current = requestAnimationFrame(scrollLoop);
  };

  useEffect(() => {
    if (!mounted) return;

    // Inject custom cursor CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customCursorStyle;
    document.head.appendChild(styleElement);
    styleRef.current = styleElement; // Store reference for cleanup


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
      if (!canvasRef.current || !videoRef.current || !cursorRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const cursor = cursorRef.current;

      // ... (Canvas drawing logic remains the same)
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        cursor.style.opacity = '0'; // Hide cursor if no hand is detected
        return;
      }

      const originalLandmarks = results.multiHandLandmarks[0];
      
      const flippedLandmarks = originalLandmarks.map(landmark => ({
        x: 1 - landmark.x,
        y: landmark.y,
        z: landmark.z,
      }));

      // --- CUSTOM CURSOR LOGIC: Index Finger Tip (Landmark 8) ---
      const indexTip = flippedLandmarks[8];
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate cursor position in viewport pixels
      const cursorX = indexTip.x * viewportWidth;
      const cursorY = indexTip.y * viewportHeight;

      /*
        FIX: The custom cursor div's top-left corner is at (cursorX, cursorY).
        We need to move it left and up by half its size to center it on the fingertip.
        The CSS translate(-50%, -50%) centers it relative to its own size. 
        We use the absolute pixel values for the position, and the CSS transform for centering.
      */
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      cursor.style.opacity = '1';

      // ... (MediaPipe drawing and Scroll logic remain the same)
      drawConnectors(ctx, flippedLandmarks, HAND_CONNECTIONS, { color: "#0f766e", lineWidth: 3 });
      drawLandmarks(ctx, flippedLandmarks, { color: "#14b8a6", lineWidth: 2, radius: 5 });

      const thumbTip = flippedLandmarks[4];
      const wrist = flippedLandmarks[0]; 
      
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PINCH_DISTANCE_THRESHOLD) {
        // SCROLL STATE: Pinch active
        cursor.style.backgroundColor = '#22c55e'; // Change color to green on pinch
        if (pinchStartRef.current === null) {
          pinchStartRef.current = wrist.y; 
        } else {
          const deltaY = pinchStartRef.current - wrist.y;
          let scrollAmount = deltaY * SCROLL_MULTIPLIER;
          if (scrollAmount > MAX_SCROLL) scrollAmount = MAX_SCROLL;
          if (scrollAmount < -MAX_SCROLL) scrollAmount = -MAX_SCROLL;
          scrollAmountRef.current += scrollAmount;
          pinchStartRef.current = wrist.y;
        }
      } else {
        // SCROLL STATE: Pinch released
        cursor.style.backgroundColor = '#ef4444'; // Reset color
        pinchStartRef.current = null;
      }
    });

    // Initialize camera (no changes needed here)
    const startCamera = () => {
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
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      // Cleanup the injected style element
      if (styleRef.current && document.head.contains(styleRef.current)) {
          document.head.removeChild(styleRef.current);
      }
    };
    
  }, [mounted]);

  if (!mounted) return null;

  return (
    // Note: The custom cursor is an immediate child of the Fragment/Root 
    // to ensure it can cover the entire screen viewport.
    <>
      {/* THE CUSTOM CURSOR ELEMENT: Must be outside the camdiv to track across the whole viewport */}
      <div 
        id="custom-cursor" 
        ref={cursorRef} 
      />

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
            border: "2px solid #14b8a6",
            zIndex: 1000 // Ensure it's above page content
          }}
        />
      </div>
    </>
  );
}