import React from "react";

interface VirtualKeyboardProps {
  activeKey: string;      // The key currently pressed by the user
  nextChar: string;       // The next character the user needs to type
  showFingers: boolean;   // Toggle displaying finger suggestions
}

export default function VirtualKeyboard({
  activeKey,
  nextChar,
  showFingers,
}: VirtualKeyboardProps) {
  // Finger color mapping
  const getFingerColor = (char: string): string => {
    const c = char.toLowerCase();
    
    // Left Little (Pinky)
    if (["1", "q", "a", "z", "capslock", "shift", "`", "tab", "l-shift"].includes(c)) return "border-rose-500 text-rose-400 bg-rose-500/5";
    // Left Ring
    if (["2", "w", "s", "x"].includes(c)) return "border-orange-500 text-orange-400 bg-orange-500/5";
    // Left Middle
    if (["3", "e", "d", "c"].includes(c)) return "border-yellow-500 text-yellow-400 bg-yellow-500/5";
    // Left Index
    if (["4", "5", "r", "t", "f", "g", "v", "b"].includes(c)) return "border-emerald-500 text-emerald-400 bg-emerald-500/5";
    
    // Space (Thumbs)
    if (c === " " || c === "space") return "border-sky-500 text-sky-400 bg-sky-500/5";
    
    // Right Index
    if (["6", "7", "y", "u", "h", "j", "n", "m"].includes(c)) return "border-teal-500 text-teal-400 bg-teal-500/5";
    // Right Middle
    if (["8", "i", "k", ",", "<"].includes(c)) return "border-indigo-500 text-indigo-400 bg-indigo-500/5";
    // Right Ring
    if (["9", "o", "l", ".", ">"].includes(c)) return "border-violet-500 text-violet-400 bg-violet-500/5";
    // Right Little (Pinky)
    if (["0", "p", ";", ":", "/", "?", "-", "_", "=", "+", "[", "]", "{", "}", "\\", "|", "'", "\"", "enter", "backspace", "r-shift"].includes(c)) {
      return "border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/5";
    }

    return "border-slate-700 text-slate-400";
  };

  const getFingerName = (char: string): string => {
    const c = char.toLowerCase();
    if (c === " ") return "Space (Both Thumbs)";
    if (["1", "q", "a", "z", "`"].includes(c)) return "Left Pinky";
    if (["2", "w", "s", "x"].includes(c)) return "Left Ring Finger";
    if (["3", "e", "d", "c"].includes(c)) return "Left Middle Finger";
    if (["4", "5", "r", "t", "f", "g", "v", "b"].includes(c)) return "Left Index Finger";
    if (["6", "7", "y", "u", "h", "j", "n", "m"].includes(c)) return "Right Index Finger";
    if (["8", "i", "k", ",","<"].includes(c)) return "Right Middle Finger";
    if (["9", "o", "l", ".", ">"].includes(c)) return "Right Ring Finger";
    return "Right Pinky";
  };

  // Layout structure of keyboard
  const rows = [
    [
      { key: "`", display: "~ `", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "1", display: "! 1", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "2", display: "@ 2", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "3", display: "# 3", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "4", display: "$ 4", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "5", display: "% 5", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "6", display: "^ 6", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "7", display: "& 7", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "8", display: "* 8", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "9", display: "( 9", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "0", display: ") 0", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "-", display: "_ -", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "=", display: "+ =", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "backspace", display: "⌫ backspace", width: "w-16 sm:w-20 h-10 sm:h-12 grow" },
    ],
    [
      { key: "tab", display: "⇥ Tab", width: "w-14 sm:w-16 h-10 sm:h-12" },
      { key: "q", display: "Q", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "w", display: "W", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "e", display: "E", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "r", display: "R", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "t", display: "T", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "y", display: "Y", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "u", display: "U", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "i", display: "I", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "o", display: "O", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "p", display: "P", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "[", display: "{ [", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "]", display: "} ]", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "\\", display: "| \\", width: "w-12 sm:w-16 h-10 sm:h-12 grow" },
    ],
    [
      { key: "capslock", display: "⇪ Caps", width: "w-16 sm:w-20 h-10 sm:h-12" },
      { key: "a", display: "A", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "s", display: "S", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "d", display: "D", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "f", display: "F", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "g", display: "G", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "h", display: "H", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "j", display: "J", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "k", display: "K", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "l", display: "L", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: ";", display: ": ;", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "'", display: "\" '", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "enter", display: "⏎ Enter", width: "w-18 sm:w-22 h-10 sm:h-12 grow" },
    ],
    [
      { key: "shift", display: "⇧ Shift", width: "w-20 sm:w-24 h-10 sm:h-12" },
      { key: "z", display: "Z", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "x", display: "X", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "c", display: "C", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "v", display: "V", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "b", display: "B", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "n", display: "N", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "m", display: "M", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: ",", display: "< ,", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: ".", display: "> .", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "/", display: "? /", width: "w-10 sm:w-12 h-10 sm:h-12" },
      { key: "r-shift", display: "⇧ Shift", width: "w-20 sm:w-24 h-10 sm:h-12 grow" },
    ],
    [
      { key: "space", display: "Spacebar", width: "w-full h-10 sm:h-12 max-w-[500px]" },
    ],
  ];

  // Map special strings to core key representations
  const isKeyActive = (keyDef: string): boolean => {
    const act = activeKey?.toLowerCase();
    if (!act) return false;
    
    // Check if the base key is actually pressed, or if the shifted version is
    if (keyDef === "space") return act === " " || act === "space";
    
    // Shift key active states
    if (keyDef === "shift") return act === "shift" || act === "shiftleft" || act === "shift-left";
    if (keyDef === "r-shift") return act === "shift" || act === "shiftright" || act === "shift-right";
    
    // Key mapped checks for general keyboard layout key trigger
    if (act === keyDef) return true;
    
    // Shifted symbol mappings to match original base keys
    const shiftedMap: { [key: string]: string } = {
      "~": "`",
      "!": "1",
      "@": "2",
      "#": "3",
      "$": "4",
      "%": "5",
      "^": "6",
      "&": "7",
      "*": "8",
      "(": "9",
      ")": "0",
      "_": "-",
      "+": "=",
      "{": "[",
      "}": "]",
      "|": "\\",
      ":": ";",
      "\"": "'",
      "<": ",",
      ">": ".",
      "?": "/"
    };
    
    // If the currently active key maps to this keyDef
    if (shiftedMap[act] === keyDef) return true;
    
    // Direct case-insensitive characters (e.g., lowercase vs uppercase matches uppercase keys)
    return act === keyDef.toLowerCase();
  };

  const isKeyNext = (keyDef: string): boolean => {
    if (!nextChar) return false;
    const nc = nextChar.toLowerCase();
    
    if (keyDef === "space") return nc === " ";
    if (keyDef === "r-shift" || keyDef === "shift") {
      // If characters require shift (captials, symbols)
      return nextChar !== nc && /^[A-Z~!@#$%^&*()_+{}|:"<>?]$/.test(nextChar);
    }
    
    // Normal matches
    if (keyDef === ";" && nextChar === ":") return true;
    if (keyDef === "'" && nextChar === "\"") return true;
    if (keyDef === "," && nextChar === "<") return true;
    if (keyDef === "." && nextChar === ">") return true;
    if (keyDef === "/" && nextChar === "?") return true;
    if (keyDef === "1" && nextChar === "!") return true;
    if (keyDef === "2" && nextChar === "@") return true;
    if (keyDef === "3" && nextChar === "#") return true;
    if (keyDef === "4" && nextChar === "$") return true;
    if (keyDef === "5" && nextChar === "%") return true;
    if (keyDef === "6" && nextChar === "^") return true;
    if (keyDef === "7" && nextChar === "&") return true;
    if (keyDef === "8" && nextChar === "*") return true;
    if (keyDef === "9" && nextChar === "(") return true;
    if (keyDef === "0" && nextChar === ")") return true;
    if (keyDef === "-" && nextChar === "_") return true;
    if (keyDef === "=" && nextChar === "+") return true;
    if (keyDef === "[" && nextChar === "{") return true;
    if (keyDef === "]" && nextChar === "}") return true;
    if (keyDef === "\\" && nextChar === "|") return true;

    return nc === keyDef;
  };

  return (
    <div className="w-full flex flex-col items-center select-none" id="kb-wrapper font-mono">
      {/* Keyboard Container */}
      <div className="glass p-3 sm:p-5 rounded-[32px] shadow-2xl w-full max-w-4xl flex flex-col gap-1.5 relative z-10" id="kb-container">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className={`flex justify-center w-full gap-1 sm:gap-1.5 ${rIdx === 4 ? "mt-1.5" : ""}`}>
            {row.map((item) => {
              const active = isKeyActive(item.key);
              const next = isKeyNext(item.key);
              const isSpecial = ["capslock", "tab", "shift", "r-shift", "enter", "backspace", "\\", "space"].includes(item.key);
              
              const fingerTheme = showFingers ? getFingerColor(item.key) : "border-white/5 text-slate-300 glass glass-interactive";
              
              let styling = `${item.width} rounded-xl flex items-center justify-center font-mono text-xs font-semibold border transition-all duration-75 select-none `;
              
              if (active) {
                // Key pressed - glow purple
                styling += "bg-purple-600 text-white border-purple-400 scale-[0.96] shadow-inner shadow-purple-900/50 shadow-md shadow-purple-500/30";
              } else if (next) {
                // Next character prompt
                styling += "bg-purple-500/20 text-purple-200 border-purple-400 animate-pulse scale-[1.02] ring-4 ring-purple-500/25";
              } else {
                styling += `${fingerTheme} hover:bg-white/5 `;
              }

              return (
                <div
                  id={`key-${item.key}`}
                  key={item.key}
                  className={styling}
                >
                  <span className={isSpecial ? "text-[10px] sm:text-xs font-bold" : "text-xs sm:text-sm"}>
                    {item.display}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Guide Ribbon */}
      {nextChar && (
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-mono text-slate-300 text-center glass py-2 px-5 rounded-full border border-white/10 shadow-lg" id="kb-ribbon">
          <div>
            Next Character: <span className="text-purple-300 font-bold bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/20">{nextChar === " " ? "Space" : nextChar}</span>
          </div>
          {showFingers && (
            <div className="hidden sm:block text-slate-400">
              Suggested Finger: <span className="text-purple-300 font-semibold">{getFingerName(nextChar)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
