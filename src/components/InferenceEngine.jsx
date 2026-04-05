import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function InferenceEngine({ sequence, onPrediction }) {
  const [modelReady, setModelReady] = useState(false);
  const modelRef = useRef(null);

  // 1. Initialize the Neural Network Architecture
  useEffect(() => {
    async function buildModel() {
      // Defining a lightweight, sequential LSTM architecture
      const model = tf.sequential();
      
      // Input shape: [60 timesteps, 4 features (Lx, Ly, Rx, Ry)]
      model.add(tf.layers.lstm({
        units: 32,
        inputShape: [60, 4],
        returnSequences: false 
      }));
      
      model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
      
      // Output: 3 Classes (0: Normal Reading, 1: Hesitation, 2: Regression)
      model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      modelRef.current = model;
      setModelReady(true);
      console.log("Inference Engine: LSTM Architecture Initialized.");
    }

    buildModel();
  }, []);

  // 2. The Inference Loop
  useEffect(() => {
    if (!modelReady || !sequence || sequence.length !== 60) return;

    // Isolate the inference logic to prevent blocking the main thread
    const runInference = async () => {
      // Transform the JSON array into a normalized Float32 matrix
      const matrix = sequence.map(frame => [
        frame.left.x, frame.left.y,
        frame.right.x, frame.right.y
      ]);

      // Convert to 3D Tensor [Batch Size, Timesteps, Features]
      const tensorInput = tf.tensor3d([matrix]);

      // Execute prediction
      const prediction = modelRef.current.predict(tensorInput);
      const probabilities = await prediction.data();
      
      // Memory management: critical in continuous client-side inference
      tensorInput.dispose();
      prediction.dispose();

      // Extract the highest probability class
      const predictedClass = probabilities.indexOf(Math.max(...probabilities));

      // Emit the classification state
      if (onPrediction) {
        onPrediction({
          state: predictedClass,
          confidence: probabilities[predictedClass].toFixed(4)
        });
      }
    };

    runInference();
  }, [sequence, modelReady, onPrediction]);

  return null; // Headless component, no DOM footprint
}