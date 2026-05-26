import { Lesson, PresetTexts } from "./types";

export const LESSONS: Lesson[] = [
  {
    id: "home_row_basic",
    name: "Home Row Foundations",
    description: "Build muscle memory on the anchor row: A, S, D, F and J, K, L, ;",
    difficulty: "Beginner",
    text: "asdf jkl; asdf jkl; asdfg hjkl; fff jjj ddd kkk sss lll aaa ;;; asdf jkl; asdfg hjkl; fjf dkd sls a;a fg hj",
  },
  {
    id: "home_row_words",
    name: "Home Row Real Words",
    description: "Combine only home row keys to write actual words",
    difficulty: "Beginner",
    text: "salad flask glass fall kansas dallas dash gash slag ask glad dad sad all shall flags alfalfa fads lash galls",
  },
  {
    id: "top_row_basic",
    name: "Top Row Introductions",
    description: "Reach upward to master Q, W, E, R, T and Y, U, I, O, P",
    difficulty: "Beginner",
    text: "qwer uiop qwer uiop qwert yuiop req ruy wet uio pow rot rip pit toy tie rye pre out put wet try yet our tour",
  },
  {
    id: "top_row_words",
    name: "Top Row Vocabulary",
    description: "Combine home row and top row keys for standard typing",
    difficulty: "Intermediate",
    text: "type writer power quiet properly territory poetry route power query write reply worry yellow turtle file high life",
  },
  {
    id: "bottom_row_basic",
    name: "Bottom Row Foundations",
    description: "Practice the low keys: Z, X, C, V and B, N, M, ,, .",
    difficulty: "Beginner",
    text: "zxcv bnm, zxcv bnm, zxcvbnm, cxv bnm zxc mnb cvb vbn xzc zzz xxx ccc vvv bbb nnn mmm zxcv bnm, .z. .x. .c.",
  },
  {
    id: "bottom_row_words",
    name: "Bottom Row Real Words",
    description: "Drill short terms using home, top, and bottom rows",
    difficulty: "Intermediate",
    text: "man cob web wax zinc box zone zoom van cabin block mimic mixed zebra voice carbon matrix browser volume custom click",
  },
  {
    id: "numbers_symbols",
    name: "Numbers & Symbol Shifting",
    description: "Improve symbol speed using the shift key and top-row integers",
    difficulty: "Advanced",
    text: "123 456 789 0!@ #$% ^&* ()_ +={} []|:; <.> ?/ 10.5% + 23 = 33! users[i] = { id: 99 }; value = (x > y) ? true : false;",
  },
  {
    id: "full_pangram",
    name: "Pangram Fluidity",
    description: "Sentences that contain every single letter of the English alphabet",
    difficulty: "Intermediate",
    text: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
  },
];

export const PRESET_TEXTS: PresetTexts = {
  quotes: [
    {
      name: "Winston Churchill",
      level: "easy",
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts in the long run.",
    },
    {
      name: "Steve Jobs",
      level: "easy",
      text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Do not settle.",
    },
    {
      name: "Albert Einstein",
      level: "medium",
      text: "In the middle of difficulty lies opportunity. A person who never made a mistake never tried anything new.",
    },
    {
      name: "Oscar Wilde",
      level: "easy",
      text: "Be yourself; everyone else is already taken. To live is the rarest thing in the world. Most people exist, that is all.",
    },
    {
      name: "William Shakespeare",
      level: "medium",
      text: "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
    },
  ],
  code: [
    {
      name: "JavaScript async/fetch",
      level: "medium",
      text: "const fetchUserData = async (id) => { const response = await fetch(`/api/user/${id}`); return await response.json(); };",
    },
    {
      name: "Python Binary Search",
      level: "hard",
      text: "def binary_search(arr, target): left, right = 0, len(arr) - 1 while left <= right: mid = (left + right) // 2 if arr[mid] == target: return mid",
    },
    {
      name: "TypeScript Generic Interface",
      level: "hard",
      text: "interface ApiResponse<T> { success: boolean; data: T; error?: { code: number; message: string; }; timestamp: number; }",
    },
    {
      name: "HTML/CSS Container",
      level: "medium",
      text: "<div class=\"flex items-center justify-between p-4 bg-slate-900 rounded-lg shadow-md border border-slate-750\">",
    },
  ],
  general: [
    {
      name: "Artificial Intelligence",
      level: "medium",
      text: "Artificial intelligence is transforming industries by automating repetitive tasks, enhancing decision making, and creating adaptive user interfaces.",
    },
    {
      name: "Space Exploration",
      level: "medium",
      text: "Humanity's journey to Mars requires breakthrough rocketry, self-sustaining ecosystems, and extreme structural engineering to survive the vacuum.",
    },
    {
      name: "Mechanical Keyboards",
      level: "easy",
      text: "Mechanical keyboards utilize individual switches beneath each key, offering distinct tactile bumps, auditory clicks, and faster actuation times.",
    },
    {
      name: "Nature Trails",
      level: "easy",
      text: "Walking through a dense forest calms the nervous system, filters the surrounding air, and anchors our thoughts to the quiet rhythm of the earth.",
    },
  ],
};

export const GAME_WORDS: string[] = [
  "react", "typescript", "tailwind", "vite", "javascript", "express", "nodejs", "gemini",
  "engine", "keyboard", "typing", "master", "speed", "accuracy", "performance", "muscle",
  "memory", "focus", "flow", "sound", "effect", "prompt", "lesson", "drill", "quote",
  "coding", "web", "server", "api", "database", "client", "button", "screen", "visual",
  "arcade", "meteor", "laser", "galaxy", "rocket", "nebula", "orbit", "planet", "stars",
  "quantum", "vector", "binary", "compiler", "variable", "function", "array", "object",
  "string", "integer", "boolean", "module", "router", "endpoint", "packet", "network",
  "latency", "responsive", "layout", "flexbox", "padding", "margin", "shadow", "border",
  "color", "canvas", "context", "audio", "frequency", "oscillator", "melody", "chime",
  "cursor", "hover", "active", "trigger", "history", "streak", "record", "trophy",
  "crown", "wizard", "warrior", "ninja", "expert", "pro", "champion", "legend", "ace",
  "hacker", "cipher", "matrix", "nexus", "vertex", "pixel", "hardware", "terminal", "shell",
  "process", "thread", "stream", "buffer", "promise", "async", "await", "import", "export"
];
