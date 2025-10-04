"use client";

import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, HAND_CONNECTIONS } from "@mediapipe/drawing_utils";

// --- Custom Cursor CSS: Ensure the default cursor is hidden for a clean custom experience ---
const customCursorStyle = `

  #custom-cursor {
    position: fixed; 
    width: 25px; 
    height: 25px;
    background-color: #ef4444; 
    border: 3px solid #fff;
    border-radius: 50%;
    z-index: 99999; 
    pointer-events: none; /* Crucial: Allows click events to pass through to elements underneath */
    transition: transform 0.05s ease-out, opacity 0.2s; 
    opacity: 0; 
  }
  
  /* Style change on click/hover for better UX */
  #custom-cursor.clicked {
    transform: scale(0.8) translate3d(var(--x), var(--y), 0) translate(-50%, -50%);
    background-color: #f97316; /* Orange color on click */
  }
`;

export default function HandNavigation() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null); 
  const styleRef = useRef(null); 

  // References for scroll/click state
  const pinchStartRef = useRef(null);
  const pinchActiveRef = useRef(false); // New: Tracks if pinch is currently held
  const lastPinchTimeRef = useRef(0); // New: Tracks time for click detection
  const isScrollingRef = useRef(false); // New: Tracks if sustained scroll is happening
  
  const scrollAmountRef = useRef(0);
  const rAFIdRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  const PINCH_DISTANCE_THRESHOLD = 0.08;
  const CLICK_DURATION_THRESHOLD_MS = 300; // Max duration for a pinch to be considered a click
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
  
  // --- PROGRAMMATIC CLICK FUNCTION ---
  const simulateClick = (x, y) => {
    if (!cursorRef.current) return;
    
    // 1. Get the element directly under the cursor's coordinates
    // Temporarily hide the custom cursor element so it doesn't block the hit test
    cursorRef.current.style.visibility = 'hidden'; 
    const targetElement = document.elementFromPoint(x, y);
    cursorRef.current.style.visibility = 'visible';

    if (targetElement) {
      console.log('Simulating click on:', targetElement);

      // 2. Trigger the click event on the target element
      targetElement.click(); 

      // 3. Add visual feedback (optional)
      cursorRef.current.classList.add('clicked');
      setTimeout(() => {
        cursorRef.current.classList.remove('clicked');
      }, 100);
    }
  };


  useEffect(() => {
    if (!mounted) return;

    // Inject custom cursor CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customCursorStyle;
    document.head.appendChild(styleElement);
    styleRef.current = styleElement; 

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
      const currentTime = performance.now();


      // ... (Canvas drawing logic remains the same)
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        // Hand Lost: Check for click on hand release
        if (pinchActiveRef.current && !isScrollingRef.current && (currentTime - lastPinchTimeRef.current < CLICK_DURATION_THRESHOLD_MS)) {
             // This is an edge case, but ensures a click is registered if the hand leaves the camera immediately after a short pinch
            simulateClick(window.lastCursorX, window.lastCursorY);
        }
        pinchActiveRef.current = false;
        isScrollingRef.current = false;
        pinchStartRef.current = null;
        cursor.style.opacity = '0'; 
        return;
      }

      const originalLandmarks = results.multiHandLandmarks[0];
      const flippedLandmarks = originalLandmarks.map(landmark => ({
        x: 1 - landmark.x,
        y: landmark.y,
        z: landmark.z,
      }));

      // --- CURSOR POSITION CALCULATION ---
      const indexTip = flippedLandmarks[8];
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const cursorX = indexTip.x * viewportWidth;
      const cursorY = indexTip.y * viewportHeight;
      
      // Store last known position for click fallback
      window.lastCursorX = cursorX;
      window.lastCursorY = cursorY;

      // Update Cursor Style and Position
      cursor.style.setProperty('--x', `${cursorX}px`);
      cursor.style.setProperty('--y', `${cursorY}px`);
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      cursor.style.opacity = '1';

      // ... (MediaPipe drawing)
      drawConnectors(ctx, flippedLandmarks, HAND_CONNECTIONS, { color: "#0f766e", lineWidth: 3 });
      drawLandmarks(ctx, flippedLandmarks, { color: "#14b8a6", lineWidth: 2, radius: 5 });

      // Pinch detection (thumb tip = 4, index tip = 8)
      const thumbTip = flippedLandmarks[4];
      const wrist = flippedLandmarks[0]; 
      
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      
      // --- CLICK & SCROLL DETECTION LOGIC ---
      if (distance < PINCH_DISTANCE_THRESHOLD) {
        // --- PINCH START / ACTIVE ---
        
        if (!pinchActiveRef.current) {
          // New pinch detected
          pinchActiveRef.current = true;
          lastPinchTimeRef.current = currentTime; // Mark the start time
          pinchStartRef.current = wrist.y; // Initial y position for scroll tracking
          cursor.style.backgroundColor = '#facc15'; // Yellow for pre-click/pre-scroll
          isScrollingRef.current = false;
        } else {
          // Pinch is being held

          // Check for sustained vertical movement (Scroll)
          const scrollDelta = Math.abs(pinchStartRef.current - wrist.y) * viewportHeight;
          if (scrollDelta > 20 || isScrollingRef.current) { // 20px threshold to trigger scroll mode
              isScrollingRef.current = true;
              cursor.style.backgroundColor = '#22c55e'; // Green for scroll mode
              
              // Apply Scroll Logic
              const deltaY = pinchStartRef.current - wrist.y;
              let scrollAmount = deltaY * SCROLL_MULTIPLIER;
              if (scrollAmount > MAX_SCROLL) scrollAmount = MAX_SCROLL;
              if (scrollAmount < -MAX_SCROLL) scrollAmount = -MAX_SCROLL;
              scrollAmountRef.current += scrollAmount;
              pinchStartRef.current = wrist.y; // Reset pinch start for continuous scrolling
          }
        }
      } else {
        // --- PINCH RELEASE / NO PINCH ---
        
        if (pinchActiveRef.current) {
          // A pinch has just been released. Determine if it was a click or a scroll.
          
          const pinchDuration = currentTime - lastPinchTimeRef.current;
          
          if (!isScrollingRef.current && pinchDuration < CLICK_DURATION_THRESHOLD_MS) {
            // It was a quick pinch-and-release with minimal movement: Simulate Click
            simulateClick(cursorX, cursorY);
            cursor.style.backgroundColor = '#0284c7'; // Blue flash for successful click
          } else {
            // It was a long pinch or a pinch with scroll movement: Do nothing (just reset)
            cursor.style.backgroundColor = '#ef4444'; // Reset to default red
          }
          
          // Reset all state flags
          pinchActiveRef.current = false;
          isScrollingRef.current = false;
          pinchStartRef.current = null;
          scrollAmountRef.current = 0; // Stop any residual scroll momentum
        }
      }
    });

    // ... (Camera initialization and cleanup remain the same)
    const startCamera = () => {
      if (videoRef.current && !videoRef.current.srcObject) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            const camera = new Camera(videoRef.current, {
              onFrame: async () => await hands.send({ image: videoRef.current }),
              width: 150,
              height: 140,
            });
            camera.start();
          })
          .catch((err) => console.error("Cannot access camera:", err));
      }
    };

    startCamera();
    
    return () => {
      if (rAFIdRef.current) {
        cancelAnimationFrame(rAFIdRef.current);
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      if (styleRef.current && document.head.contains(styleRef.current)) {
          document.head.removeChild(styleRef.current);
      }
    };
    
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* THE CUSTOM CURSOR ELEMENT */}
      <div 
        id="custom-cursor" 
        ref={cursorRef} 
      />

      <div className="camdiv">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
        <canvas
          ref={canvasRef}
          style={{
            
            top: "20px",
            right: "20px",
            width: "150px",
            height: "140px",
            pointerEvents: "none",
            borderRadius:"10px",
            border: "2px solid #14b8a6",
            zIndex: 1000
          }}
        />
      </div>
      
    </>
  );
}