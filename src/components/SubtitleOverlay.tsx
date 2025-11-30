import React, { useMemo } from 'react';
import { getWordTimings } from '../utils/videoUtils';
import { SUBTITLE_STYLES } from '../utils/styleConstants';

interface SubtitleOverlayProps {
  text: string;
  duration: number;
  currentTime: number;
  show: boolean;
  wordTimings?: { word: string; start: number; end: number }[];
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ text, duration, currentTime, show, wordTimings }) => {
  if (!show || !text) return null;

  const timings = useMemo(() => getWordTimings(text, duration, wordTimings), [text, duration, wordTimings]);

  // Find the currently active word
  let activeWordIndex = timings.findIndex(t => currentTime >= t.start && currentTime < t.end);

  // If no word is active (e.g. silence or before start), find the nearest relevant word
  if (activeWordIndex === -1) {
    if (currentTime < (timings[0]?.start || 0)) {
      activeWordIndex = 0;
    } else if (currentTime > (timings[timings.length - 1]?.end || duration)) {
      activeWordIndex = timings.length - 1;
    } else {
      // In a gap, center on the next word
      const nextIndex = timings.findIndex(t => t.start > currentTime);
      activeWordIndex = nextIndex !== -1 ? nextIndex : timings.length - 1;
    }
  }

  // Window configuration
  const WORDS_PER_VIEW = 12; // Limits text to roughly 2 lines
  const halfWindow = Math.floor(WORDS_PER_VIEW / 2);

  // Calculate window bounds
  let start = activeWordIndex - halfWindow;
  let end = activeWordIndex + halfWindow;

  // Clamp bounds to array limits
  if (start < 0) {
    start = 0;
    end = Math.min(timings.length, WORDS_PER_VIEW);
  }

  if (end > timings.length) {
    end = timings.length;
    start = Math.max(0, timings.length - WORDS_PER_VIEW);
  }

  const visibleTimings = timings.slice(start, end);

  return (
    <div className="absolute bottom-8 left-0 right-0 p-4 text-center z-20 pointer-events-none">
      <div
        className="font-bold text-xl md:text-2xl leading-normal flex flex-wrap justify-center gap-x-2 gap-y-1"
        style={{
          fontFamily: SUBTITLE_STYLES.fontFamily,
          textShadow: `0px ${SUBTITLE_STYLES.shadowOffsetY}px ${SUBTITLE_STYLES.shadowBlur}px ${SUBTITLE_STYLES.shadowColor}`
        }}
      >
        {visibleTimings.map((t, i) => {
          const isActive = currentTime >= t.start && currentTime < t.end;
          return (
            <span
              key={start + i}
              className="transition-all duration-200"
              style={{
                color: isActive ? SUBTITLE_STYLES.activeColor : SUBTITLE_STYLES.inactiveColor,
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                opacity: isActive ? 1 : 0.8,
                filter: isActive ? 'none' : 'blur(0.5px)'
              }}
            >
              {t.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default SubtitleOverlay;
