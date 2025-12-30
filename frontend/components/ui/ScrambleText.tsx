'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  triggerOn?: 'hover' | 'load';
}

const chars = 'ABCDEFGHIJKLMN_OPQRSTUVWXYZ0123456789<>/[]{}';

export function ScrambleText({ text, className, triggerOn = 'hover' }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    if (triggerOn === 'load') scramble();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span 
      className={className}
      onMouseEnter={triggerOn === 'hover' ? scramble : undefined}
    >
      {displayText}
    </span>
  );
}
