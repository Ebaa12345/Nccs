// 📁 src/components/ProgressBar.jsx
export default function ProgressBar({ logged, estimated, showLabel = true }) {
  const pct = estimated > 0 ? Math.min(Math.round((logged / estimated) * 100), 100) : 0;
  const color = pct >= 100 ? "from-emerald-500 to-emerald-400"
    : pct >= 60 ? "from-indigo-500 to-blue-400"
    : pct > 0   ? "from-amber-400 to-amber-300"
    : "from-gray-200 to-gray-200 dark:from-gray-700 dark:to-gray-700";

  return (
    <div className="flex items-center gap-2 min-w-[130px]">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-[11px] w-9 text-right font-mono font-semibold ${
          pct >= 100 ? "text-emerald-500" : pct > 0 ? "text-gray-500" : "text-gray-300 dark:text-gray-600"
        }`}>
          {pct}%
        </span>
      )}
    </div>
  );
}
