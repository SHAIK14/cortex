'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  maxIterations?: number;
}

const chars = 'ABCDEFGHIJKLMN_OPQRSTUVWXYZ0123456789<>[]{}+=-*&^%$#@!|/\\';

export function DecryptedText({ 
  text, 
  className, 
  speed = 40,
  maxIterations = 10
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState('');
  const iteration = useRef(0);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    let currentText = text;
    let targetText = text;
    iteration.current = 0;

    const decrypt = () => {
      setDisplayText(
        targetText
          .split('')
          .map((char, index) => {
            if (index < iteration.current) {
              return char;
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration.current < targetText.length) {
        iteration.current += 1/maxIterations;
        frameId.current = window.setTimeout(decrypt, speed);
      } else {
        setDisplayText(targetText);
      }
    };

    decrypt();

    return () => {
      if (frameId.current) clearTimeout(frameId.current);
    };
  }, [text, speed, maxIterations]);

  return <span className={className}>{displayText}</span>;
}
