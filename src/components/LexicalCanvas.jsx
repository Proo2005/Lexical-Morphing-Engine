import React from 'react';

export default function LexicalCanvas({ activeState }) {
  
  // Map the neurological state to specific typographical interventions
  const computeMorphingStyles = () => {
    switch (activeState) {
      case 1: 
        // State 1: Micro-Hesitation (Cognitive Overload on a specific word)
        // Intervention: Expand letter spacing to aid phonetic decoding
        return {
          letterSpacing: '0.15em',
          wordSpacing: '0.3em',
          lineHeight: '1.8',
          fontWeight: '500',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        };
      case 2: 
        // State 2: Visual Regression (Eyes jumping back, lost track of the line)
        // Intervention: Drastically increase line height to prevent vertical crowding
        return {
          letterSpacing: '0.05em',
          wordSpacing: '0.4em',
          lineHeight: '2.8',
          fontWeight: '400',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          backgroundColor: '#fafbfc' // Subtle contrast shift
        };
      case 0: 
      default:
        // State 0: Fluid Reading (Baseline)
        // Intervention: Return to optimal default typography smoothly
        return {
          letterSpacing: '0.01em',
          wordSpacing: '0.12em',
          lineHeight: '1.6',
          fontWeight: '400',
          transition: 'all 0.6s ease-in-out'
        };
    }
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        Reactive Reading Interface
      </h3>
      
      <div
        style={{
          padding: '40px',
          borderRadius: '12px',
          background: '#ffffff',
          color: '#1a1a1a',
          fontSize: '22px',
          fontFamily: 'Georgia, serif',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          willChange: 'letter-spacing, line-height', // Hardware acceleration hint
          ...computeMorphingStyles()
        }}
      >
        <p>
          The fundamental challenge of modern human-computer interaction is bandwidth. 
          While machines process information in nanoseconds, humans are bottlenecked by 
          the biological constraints of visual perception and lexical parsing. 
          By establishing a continuous physiological feedback loop, we can dynamically 
          alter the typography of a digital document in real-time. This architecture 
          bridges optical telemetry with dynamic user interface manipulation, creating a 
          digital reading environment that physically adapts to your neurological 
          processing speed millisecond by millisecond.
        </p>
      </div>
    </div>
  );
}