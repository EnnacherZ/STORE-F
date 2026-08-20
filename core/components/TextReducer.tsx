import React, { useState } from 'react';

const TextReducer : React.FC<{ text:string, maxLength:number}> = ({ text, maxLength}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const displayedText = isExpanded ? text : text.slice(0, maxLength);

  return (
    <div className='review-text mx-3'>
      <p>{displayedText}{text.length > maxLength && !isExpanded && '...'}
      {text.length > maxLength && (
        <button onClick={handleToggle} className='text-muted btn ' style={{outline:'none', border:0}}>
          {isExpanded ? 'Lire moins' : 'Lire la suite'}
        </button>
      )}</p>
    </div>
  );
};

export default TextReducer;
