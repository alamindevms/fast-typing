import React from "react";
import { TestResult } from "../types";
import { BarChart3, TrendingUp, History, Trash2, Calendar, Sparkles } from "lucide-react";

interface DashboardStatsProps {
  results: TestResult[];
  onClearHistory: () => void;
}

export default function DashboardStats({ results, onClearHistory }: DashboardStatsProps) {
  // Compute standard summary aggregates
  const totalRounds = results.length;
  
  const averageWpm = totalRounds > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.wpm, 0) / totalRounds) 
    : 0;

  const maxWpm = totalRounds > 0 
    ? Math.max(...results.map((r) => r.wpm)) 
    : 0;

  const avgAccuracy = totalRounds > 0
    ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / totalRounds)
    : 0;

  const totalTimeSeconds = results.reduce((acc, r) => acc + r.elapsedTime, 0);
  const totalTimeMinutes = (totalTimeSeconds / 60).toFixed(1);

  // Generate SVG graph coordinates for sparkline WPM charting
  const renderSparkline = () => {
    if (totalRounds < 2) return null;

    const chartSamples = results.slice(-15); // Show up to last 15 attempts
    const width = 500;
    const height = 100;
    const padding = 15;

    const values = chartSamples.map((r) => r.wpm);
    const minVal = Math.max(0, Math.min(...values) - 10);
    const maxVal = Math.max(...values) + 10;
    const valueRange = maxVal - minVal || 1;

    // Map each index & value to (x, y) coordinates
    const points = chartSamples.map((res, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (chartSamples.length - 1);
      const y = height - padding - ((res.wpm - minVal) * (height - padding * 2)) / valueRange;
      return { x, y, wpm: res.wpm, idx: idx + 1 };
    });

    const pathData = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaData = points.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z` 
      : "";

    return (
      <div className="glass p-6 rounded-[32px] shadow-2xl mt-6 relative z-10" id="sparkline-trend-container">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="font-sans text-sm font-semibold text-slate-200">WPM Speed Trajectory (Last 15 Sessions)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-medium">Real-time learning velocity</span>
        </div>

        <div className="relative h-28 w-full" id="sparkline-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid helper horizontal dotted lines */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#ffffff" strokeDasharray="3 3" opacity="0.1" />
            
            {/* Ambient Shadow Area */}
            {areaData && <path d={areaData} fill="url(#areaGradient)" />}
            
            {/* Line Trace */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Glowing indicators mapping */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  className="fill-[#04040a] stroke-purple-400 hover:r-5 transition duration-75 cursor-pointer"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-purple-300 font-semibold"
                >
                  {p.wpm}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-slate-100 flex flex-col gap-6" id="stats-dashboard-root">
      
      {/* 4 Grid Aggregates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-summary-grid">
        <div className="glass p-5 rounded-[24px] flex flex-col gap-3 relative overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300" id="card-avg-wpm">
          <div className="absolute top-2 right-2 opacity-5 font-mono text-4xl">WPM</div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest font-mono">Average Speed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-bold text-purple-400">{averageWpm}</span>
            <span className="text-xs text-slate-500 font-mono">WPM</span>
          </div>
        </div>

        <div className="glass p-5 rounded-[24px] flex flex-col gap-3 relative overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300" id="card-max-wpm">
          <div className="absolute top-2 right-2 opacity-5 font-mono text-4xl">MAX</div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest font-mono">Personal Record</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-bold text-purple-300">{maxWpm}</span>
            <span className="text-xs text-slate-500 font-mono">WPM</span>
          </div>
        </div>

        <div className="glass p-5 rounded-[24px] flex flex-col gap-3 relative overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300" id="card-avg-accuracy">
          <div className="absolute top-2 right-2 opacity-10 font-mono text-4xl">%</div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest font-mono">Avg Accuracy</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-bold text-purple-400">{avgAccuracy}</span>
            <span className="text-xs font-semibold text-slate-500">%</span>
          </div>
        </div>

        <div className="glass p-5 rounded-[24px] flex flex-col gap-3 relative overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-300" id="card-practice-time">
          <div className="absolute top-2 right-2 opacity-5 font-mono text-4xl">MIN</div>
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest font-mono">Practice Time</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-bold text-purple-300">{totalTimeMinutes}</span>
            <span className="text-xs text-slate-500 font-mono">Min</span>
          </div>
        </div>
      </div>

      {/* Trajectory visualization sparkline */}
      {totalRounds >= 2 ? (
        renderSparkline()
      ) : (
        <div className="glass p-6 rounded-[24px] text-center text-slate-400 text-xs italic shadow-md cursor-default" id="empty-sparkline">
          Complete remaining tests ({totalRounds}/2) to render learning velocity models.
        </div>
      )}

      {/* Match History Log grid */}
      <div className="glass rounded-[32px] shadow-2xl overflow-hidden relative z-10" id="history-panel-outer">
        <div className="p-5 border-b border-white/5 flex items-center justify-between" id="header-details">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <h3 className="font-sans font-bold text-slate-200 text-sm">Session History Logs</h3>
          </div>
          
          {totalRounds > 0 && (
            <button
              id="btn-clear-history"
              onClick={onClearHistory}
              className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-500/5 py-1 px-2.5 rounded transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset History
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center" id="empty-history-screen">
            <BarChart3 className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">No sessions logged yet. Activate standard practice modes to begin plotting progress.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" id="rows-wrapper">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-black/25 border-b border-white/5 text-purple-300">
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wide">Date</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wide">Practice Category</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wide font-bold">WPM</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wide">Accuracy</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wide">Elapsed</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wide font-bold">Misses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.slice().reverse().map((res) => (
                  <tr key={res.id} className="hover:bg-white/5 transition" id={`history-row-${res.id}`}>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-60 text-slate-400" />
                        <span>{res.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      <span className="capitalize text-purple-300 text-[9px] mr-2 bg-purple-500/10 border border-purple-500/15 px-1.5 py-0.5 rounded-md font-semibold tracking-wider font-mono">
                        {res.mode}
                      </span>
                      {res.category}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-300">{res.wpm}</td>
                    <td className="py-3 px-4 font-semibold text-purple-400">{res.accuracy}%</td>
                    <td className="py-3 px-4 text-slate-400">{res.elapsedTime}s</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">{res.errors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
