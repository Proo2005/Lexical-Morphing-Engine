import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

const SEQUENCE_LENGTH = 60; // ~2 seconds of gaze data at 30 FPS

export default function PerceptionNode({ onSequenceReady }) {
  const webcamRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Mutable buffer for high-performance temporal accumulation
  const gazeBufferRef = useRef([]);

  useEffect(() => {
    const FaceMesh = window.FaceMesh;
    const Camera = window.Camera;

    if (!FaceMesh || !Camera) {
      console.error("MediaPipe CDN scripts failed to load.");
      return;
    }

    setIsLoaded(true);

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, 
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        const leftIris = landmarks[468];
        const rightIris = landmarks[473];

        // 1. Construct the frame data payload
        const currentFrame = {
          timestamp: performance.now(),
          left: { x: leftIris.x, y: leftIris.y },
          right: { x: rightIris.x, y: rightIris.y }
        };

        // 2. Push to the rolling buffer
        gazeBufferRef.current.push(currentFrame);

        // 3. Evaluate buffer state
        if (gazeBufferRef.current.length >= SEQUENCE_LENGTH) {
          // Emit a deep copy of the sequence to the parent component
          if (onSequenceReady) {
            onSequenceReady([...gazeBufferRef.current]);
          }
          
          // Shift the oldest frame to maintain the sliding window
          gazeBufferRef.current.shift();
        }
      }
    });

    // 4. Bind hardware with strict dimension guarding
    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          const videoElement = webcamRef.current.video;
          
          // STRICT GUARD: Only send the frame if the video has actual dimensions and enough data
          if (
            videoElement && 
            videoElement.readyState >= 2 && 
            videoElement.videoWidth > 0 && 
            videoElement.videoHeight > 0
          ) {
             try {
               await faceMesh.send({ image: videoElement });
             } catch (error) {
               console.warn("Frame dropped during processing:", error);
             }
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      faceMesh.close();
    };
  }, [onSequenceReady]);

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", width: "240px", zIndex: 999 }}>
      {!isLoaded && <div style={{ color: "white", padding: "10px", background: "#000" }}>Loading Vision Engine...</div>}
      <Webcam
        ref={webcamRef}
        muted={true}
        style={{ width: "100%", borderRadius: "12px", border: "2px solid #333", display: isLoaded ? "block" : "none" }}
      />
    </div>
  );
}