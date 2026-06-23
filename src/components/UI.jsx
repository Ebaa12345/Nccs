// ── Avatar colors ────────────────────────────────────────
const PALETTES = [
  { light: "bg-indigo-100 text-indigo-700",  dark: "dark:bg-indigo-900 dark:text-indigo-300" },
  { light: "bg-emerald-100 text-emerald-700",dark: "dark:bg-emerald-900 dark:text-emerald-300" },
  { light: "bg-amber-100 text-amber-700",    dark: "dark:bg-amber-900 dark:text-amber-300" },
  { light: "bg-rose-100 text-rose-700",      dark: "dark:bg-rose-900 dark:text-rose-300" },
  { light: "bg-sky-100 text-sky-700",        dark: "dark:bg-sky-900 dark:text-sky-300" },
];
const cache = {}; let ci = 0;
export function avatarClass(name) {
  if (!cache[name]) { cache[name] = PALETTES[ci % PALETTES.length]; ci++; }
  const p = cache[name];
  return `${p.light} ${p.dark}`;
}
export function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Avatar ───────────────────────────────────────────────
export function Avatar({ name, size = "sm" }) {
  const sz = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" }[size];
  return (
    <div className={`${sz} ${avatarClass(name)} rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-colors duration-300`}>
      {initials(name)}
    </div>
  );
}

// ── StatusBadge ──────────────────────────────────────────
const STATUS = {
  "Идэвхтэй":        { cls: "badge-green",  dot: "bg-emerald-500" },
  "Хүлээгдэж байна": { cls: "badge-yellow", dot: "bg-amber-500" },
  "Идэвхгүй":        { cls: "badge-red",    dot: "bg-red-500" },
};
export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS["Идэвхгүй"];
  return (
    <span className={s.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Toast ────────────────────────────────────────────────
// ✅ ЗАСВАР: msg → message (App.jsx <Toast message={toast} /> гэж дуудаж байна)
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 z-[300] flex items-center gap-2.5 animate-slide-up
                    bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800
                    text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-2xl shadow-xl">
      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs">✓</span>
      {message}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────
export function Modal({ open, title, onClose, onSave, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="btn-icon text-lg">×</button>
        </div>
        <div>{children}</div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose} className="btn-sm">Цуцлах</button>
          <button onClick={onSave} className="px-4 py-1.5 text-xs font-medium rounded-lg
                                              bg-gray-900 dark:bg-white text-white dark:text-gray-900
                                              hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors">
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ConfirmModal ─────────────────────────────────────────
// ✅ ЗАСВАР: message → title + desc (TimeLogsPage дотор title, desc props дамжуулж байна)
export function ConfirmModal({ open, title, desc, onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-xs text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4 text-2xl">⚠</div>
        {title && <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>}
        {desc  && <p  className="text-xs text-gray-500 dark:text-gray-400 mb-5">{desc}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 btn-sm">Цуцлах</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-1.5 text-xs font-medium rounded-lg
                                                  bg-red-500 text-white hover:bg-red-600 transition-colors">
            Устгах
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FormGroup ────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────
// ✅ ЗАСВАР: message → title + desc (TimeLogsPage дотор title, desc props дамжуулж байна)
export function EmptyState({ icon = "📭", title, desc }) {
  return (
    <div className="py-12 text-center animate-fade-in">
      <div className="text-3xl mb-2">{icon}</div>
      {title && <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>}
      {desc  && <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{desc}</p>}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────
// ✅ ЗАСВАР: animate-spin-slow → animate-spin (Tailwind дотор байхгүй class)
export function Spinner() {
  return (
    <svg className="animate-spin w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
