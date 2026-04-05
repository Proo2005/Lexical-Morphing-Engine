import React, { useState } from 'react';
import './App.css';
import PerceptionNode from './components/PerceptionNode';
import InferenceEngine from './components/InferenceEngine';
import LexicalCanvas from './components/LexicalCanvas'; // 1. Import the Canvas

function App() {
  const [currentSequence, setCurrentSequence] = useState(null);
  
  // Store both the readable string and the raw numerical index
  const [gazeState, setGazeState] = useState({ 
    text: "Calibrating Neural Baseline...", 
    rawIndex: 0 
  });

  const handleSequenceReady = (sequence) => {
    setCurrentSequence(sequence);
  };

  const handlePrediction = (result) => {
    const states = ["Fluid Reading", "Micro-Hesitation Detected", "Visual Regression Detected"];
    setGazeState({
      text: `State: ${states[result.state]} | Confidence: ${result.confidence}`,
      rawIndex: result.state // 2. Capture the exact integer output
    });
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

      {/* 3. Mount the Reactive Canvas and pass the raw state */}
      <LexicalCanvas activeState={gazeState.rawIndex} />

      {/* Background Processing Nodes */}
      <PerceptionNode onSequenceReady={handleSequenceReady} />
      <InferenceEngine sequence={currentSequence} onPrediction={handlePrediction} />
    </div>
  );
}

export default App;