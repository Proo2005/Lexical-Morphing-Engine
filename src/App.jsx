import React, { useState } from 'react';
import './App.css';
import PerceptionNode from './components/PerceptionNode';
import InferenceEngine from './components/InferenceEngine';
import LexicalCanvas from './components/LexicalCanvas';

function App() {
  const [currentSequence, setCurrentSequence] = useState(null);
  const [gazeState, setGazeState] = useState({ 
    text: "Calibrating Neural Baseline...", 
    rawIndex: 0 
  });

  const handleSequenceReady = (sequence) => {
    setCurrentSequence(sequence);
  };

  // The Telemetry Dispatcher Function
  const dispatchToBackend = async (sequenceMatrix, predictionResult) => {
    try {
      const payload = {
        sequence_matrix: sequenceMatrix,
        predicted_state: predictionResult.state,
        confidence_score: parseFloat(predictionResult.confidence)
      };

      const response = await fetch('http://127.0.0.1:8000/api/telemetry/ingest/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("🟢 Telemetry successfully ingested by Django DB.");
      } else {
        console.warn("🔴 Django rejected the payload. Check server logs.");
      }
    } catch (error) {
      console.error("🔴 Telemetry pipeline failed to connect:", error);
    }
  };

  const handlePrediction = (result) => {
    const states = ["Fluid Reading", "Micro-Hesitation Detected", "Visual Regression Detected"];
    
    // 1. Update the UI State
    setGazeState({
      text: `State: ${states[result.state]} | Confidence: ${result.confidence}`,
      rawIndex: result.state
    });

    // 2. Dispatch the data to the Django Backend
    // We pass both the current array of 60 frames and the model's conclusion
    if (currentSequence) {
      dispatchToBackend(currentSequence, result);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Lexical Morphing Engine</h1>
        <div style={{ 
          padding: "15px 20px", 
          background: "#1e1e2f", 
          color: "#00ffcc",
          borderRadius: "8px", 
          fontFamily: "monospace",
          fontSize: "16px"
        }}>
          {gazeState.text}
        </div>
      </header>

      <LexicalCanvas activeState={gazeState.rawIndex} />

      <PerceptionNode onSequenceReady={handleSequenceReady} />
      <InferenceEngine sequence={currentSequence} onPrediction={handlePrediction} />
    </div>
  );
}

export default App;