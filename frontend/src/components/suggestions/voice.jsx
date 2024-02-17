import React, { useState } from 'react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      const synthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      synthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in your browser.');
    }
  };

  return (
    <div>
      <textarea
        placeholder="Enter text to be spoken"
        value={text}
        onChange={handleTextChange}
      />
      <button onClick={speakText}>Speak</button>
    </div>
  );
};

export default TextToSpeech;
