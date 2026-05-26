import React, { useState, useEffect, useRef } from "react";
import { playKeySound, playErrorSound, playChimeSound } from "../utils/sound";
import { RefreshCw, Zap, Award, CheckCircle, ShieldAlert, Timer } from "lucide-react";

interface TypingCoreProps {
  mode: "lesson" | "test";
  text: string;
  category: string;
  timeLimit?: number; // optional countdown in seconds for tests
  onFinish: (wpm: number, accuracy: number, elapsedTime: number, errors: number, charsTyped: number) => void;
  onKeystroke: (key: string, nextChar: string) => void;
}

export default function TypingCore({
  mode,
  text,
  category,
  timeLimit,
  onFinish,
  onKeystroke,
}: TypingCoreProps) {
  // Parsing letters
  const letters = text.split("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedLetters, setTypedLetters] = useState<{ [idx: number]: { correct: boolean; val: string } }>({});
  const [errorsCount, setErrorsCount] = useState(0);
  const [totalKeysTyped, setTotalKeysTyped] = useState(0);
  
  // Timers and progression
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimit || null);
  const [isRunning, setIsRunning] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Sync parameters when parent prompt text changes
  useEffect(() => {
    resetPractice();
  }, [text, mode, timeLimit]);

  // Focus caret automatically on load
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
    return () => stopTimerAndClean();
  }, []);

  const startTimer = () => {
    if (startTime === null) {
      setStartTime(Date.now());
      setIsRunning(true);

      timerIntervalRef.current = window.setInterval(() => {
        setStartTime((prevStart) => {
          if (prevStart === null) return prevStart;
          const elapsed = Math.floor((Date.now() - prevStart) / 1000);
          setElapsedTime(elapsed);

          if (timeLimit) {
            const left = Math.max(0, timeLimit - elapsed);
            setTimeLeft(left);
            if (left <= 0) {
              completeTypingSession(elapsed, true);
            }
          }
          return prevStart;
        });
      }, 1000);
    }
  };

  const stopTimerAndClean = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetPractice = () => {
    stopTimerAndClean();
    setCurrentIndex(0);
    setTypedLetters({});
    setErrorsCount(0);
    setTotalKeysTyped(0);
    setStartTime(null);
    setElapsedTime(0);
    setTimeLeft(timeLimit || null);
    setTestCompleted(false);
    onKeystroke("", letters[0] || "");
    setTimeout(() => {
      containerRef.current?.focus();
    }, 50);
  };

  const completeTypingSession = (finalElapsed: number, forceTimeUp = false) => {
    stopTimerAndClean();
    setTestCompleted(true);
    playChimeSound();

    const actualElapsed = finalElapsed || 1;
    
    // Core typing mathematics
    // WPM calculation: (standard keystrokes / 5) / elapsed minutes
    // We count only characters typed correctly
    const correctChars = (Object.values(typedLetters) as { correct: boolean; val: string }[]).filter((l) => l.correct).length;
    const computedWPM = Math.round((correctChars / 5) / (actualElapsed / 60)) || 0;
    
    // Accuracy based on total attempts
    const accuracy = totalKeysTyped > 0 
      ? Math.round((correctChars / totalKeysTyped) * 100) 
      : 100;

    onFinish(computedWPM, accuracy, actualElapsed, errorsCount, totalKeysTyped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Disable default scrolls (like spacebar scrolling the iframe)
    if (e.key === " " || e.key === "Tab") {
      e.preventDefault();
    }

    if (testCompleted) return;

    const key = e.key;

    // Reset bindings via Esc key
    if (key === "Escape") {
      resetPractice();
      return;
    }

    // Ignore secondary meta characters
    if (key.length > 1 && key !== "Backspace") {
      // Still trigger onKeystroke for highlight effect of Shifts or Caps
      onKeystroke(e.code, letters[currentIndex] || "");
      return;
    }

    // Start timer upon the first valid key typed
    if (startTime === null) {
      startTimer();
    }

    setTotalKeysTyped((t) => t + 1);

    if (key === "Backspace") {
      if (mode === "lesson") {
        // Lessons operate in strict mode: doesn't let you fall back or make advanced errors
        playErrorSound();
        return;
      }

      // Permissive backspace behavior
      if (currentIndex > 0) {
        const targetIndex = currentIndex - 1;
        setTypedLetters((prev) => {
          const copy = { ...prev };
          delete copy[targetIndex];
          return copy;
        });
        setCurrentIndex(targetIndex);
        onKeystroke("Backspace", letters[targetIndex]);
      }
      return;
    }

    // Checking correct vs incorrect
    const expected = letters[currentIndex];
    const isCorrect = key === expected;

    if (isCorrect) {
      playKeySound();
      setTypedLetters((prev) => ({
        ...prev,
        [currentIndex]: { correct: true, val: key },
      }));
      
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      onKeystroke(key, letters[nextIndex] || "");

      // If we finished the final character
      if (nextIndex >= letters.length) {
        const finalSecs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 1;
        completeTypingSession(finalSecs);
      }
    } else {
      // Typo committed
      playErrorSound();
      setErrorsCount((err) => err + 1);

      if (mode === "lesson") {
        // Strict lesson constraints: do not advance until you hit the correct key
        onKeystroke(key, expected);
        return;
      }

      // Allow advancing with an errors highlight in test modes
      setTypedLetters((prev) => ({
        ...prev,
        [currentIndex]: { correct: false, val: key },
      }));

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      onKeystroke(key, letters[nextIndex] || "");

      if (nextIndex >= letters.length) {
        const finalSecs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 1;
        completeTypingSession(finalSecs);
      }
    }
  };

  // Live mathematics displays
  const calculateLiveWPM = (): number => {
    if (!startTime || elapsedTime === 0) return 0;
    const correctChars = (Object.values(typedLetters) as { correct: boolean; val: string }[]).filter((l) => l.correct).length;
    return Math.round((correctChars / 5) / (elapsedTime / 60)) || 0;
  };

  const calculateLiveAccuracy = (): number => {
    if (totalKeysTyped === 0) return 100;
    const correctChars = (Object.values(typedLetters) as { correct: boolean; val: string }[]).filter((l) => l.correct).length;
    return Math.round((correctChars / totalKeysTyped) * 100);
  };

  return (
    <div className="w-full flex flex-col items-center" id="typing-core-root">
      
      {/* Top Real-time Status Gauge (Live Stats Bar) */}
      <div className="w-full flex items-center justify-between glass p-4 rounded-2xl shadow-xl mb-6 font-mono text-sm text-slate-300" id="live-gauge-bar">
        <div className="flex items-center gap-6" id="gauge-metrics">
          <div className="flex items-center gap-1.5" id="live-wpm-box">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Speed: <strong className="text-white font-semibold">{calculateLiveWPM()}</strong> <span className="text-[10px] text-slate-400">WPM</span></span>
          </div>
          <div className="flex items-center gap-1.5" id="live-acc-box">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Acc: <strong className="text-white font-semibold">{calculateLiveAccuracy()}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4" id="gauge-timer">
          {timeLeft !== null ? (
            <div className="flex items-center gap-1 text-rose-400 font-bold" id="cd-timer">
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s left</span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs" id="elapsed-counter">
              Time: <span className="text-white font-semibold">{elapsedTime}s</span>
            </div>
          )}
          
          <button
            id="btn-esc-instructions"
            onClick={resetPractice}
            className="flex items-center gap-1 glass glass-interactive px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-purple-400" />
            <span>Reset (Esc)</span>
          </button>
        </div>
      </div>

      {/* Typing Board Core */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[160px] p-8 sm:p-10 glass rounded-[36px] cursor-text relative shadow-2xl overflow-hidden focus:outline-none focus:ring-1 focus:ring-purple-500/35 select-none group"
        id="typing-focus-board"
      >
        {/* Focusing Help Overlay */}
        <div className="absolute inset-0 bg-[#0a0a14]/90 backdrop-blur-[6px] -webkit-backdrop-blur-[6px] flex items-center justify-center opacity-0 pointer-events-none group-focus:opacity-0 group-focus:pointer-events-none transition duration-150 select-none z-20" id="unfocused-overlay">
          <span className="text-sm font-mono text-slate-300 animate-pulse glass px-5 py-2 rounded-2xl">
            💡 Click inside this block to focus typing
          </span>
        </div>

        {/* Text Container Layout */}
        <div className="flex flex-wrap text-lg sm:text-2xl leading-relaxed tracking-wide font-mono select-none" id="text-canvas">
          {letters.map((char, idx) => {
            const state = typedLetters[idx];
            const isCurrent = idx === currentIndex;
            
            let color = "letter-untyped"; // Default Untyped matching index.css
            if (state) {
              color = state.correct ? "letter-typed" : "letter-error";
            } else if (isCurrent) {
              color = "letter-current font-semibold relative px-[1px] rounded-sm";
            }

            return (
              <span
                key={idx}
                className={`${color} transition-colors duration-75`}
                id={`char-${idx}`}
              >
                {char === " " ? " " : char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Under guidance banner */}
      <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-widest text-center" id="under-guidance">
        {mode === "lesson" ? "Strict Classroom mode: Correct each key to proceed" : "Test mode: Space bar submits, backspace allows repairs"}
      </p>

      {/* Success Modal Overlay (Self-Contained inside UI state) */}
      {testCompleted && (
        <div className="glass p-6 rounded-3xl mt-6 w-full max-w-lg shadow-2xl" id="summary-banner-box">
          <div className="flex items-center gap-2 text-purple-400 font-bold mb-4" id="success-header">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-sans uppercase tracking-wider text-white">Session Completed successfully!</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5" id="completion-stats">
            <div className="glass p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase block font-mono tracking-widest">Gross Speed</span>
              <span className="text-2xl font-extrabold text-white">
                {Math.round(((Object.values(typedLetters) as { correct: boolean; val: string }[]).filter((l) => l.correct).length / 5) / (elapsedTime / 60)) || 0}
                <span className="text-xs text-purple-400 font-normal font-mono ml-1">WPM</span>
              </span>
            </div>
            <div className="glass p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase block font-mono tracking-widest">Accuracy</span>
              <span className="text-2xl font-extrabold text-white">
                {totalKeysTyped > 0 ? Math.round(((Object.values(typedLetters) as { correct: boolean; val: string }[]).filter((l) => l.correct).length / totalKeysTyped) * 100) : 100}%
              </span>
            </div>
          </div>

          <button
            id="btn-summary-continue"
            onClick={resetPractice}
            className="w-full glass glass-interactive text-white font-medium py-2.5 px-4 rounded-2xl text-center text-xs cursor-pointer"
          >
            Practice Next Challenge
          </button>
        </div>
      )}
    </div>
  );
}
