import React, { useState, useEffect } from "react";
import { Lesson, TestResult, TypingLevel } from "./types";
import { LESSONS, PRESET_TEXTS } from "./lessonsData";
import { setVolume, setSoundType, getVolume, getSoundType, playKeySound, playChimeSound, playErrorSound } from "./utils/sound";

import VirtualKeyboard from "./components/VirtualKeyboard";
import FallingWordsGame from "./components/FallingWordsGame";
import DashboardStats from "./components/DashboardStats";
import TypingCore from "./components/TypingCore";

import {
  Keyboard,
  BookOpen,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  BookMarked,
  Code,
  FileText,
  Clock,
  Settings,
  Flame,
} from "lucide-react";

export default function App() {
  // Navigation tabs:
  const [activeTab, setActiveTab] = useState<"lessons" | "speed_test" | "arcade" | "analytics">("lessons");

  // Keyboard and finger cues
  const [activePressedKey, setActivePressedKey] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(true);
  const [isFingerGuideVisible, setIsFingerGuideVisible] = useState<boolean>(true);

  // Sound configurations
  const [volume, setVolumeState] = useState<number>(0.5);
  const [currentSoundType, setCurrentSoundTypeState] = useState<"mechanical" | "typewriter" | "bubble" | "muted">("mechanical");

  // Career match historical statistics logs
  const [results, setResults] = useState<TestResult[]>([]);

  // Sound initialization/save logic
  useEffect(() => {
    // Volume state load
    const savedVol = localStorage.getItem("tm_sound_volume");
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      setVolumeState(parsed);
      setVolume(parsed);
    } else {
      setVolume(0.5);
    }

    // Sound profile load
    const savedType = localStorage.getItem("tm_sound_type") as any;
    if (savedType) {
      setCurrentSoundTypeState(savedType);
      setSoundType(savedType);
    } else {
      setSoundType("mechanical");
    }

    // Results load
    const savedResults = localStorage.getItem("tm_career_results");
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (err) {
        console.error("Failed to load historical statistics:", err);
      }
    }
  }, []);

  // Set sound switches
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
    localStorage.setItem("tm_sound_volume", v.toString());
  };

  const handleSoundTypeChange = (type: "mechanical" | "typewriter" | "bubble" | "muted") => {
    setCurrentSoundTypeState(type);
    setSoundType(type);
    localStorage.setItem("tm_sound_type", type);
    // play soft test key sound to confirm change has succeeded
    if (type !== "muted") {
      setTimeout(() => playKeySound(), 50);
    }
  };

  // Keyboard active event listeners
  const captureKeyboardTrigger = (key: string, nextChar: string) => {
    setActivePressedKey(key);
    // automatically pop of key highlight for smooth click animations
    setTimeout(() => {
      setActivePressedKey((curr) => (curr === key ? "" : curr));
    }, 120);
  };

  // Record a completed score segment
  const handleSaveResult = (
    wpm: number,
    accuracy: number,
    elapsedTime: number,
    errors: number,
    charsTyped: number,
    mode: "lesson" | "test" | "game",
    category: string
  ) => {
    const newRecord: TestResult = {
      id: Math.random().toString(36).substring(2, 9),
      mode,
      category,
      wpm,
      accuracy,
      elapsedTime,
      charsTyped,
      errors,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };

    setResults((prev) => {
      const updated = [...prev, newRecord];
      localStorage.setItem("tm_career_results", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you absolutely sure you want to delete all historical logs and achievements? This action is irreversible.")) {
      setResults([]);
      localStorage.removeItem("tm_career_results");
      localStorage.removeItem("typing_master_game_high");
    }
  };

  // Tab View Subsections:

  // --- 1. LESSONS / CLASSROOM MODULE ---
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const activeLessonObject = LESSONS[activeLessonIdx];

  const renderLessonsView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full align-start relative z-10" id="view-lessons-panel">
        {/* Left Side: Lesson Checklist Menu */}
        <div className="lg:col-span-4 glass rounded-[32px] p-5 flex flex-col gap-4 overflow-hidden shadow-2xl" id="lessons-sidebar-panel">
          <div className="flex items-center gap-2 mb-1" id="lessons-sidebar-header">
            <BookMarked className="w-5 h-5 text-purple-400" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">Muscle Drill Classroom</h3>
          </div>
          
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1.5" id="lessons-menu-list">
            {LESSONS.map((les, idx) => {
              const isActive = idx === activeLessonIdx;
              const difficultyThemes = {
                Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10",
                Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/10",
                Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/10",
              }[les.difficulty];

              return (
                <button
                  id={`btn-select-lesson-${les.id}`}
                  key={les.id}
                  onClick={() => setActiveLessonIdx(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "glass-purple border-purple-500/40 shadow-inner bg-purple-500/10"
                      : "glass glass-interactive border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1" id="lesson-card-header">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${difficultyThemes}`}>
                      {les.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-purple-300">Drill #{idx + 1}</span>
                  </div>
                  <h4 className="font-sans text-[13px] font-semibold text-slate-100">{les.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">{les.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Typing core and keyboard elements */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="lessons-primary-panel">
          <div className="glass rounded-[32px] p-6 shadow-2xl flex flex-col" id="classroom-typing-card">
            <div className="mb-4" id="classroom-title">
              <span className="text-purple-400 text-xs font-mono uppercase tracking-widest block font-bold">Currently practicing</span>
              <h2 className="font-sans text-xl font-bold text-white">{activeLessonObject.name}</h2>
            </div>

            <TypingCore
              mode="lesson"
              text={activeLessonObject.text}
              category={`Lesson: ${activeLessonObject.name}`}
              onKeystroke={captureKeyboardTrigger}
              onFinish={(w, acc, duration, errs, chars) => {
                handleSaveResult(w, acc, duration, errs, chars, "lesson", activeLessonObject.name);
              }}
            />
          </div>

          {/* Render integrated interactive keyboard underneath drills */}
          {isKeyboardVisible && (
            <div className="glass rounded-[32px] p-5 shadow-2xl" id="g-keyboard-panel">
              <VirtualKeyboard
                activeKey={activePressedKey}
                nextChar="" // updated by child event directly or passed via core triggers
                showFingers={isFingerGuideVisible}
              />
            </div>
          )}
        </div>
      </div>
    );
  };


  // --- 2. SPEED TESTING MODULE (PRACTICE + GENERATIVE AI) ---
  const [testType, setTestType] = useState<"presets" | "custom" | "ai">("presets");
  const [activeCategory, setActiveCategory] = useState<"quotes" | "code" | "general">("quotes");
  const [activePresetIdx, setActivePresetIdx] = useState(0);

  // Speed test configurations
  const [customText, setCustomText] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number | undefined>(30); // 30s default

  // Custom AI topic prompts states
  const [aiTopic, setAiTopic] = useState("");
  const [aiLevel, setAiLevel] = useState<TypingLevel>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [generatedPromptText, setGeneratedPromptText] = useState("");

  // Loaded target test text resolver
  const getSpeedTestParagraph = (): { text: string; catName: string } => {
    if (testType === "ai" && generatedPromptText) {
      return { text: generatedPromptText, catName: `AI: ${aiTopic || "Custom Theme"}` };
    }
    if (testType === "custom") {
      return { 
        text: customText.trim() || "The path to keyboard victory involves maintaining quiet focus, relaxed shoulders, and natural finger anchors over the standard home row markers.", 
        catName: "Custom text" 
      };
    }
    // Presets
    const chosenList = PRESET_TEXTS[activeCategory];
    const chosen = chosenList[activePresetIdx] || chosenList[0];
    return { text: chosen.text, catName: `${activeCategory === "code" ? "Code" : activeCategory === "quotes" ? "Quotes" : "Articles"}: ${chosen.name}` };
  };

  const { text: typingTestText, catName: typingTestCatName } = getSpeedTestParagraph();

  // Call Express API route to generate prompts using Gemini
  const handleGenerateAIChallenge = async () => {
    if (!aiTopic.trim()) {
      setAiError("Please supply a topic theme (e.g., 'Space battles', 'React hooks', 'Coffee Brewing').");
      return;
    }

    setIsGenerating(true);
    setAiError("");
    setGeneratedPromptText("");

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), level: aiLevel }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Network error. Failed to connect with Gemini API model.");
      }

      const generatedStr = data.prompt;
      if (generatedStr) {
        setGeneratedPromptText(generatedStr);
        playChimeSound(); // success feedback sound
      } else {
        throw new Error("Received empty generated prompt response from server.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An expected error occured during Gemini prompt generation. Fallback presets will stand.");
      playErrorSound();
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSpeedTestView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full align-start relative z-10" id="view-speedtest-panel">
        
        {/* Left Control Board Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-5 glass rounded-[32px] p-5 shadow-2xl" id="speedtest-sidebar-panel">
          <div>
            <h3 className="font-sans font-bold text-slate-100 flex items-center gap-2 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" /> Challenge Configuration
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">Configure timing caps and textual presets.</p>
          </div>

          {/* Test Type Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/20 border border-white/5 p-1 rounded-xl font-sans text-xs" id="tabs-presets-mode">
            <button
              onClick={() => setTestType("presets")}
              className={`py-1.5 px-2.5 rounded-lg text-center font-bold cursor-pointer transition-all ${
                testType === "presets" ? "glass text-purple-400 shadow-inner" : "text-slate-400 hover:text-white"
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setTestType("ai")}
              className={`py-1.5 px-2.5 rounded-lg text-center font-bold cursor-pointer transition-all flex items-center justify-center gap-1 ${
                testType === "ai" ? "glass text-purple-400 shadow-inner" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🪄 AI Prompt</span>
            </button>
            <button
              onClick={() => setTestType("custom")}
              className={`py-1.5 px-2.5 rounded-lg text-center font-bold cursor-pointer transition-all ${
                testType === "custom" ? "glass text-purple-400 shadow-inner" : "text-slate-400 hover:text-white"
              }`}
            >
              Paste
            </button>
          </div>

          {/* SUB-SECTION A: CLASSIC PRESETS PANEL */}
          {testType === "presets" && (
            <div className="flex flex-col gap-4" id="presets-panel-group">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Select Category</span>
                <div className="grid grid-cols-3 gap-1 bg-black/20 border border-white/5 p-1 rounded-xl text-[11px]" id="cats-toggle">
                  {(["quotes", "code", "general"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setActivePresetIdx(0);
                      }}
                      className={`py-1 rounded-md text-center cursor-pointer transition-all capitalize ${
                        activeCategory === cat ? "glass text-purple-400 font-bold bg-[#a855f7]/10" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat === "general" ? "Articles" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets List scroll */}
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto" id="presets-scroller">
                {PRESET_TEXTS[activeCategory].map((p, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => setActivePresetIdx(pIdx)}
                    className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      pIdx === activePresetIdx
                        ? "glass-purple border-purple-500/40 text-purple-400 bg-purple-500/10 shadow-inner"
                        : "glass glass-interactive text-slate-400 border-white/5"
                    }`}
                  >
                    <div className="font-bold flex justify-between">
                      <span>{p.name}</span>
                      <span className="text-[9px] font-mono opacity-60 uppercase">{p.level}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION B: GEMINI AI DYNAMIC GENERATOR */}
          {testType === "ai" && (
            <div className="flex flex-col gap-3" id="ai-generator-panel">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Concept / Topic Theme</span>
                <input
                  type="text"
                  placeholder="e.g. quantum computing, baking apple pie, cybernetics"
                  className="glass border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500 font-sans"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Level Complexity</span>
                <div className="grid grid-cols-3 gap-1 bg-black/20 border border-white/5 p-1 rounded-xl text-[10px] font-semibold text-center mt-0.5">
                  {(["easy", "medium", "hard"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setAiLevel(lvl)}
                      className={`py-1 rounded capitalize cursor-pointer transition ${
                        aiLevel === lvl ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] p-2 rounded-xl" id="ai-err-msg">
                  {aiError}
                </div>
              )}

              <button
                id="btn-gemini-builder"
                onClick={handleGenerateAIChallenge}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
                    <span>Consulting Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate custom prompt</span>
                  </>
                )}
              </button>

              {generatedPromptText && !isGenerating && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] text-center p-2 rounded-xl font-medium" id="ai-complete-badge">
                  🚀 Gemini text active! Start typing in the box.
                </div>
              )}
            </div>
          )}

          {/* SUB-SECTION C: COPY / PASTE FIELD */}
          {testType === "custom" && (
            <div className="flex flex-col gap-2" id="custom-paste-panel">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Paste Custom Characters</span>
              <textarea
                placeholder="Paste your own characters, book lines, helper logs or other scripts here..."
                rows={4}
                className="glass border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500 font-mono resize-none"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>
          )}

          {/* DURATION CONFIGURATION BAR */}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-2" id="timing-control-wrapper">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 font-sans">
              <Clock className="w-3 h-3 text-purple-400" /> Time-Limit Constraint
            </span>
            <div className="grid grid-cols-4 gap-1 bg-black/20 border border-white/5 p-1 rounded-xl text-[10px] text-center font-semibold" id="duration-selector">
              {([15, 30, 60, undefined] as const).map((secs, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDuration(secs)}
                  className={`py-1 rounded cursor-pointer transition ${
                    selectedDuration === secs ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {secs ? `${secs}s` : "Free Run"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Dynamic Typist Arena */}
        <div className="lg:col-span-8 flex flex-col gap-6" id="speedtest-primary-panel">
          <div className="glass rounded-[32px] p-6 shadow-2xl relative z-10" id="speedtest-typing-card">
            <div className="mb-4 flex justify-between items-start" id="speedtest-title">
              <div>
                <span className="text-purple-400 text-xs font-mono uppercase tracking-widest block font-bold">Mode: Speed Assessment Run</span>
                <h2 className="font-sans text-xl font-bold text-white italic">{typingTestCatName}</h2>
              </div>
              {selectedDuration && (
                <span className="font-mono text-[10px] bg-purple-500/15 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20 shadow-sm font-semibold">
                  ⚡ Scheduled: {selectedDuration}s
                </span>
              )}
            </div>

            <TypingCore
              mode="test"
              text={typingTestText}
              category={typingTestCatName}
              timeLimit={selectedDuration}
              onKeystroke={captureKeyboardTrigger}
              onFinish={(w, acc, duration, errs, chars) => {
                handleSaveResult(w, acc, duration, errs, chars, "test", typingTestCatName);
              }}
            />
          </div>

          {/* Virtual Keyboard integrated underneath speed assessment */}
          {isKeyboardVisible && (
            <div className="bg-slate-900/50 border border-slate-805 rounded-3xl p-4 sm:p-5" id="assessment-keyboard-panel">
              <VirtualKeyboard
                activeKey={activePressedKey}
                nextChar=""
                showFingers={isFingerGuideVisible}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#04040a] text-slate-200 flex flex-col font-sans relative overflow-x-hidden" id="app-structure">
      
      {/* Radial Gradient Mesh Background Accent */}
      <div className="mesh-bg"></div>

      {/* Dynamic Master Navigation Header */}
      <header className="glass sticky top-0 z-40 p-4 sm:px-6 flex items-center justify-between shadow-2xl relative" id="app-topbar">
        <div className="flex items-center gap-3 z-10" id="brand-segment">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <div className="w-5 h-5 bg-purple-500 rounded-sm rotate-45 flex items-center justify-center text-white scale-90">
              <Keyboard className="w-3.5 h-3.5 -rotate-45" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-tight flex items-center gap-1 text-white uppercase">
              TYPE<span className="text-purple-400">MASTER</span>
              <span className="text-[9px] font-mono font-bold bg-purple-500/20 px-1 py-0.5 rounded text-purple-300 ml-1 border border-purple-500/20">AI PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Precision Muscle Trainer</p>
          </div>
        </div>

        {/* Global Sound Control Ribbon */}
        <div className="flex items-center gap-4 glass px-4 py-2 rounded-full border border-white/5 shadow-lg relative z-10" id="global-sound-settings-ribbon">
          <div className="flex items-center gap-1.5" id="audio-settings-bar">
            {currentSoundType === "muted" || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            )}
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              title="Volume Slider"
            />
          </div>

          {/* Synthesizer Switch Button presets */}
          <div className="flex gap-1 border-l border-white/10 pl-3 text-[10px]" id="synth-selectors">
            {(["mechanical", "typewriter", "bubble", "muted"] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleSoundTypeChange(type)}
                className={`px-2 py-0.7 rounded cursor-pointer capitalize transition-all font-medium ${
                  currentSoundType === type 
                    ? "bg-purple-600 text-white font-semibold rounded-md shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type === "mechanical" ? "Blues" : type === "muted" ? "Mute" : type}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Primary Workspace Sections */}
      <main className="grow max-w-7xl mx-auto w-full p-4 sm:p-6" id="main-content-workspace">
        
        {/* Central Nav Rails (Sub-tabs selection rail) */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 glass rounded-3xl p-4 mb-6 shadow-2xl relative z-10" id="tab-navigation-rail">
          <div className="flex flex-wrap gap-2 text-xs font-semibold" id="tab-buttons">
            <button
              id="tab-btn-lessons"
              onClick={() => setActiveTab("lessons")}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === "lessons" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/45" 
                  : "glass glass-interactive text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-300" /> Comprehensive Lessons
            </button>
            <button
              id="tab-btn-speedtest"
              onClick={() => setActiveTab("speed_test")}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === "speed_test" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/45" 
                  : "glass glass-interactive text-slate-300 hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4 text-purple-300" /> Typing Speed Test
            </button>
            <button
              id="tab-btn-arcade"
              onClick={() => setActiveTab("arcade")}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === "arcade" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/45" 
                  : "glass glass-interactive text-slate-300 hover:text-white"
              }`}
            >
              🎮 Arcade Meteor Game
            </button>
            <button
              id="tab-btn-analytics"
              onClick={() => setActiveTab("analytics")}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === "analytics" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/45" 
                  : "glass glass-interactive text-slate-300 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 text-purple-300" /> Performance Analytics
            </button>
          </div>

          {/* Quick visual switches */}
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono border-t md:border-t-0 border-white/5 pt-3 md:pt-0" id="quick-switches">
            <label className="flex items-center gap-1.5 cursor-pointer selection:bg-none">
              <input
                id="toggle-virtual-keyboard"
                type="checkbox"
                checked={isKeyboardVisible}
                onChange={(e) => setIsKeyboardVisible(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 text-purple-600 focus:ring-1 focus:ring-purple-500 accent-purple-500"
              />
              <span>Keyboard Layout</span>
            </label>
            
            <label className="flex items-center gap-1.5 cursor-pointer selection:bg-none">
              <input
                id="toggle-finger-indicators"
                type="checkbox"
                checked={isFingerGuideVisible}
                onChange={(e) => setIsFingerGuideVisible(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 text-purple-600 focus:ring-1 focus:ring-purple-500 accent-purple-500"
                disabled={!isKeyboardVisible}
              />
              <span className={!isKeyboardVisible ? "opacity-35" : ""}>Finger Guides</span>
            </label>
          </div>
        </div>

        {/* Workspace Display Area */}
        <div id="dynamic-workspace-viewport" className="relative z-10">
          {activeTab === "lessons" && renderLessonsView()}
          {activeTab === "speed_test" && renderSpeedTestView()}
          {activeTab === "arcade" && (
            <div className="w-full" id="arcade-wrapper-inner">
              <FallingWordsGame
                onSaveScore={(pts, mode, category) => {
                  handleSaveResult(pts, 100, 45, 0, pts, mode, category); // standard game mapping
                }}
              />
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="w-full" id="stats-wrapper-inner">
              <DashboardStats
                results={results}
                onClearHistory={handleClearHistory}
              />
            </div>
          )}
        </div>
      </main>

      {/* Premium Visual Footer */}
      <footer className="glass border-t border-white/5 mt-8 p-6 flex flex-col md:flex-row items-center justify-between gap-4 select-none relative z-10" id="app-footer">
        <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">
          Typing Master AI • Certified Professional Touch Practice • 100% Client Sync
        </p>
        <div className="flex gap-4 text-slate-400 text-xs" id="footer-helpers-list">
          <span className="font-semibold block text-[10px] uppercase font-mono tracking-widest text-slate-500">Fingers Mapping Cues:</span>
          <div className="flex flex-wrap gap-2" id="finger-caps">
            <span className="flex items-center gap-1 text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/10 shadow-sm">Pinky</span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/10 shadow-sm">Ring</span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-xl border border-yellow-500/10 shadow-sm">Middle</span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/10 shadow-sm">Index</span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl border border-sky-500/10 shadow-sm">Thumbs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
