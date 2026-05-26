import React, { useState, useEffect, useRef } from "react";
import { GameWord } from "../types";
import { GAME_WORDS } from "../lessonsData";
import { playLaserSound, playErrorSound } from "../utils/sound";
import { Heart, Play, RotateCcw, Award } from "lucide-react";

interface FallingWordsProps {
  onSaveScore: (score: number, mode: "game", category: string) => void;
}

export default function FallingWordsGame({ onSaveScore }: FallingWordsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [words, setWords] = useState<GameWord[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);

  // Read high score from localStorage
  useEffect(() => {
    const historical = localStorage.getItem("typing_master_game_high");
    if (historical) {
      setHighScore(parseInt(historical));
    }
  }, []);

  // Update Game Physics
  const updateGame = (time: number) => {
    if (gameOver || !isPlaying) return;

    // Spawn new word
    const spawnInterval = Math.max(1200, 3000 - level * 250); // Speed up spawning based on level
    if (time - lastSpawnTimeRef.current > spawnInterval) {
      const randomWord = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
      
      const newWord: GameWord = {
        id: Math.random().toString(36).substring(2, 9),
        text: randomWord,
        x: 10 + Math.random() * 70, // Keep in bounds
        y: 0,
        speed: 0.15 + (level * 0.05) + (Math.random() * 0.05), // Speed scaling
      };

      setWords((prev) => [...prev, newWord]);
      lastSpawnTimeRef.current = time;
    }

    // Move words down & filter hitting boundary
    setWords((prev) => {
      let missedCount = 0;
      const updated = prev
        .map((w) => ({ ...w, y: w.y + w.speed }))
        .filter((w) => {
          if (w.y >= 90) { // Hit bottom boundary
            missedCount++;
            return false;
          }
          return true;
        });

      if (missedCount > 0) {
        playErrorSound();
        setLives((currLives) => {
          const nextLives = currLives - missedCount;
          if (nextLives <= 0) {
            handleGameOver(score);
            return 0;
          }
          return nextLives;
        });
      }

      return updated;
    });

    gameLoopRef.current = requestAnimationFrame(updateGame);
  };

  const startNewGame = () => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setWords([]);
    setInputValue("");
    setGameOver(false);
    setIsPlaying(true);
    lastSpawnTimeRef.current = performance.now();
  };

  const handleGameOver = (finalScore: number) => {
    setIsPlaying(false);
    setGameOver(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("typing_master_game_high", finalScore.toString());
    }

    // Persist scores
    onSaveScore(finalScore, "game", `Arcade Level ${level}`);
  };

  // Start / Pause effect loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, level, score]);

  // Handle Level Up based on score
  useEffect(() => {
    const nextLevel = Math.floor(score / 80) + 1;
    if (nextLevel > level) {
      setLevel(nextLevel);
    }
  }, [score, level]);

  // Track keystrokes / input submission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setInputValue(e.target.value);

    // Look for a matching word immediately
    const matchedIdx = words.findIndex((w) => w.text === val);
    if (matchedIdx !== -1) {
      // Explode the word!
      playLaserSound();
      setWords((prev) => prev.filter((_, idx) => idx !== matchedIdx));
      setScore((s) => s + val.length * 2); // Score based on lengths of word
      setInputValue("");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full"
      id="falling-game-root"
    >
      <div className="glass rounded-[32px] overflow-hidden shadow-2xl w-full" id="game-container">
        {/* Top Control Stats Header */}
        <div className="bg-black/25 border-b border-white/5 p-4 flex items-center justify-between font-mono" id="game-stats-row">
          <div className="flex items-center gap-6" id="game-stats-left">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold uppercase text-xs">Score:</span>
              <span className="text-purple-300 font-bold ml-1 text-lg">{score}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold uppercase text-xs">Level:</span>
              <span className="text-purple-400 font-bold ml-1 text-lg">{level}</span>
            </div>
          </div>

          <div className="flex items-center gap-4" id="game-lives-row">
            <div className="flex items-center gap-1 mr-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300 text-xs">High Score: <span className="text-purple-300 font-bold">{highScore}</span></span>
            </div>
            
            <div className="flex gap-1" id="hearts-container">
              {[1, 2, 3].map((val) => (
                <Heart
                  key={val}
                  className={`w-5 h-5 transition-all ${
                    val <= lives ? "text-rose-500 fill-rose-500 scale-100" : "text-white/10 scale-90"
                  }`}
                  id={`heart-icon-${val}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Outer Arcade Area */}
        <div
          ref={containerRef}
          className="relative bg-black/40 h-[380px] sm:h-[450px] w-full border-b border-white/5 select-none overflow-hidden"
          id="arcade-board"
        >
          {/* Default Welcome Screen */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070110]/85 backdrop-blur-md text-center p-6 z-10" id="welcome-overlay">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 text-purple-400 mb-4 animate-bounce shadow">
                🚀
              </div>
              <h3 className="font-sans text-2xl font-bold text-white tracking-tight mb-2">Arcade Meteor Typing Game</h3>
              <p className="text-sm text-slate-300 max-w-sm ml-auto mr-auto leading-relaxed mb-6 font-mono text-[11px]">
                Meteors are descending with letters. Help neutralize them before they slam! Type corresponding letters and hit space/characters to explode them.
              </p>
              <button
                id="btn-start-game"
                onClick={startNewGame}
                className="bg-purple-600 shadow-lg shadow-purple-900/35 hover:bg-purple-500 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 cursor-pointer transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-white text-white" /> Start Mission
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#130122]/90 backdrop-blur-md text-center p-6 z-10 animate-fade-in" id="gameover-overlay">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30 text-rose-500 mb-4 shadow">
                💥
              </div>
              <h3 className="font-sans text-3xl font-bold text-rose-400 tracking-tight mb-2">Mission Failed</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-1 font-mono text-[11px]">
                Your station sustained severe impact damage.
              </p>
              <div className="glass px-6 py-3 rounded-2xl mb-6 mt-3 flex gap-8 text-left" id="gameover-metrics">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold tracking-wider">Final Score</span>
                  <span className="text-xl font-bold text-purple-300">{score} pts</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold tracking-wider">Max Level</span>
                  <span className="text-xl font-bold text-purple-400">Lvl {level}</span>
                </div>
                {score >= highScore && score > 0 && (
                  <div className="flex flex-col justify-center">
                    <span className="text-xs text-purple-300 font-bold uppercase animate-pulse">New High Score!</span>
                  </div>
                )}
              </div>
              <button
                id="btn-restart-game"
                onClick={startNewGame}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg shadow-purple-900/35 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          {/* Active Falling Words */}
          {isPlaying && words.length === 0 && (
            <div className="absolute inset-x-0 top-1/3 text-center text-xs text-slate-400 font-mono italic animate-pulse" id="empty-state-game">
              Awaiting standard descent vectors...
            </div>
          )}

          {isPlaying &&
            words.map((word) => (
              <div
                id={`falling-word-${word.id}`}
                key={word.id}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: "translateX(-50%)",
                }}
                className={`absolute px-3 py-1.5 rounded-xl border font-mono text-sm shadow-xl whitespace-nowrap transition-all duration-75 flex flex-col items-center ${
                  word.y > 60
                    ? "border-rose-500/30 bg-rose-950/60 text-rose-200 shadow-md shadow-rose-950/30 animate-pulse"
                    : "border-purple-500/25 bg-black/65 backdrop-blur-sm text-purple-200 shadow-lg shadow-purple-900/20"
                }`}
              >
                {/* Visual meteor trail / pointer dots */}
                <div className="opacity-65 text-[10px] text-purple-400 font-mono select-none pointer-events-none mb-0.5">
                  ☄
                </div>
                <div className="font-bold tracking-wide">
                  {word.text}
                </div>
                {/* Bottom gauge bar inside the word tag */}
                <div className="w-full bg-black/50 h-1 mt-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${word.y > 60 ? "bg-rose-500 animate-pulse" : "bg-purple-500"}`}
                    style={{ width: `${100 - word.y}%` }}
                  ></div>
                </div>
              </div>
            ))}

          {/* Bottom danger boundary zone overlay line */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-rose-500/5 to-transparent border-t border-dashed border-rose-500/20 select-none pointer-events-none flex items-center justify-center" id="danger-line">
            <span className="text-[10px] text-rose-400/50 font-mono tracking-widest uppercase font-semibold">Boundary Danger Zone</span>
          </div>
        </div>

        {/* Typing Input Section */}
        <div className="bg-black/20 p-5 border-t border-white/5" id="game-input-row">
          <div className="max-w-md mx-auto relative flex gap-3" id="game-input-group">
            <input
              id="game-typing-input"
              type="text"
              className="grow glass border-white/10 text-white focus:border-purple-500 text-center font-mono text-xl py-3 px-4 rounded-xl shadow-inner outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={isPlaying ? "Type the words above..." : "Press start to activate..."}
              value={inputValue}
              onChange={handleInputChange}
              disabled={!isPlaying || gameOver}
              autoComplete="off"
              autoFocus={isPlaying}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
