// 📁 src/pages/TasksPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import {
  MoreVertical, ClipboardList, FileText, FolderOpen, Clock,
  CalendarDays, Flag, ListChecks, Users as UsersIcon, Check,
} from "lucide-react";
import ProgressBar from "../components/ProgressBar";


const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES   = ["In progress", "Completed", "On hold"];

const PRIORITY_STYLE = {
  High:   "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900",
  Medium: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900",
  Low:    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
};
const STATUS_STYLE = {
  "In progress": "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  "Completed":   "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  "On hold":     "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function Avatar({ name }) {
  const initials = (name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-600 bg-indigo-100 rounded-full w-7 h-7 dark:bg-indigo-950 dark:text-indigo-400">
      {initials}
    </div>
  );
}

// ── Task Modal ─────────────────────────────────────────────────
function TaskModal({ open, onClose, onSave, projects, users, initial }) {
  const empty = {
    title: "", description: "", projectId: "", assignedUserId: "",
    estimatedHours: "", startDate: "", dueDate: "",
    priority: "Medium", status: "In progress",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const formScrollRef = useRef(null);

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(initial
        ? { ...empty, ...initial, projectId: initial.projectId || initial.project?.id || "" }
        : empty
      );
      // ✅ Шинээр нээгдэх бүрт формыг эхнээс нь эхлүүлнэ (өмнөх scroll байрлал үлдэхээс сэргийлнэ)
      requestAnimationFrame(() => { if (formScrollRef.current) formScrollRef.current.scrollTop = 0; });
    }
  }, [open, initial]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Гарчиг бөглөнө үү";
    if (!form.projectId)    e.projectId = "Төсөл сонгоно уу";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 p-4 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center justify-center min-h-full">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl border border-gray-200 dark:border-gray-800 flex flex-col animate-slide-up overflow-hidden">

        {/* Гарчиг */}
        <div className="relative flex items-center justify-between flex-shrink-0 px-6 py-4 overflow-hidden border-b dark:border-gray-800">
          <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-10 -right-10 bg-gradient-to-br from-indigo-200/40 to-blue-200/20 dark:from-indigo-500/10 dark:to-blue-500/5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 shadow-md rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-indigo-600/25">
              <ClipboardList size={18} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {initial ? "Task засварлах" : "Шинэ task нэмэх"}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {initial ? `#${initial.id} · ${initial.title}` : "Шаардлагатай талбаруудыг бөглөнө үү"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="relative flex items-center justify-center flex-shrink-0 text-lg leading-none text-gray-400 transition rounded-full w-7 h-7 hover:bg-gray-100 dark:hover:bg-gray-800">
            ×
          </button>
        </div>

        {/* Форм */}
        <div ref={formScrollRef} className="px-6 py-4 space-y-3.5">

          {/* Task нэр */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <ClipboardList size={12} className="text-indigo-400" />
              Task нэр <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. CAD design review"
              className={`input w-full text-xs ${errors.title ? "border-red-400 focus:ring-red-400/20" : ""}`}
            />
            {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Тайлбар */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <FileText size={12} className="text-indigo-400" />
              Тайлбар
            </label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Task-ийн дэлгэрэнгүй тайлбар..."
              rows={3}
              className="w-full text-xs resize-none input"
            />
          </div>

          {/* Төсөл + Est цаг */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <FolderOpen size={12} className="text-indigo-400" />
                Төсөл <span className="text-red-500">*</span>
              </label>
              <select
                value={form.projectId}
                onChange={e => set("projectId", e.target.value)}
                className={`input w-full text-xs ${errors.projectId ? "border-red-400" : ""}`}
              >
                <option value="">— Сонгоно уу —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.projectId && <p className="text-[10px] text-red-500 mt-1">{errors.projectId}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <Clock size={12} className="text-indigo-400" />
                Est. цаг
              </label>
              <input
                type="number" min={0}
                value={form.estimatedHours}
                onChange={e => set("estimatedHours", e.target.value)}
                placeholder="40"
                className="w-full text-xs input"
              />
            </div>
          </div>

          {/* Start + Due */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <CalendarDays size={12} className="text-indigo-400" />
                Start date
              </label>
              <input
                type="date"
                value={form.startDate || ""}
                onChange={e => set("startDate", e.target.value)}
                className="w-full text-xs input"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <CalendarDays size={12} className="text-indigo-400" />
                Delivery date
              </label>
              <input
                type="date"
                value={form.dueDate || ""}
                onChange={e => set("dueDate", e.target.value)}
                className="w-full text-xs input"
              />
            </div>
          </div>

          {/* Priority + Status — нэг мөрөнд, зайг хэмнэнэ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <Flag size={12} className="text-indigo-400" />
                Priority
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("priority", p)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      form.priority === p
                        ? PRIORITY_STYLE[p] + " ring-2 ring-offset-1 ring-current dark:ring-offset-gray-900"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                <ListChecks size={12} className="text-indigo-400" />
                Status
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      form.status === s
                        ? STATUS_STYLE[s] + " ring-2 ring-offset-1 ring-current dark:ring-offset-gray-900"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Engineer сонгох */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <UsersIcon size={12} className="text-indigo-400" />
              Assign engineer
            </label>
            <div className="overflow-y-auto border divide-y rounded-xl dark:border-gray-700 dark:divide-gray-800 max-h-40">
              {/* Хоосон сонголт */}
              <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  !form.assignedUserId ? "border-indigo-500 bg-indigo-500" : "border-gray-300 dark:border-gray-600"
                }`}>
                  {!form.assignedUserId && <Check size={9} className="text-white" strokeWidth={3} />}
                </span>
                <input
                  type="radio"
                  name="engineer"
                  checked={!form.assignedUserId}
                  onChange={() => set("assignedUserId", "")}
                  className="sr-only"
                />
                <span className="text-xs italic text-gray-400">— Хуваарилахгүй —</span>
              </label>
              {users.map(u => {
                const name = u.firstName && u.lastName
                  ? `${u.firstName} ${u.lastName}`
                  : u.displayName || u.username;
                const isSelected = String(form.assignedUserId) === String(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {isSelected && <Check size={9} className="text-white" strokeWidth={3} />}
                    </span>
                    <input
                      type="radio"
                      name="engineer"
                      checked={isSelected}
                      onChange={() => set("assignedUserId", u.id)}
                      className="sr-only"
                    />
                    <Avatar name={name} />
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-medium text-gray-800 truncate dark:text-gray-200">
                        {name}
                      </span>
                      {u.jobTitle && (
                        <span className="text-[10px] text-gray-400 block">{u.jobTitle}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{u.username}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Товч */}
        <div className="flex flex-shrink-0 gap-3 px-6 py-4 border-t dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Хадгалж байна...
              </>
            ) : initial ? "Хадгалах" : "Task үүсгэх"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
          >
            Цуцлах
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Гол хуудас ────────────────────────────────────────────────
export default function TasksPage() {
  const { API_URL } = useAuth();
  const { users, projects, timeLogs, showNotify } = useAppContext();

  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [filterProj,   setFilterProj]   = useState("");
  const [filterUser,   setFilterUser]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const loggedMap = (() => {
    const m = {};
    tasks.forEach(t => {
      const hours = timeLogs
        .filter(l => l.projectId == t.projectId && l.userId == t.assignedUserId)
        .reduce((sum, l) => sum + Number(l.hours || l.hoursSpent || 0), 0);
      m[t.id] = hours;
    });
    return m;
  })();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks`);
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [API_URL]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (form) => {
    const method = editTask ? "PUT" : "POST";
    const url    = editTask ? `${API_URL}/tasks/${editTask.id}` : `${API_URL}/tasks`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      showNotify(editTask ? "Task шинэчлэгдлээ ✓" : "Task нэмэгдлээ ✓");
      fetchTasks();
    } else {
      showNotify("⚠️ Хадгалахад алдаа гарлаа");
    }
    setEditTask(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Энэ task-ийг устгах уу?")) return;
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
    if (res.ok) { showNotify("Task устгагдлаа"); fetchTasks(); }
  };

  const handleStatusChange = async (task, newStatus) => {
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchTasks();
  };

  const filtered = tasks.filter(t => {
    if (filterProj   && String(t.projectId) !== String(filterProj))     return false;
    if (filterUser   && String(t.assignedUserId) !== String(filterUser)) return false;
    if (filterStatus && t.status !== filterStatus)                        return false;
    return true;
  });

  const isOverdue = (d) => {
    if (!d) return false;
    const due = new Date(d); due.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    return due < today;
  };

  const engineerName = (t) => {
    if (!t.engineer) return null;
    const e = t.engineer;
    if (e.firstName && e.lastName) return `${e.firstName} ${e.lastName}`;
    return e.displayName || e.username;
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Гарчиг */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">All tasks</h1>
          <p className="text-xs text-gray-400 mt-0.5">Нийт {filtered.length} task</p>
        </div>
        <button
          onClick={() => { setEditTask(null); setModalOpen(true); }}
          className="px-4 py-2 text-xs font-semibold text-white transition bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:opacity-80"
        >
          + New task
        </button>
      </div>

      {/* Шүүлтүүр */}
      <div className="flex flex-wrap gap-2">
        <select value={filterProj} onChange={e => setFilterProj(e.target.value)}
          className="input text-xs py-1.5 px-2 h-auto">
          <option value="">Бүх төсөл</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
          className="input text-xs py-1.5 px-2 h-auto">
          <option value="">Бүх engineer</option>
          {users.map(u => {
            const n = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.displayName || u.username;
            return <option key={u.id} value={u.id}>{n}</option>;
          })}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input text-xs py-1.5 px-2 h-auto">
          <option value="">Бүх төлөв</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Хүснэгт */}
      <div className="p-0 overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 uppercase text-[10px] tracking-wider border-b dark:border-gray-800">
                <th className="p-4">Task</th>
                <th className="p-4">Project</th>
                <th className="p-4">Engineer</th>
                <th className="p-4 text-center">Est.</th>
                <th className="p-4 text-center">Logged</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Due</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-400">Ачааллаж байна...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-400">Task олдсонгүй</td></tr>
              ) : filtered.map(t => {
                const logged = loggedMap[t.id] || 0;
                const est    = Number(t.estimatedHours) || 0;
                const over   = isOverdue(t.dueDate) && t.status !== "Completed";
                const eName  = engineerName(t);

                return (
                  <tr key={t.id} className="transition border-b dark:border-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-800/20">
                    <td className="p-4 font-medium text-gray-900 dark:text-white max-w-[160px]">
                      <span className="block truncate" title={t.title}>{t.title}</span>
                      {t.description && (
                        <span className="text-[10px] text-gray-400 truncate block mt-0.5" title={t.description}>
                          {t.description}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 max-w-[160px]">
                      <span className="block truncate">{t.project?.name || "—"}</span>
                    </td>
                    <td className="p-4">
                      {eName ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={eName} />
                          <div>
                            <span className="block font-medium text-gray-700 dark:text-gray-300">{eName}</span>
                            {t.engineer?.jobTitle && (
                              <span className="text-[10px] text-gray-400">{t.engineer.jobTitle}</span>
                            )}
                          </div>
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-4 font-mono text-center text-gray-600 dark:text-gray-400">
                      {est > 0 ? `${est}h` : "—"}
                    </td>
                    <td className="p-4 font-mono text-center text-gray-600 dark:text-gray-400">
                      {logged > 0 ? `${logged}h` : "—"}
                    </td>
                    <td className="p-4">
                      <ProgressBar logged={logged} estimated={est} />
                    </td>
                    <td className={`p-4 font-mono whitespace-nowrap text-xs ${over ? "text-orange-500 font-semibold" : "text-gray-500"}`}>
                      {over && <span className="mr-1">⚠</span>}
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={t.status}
                        onChange={e => handleStatusChange(t, e.target.value)}
                        className={`text-[11px] px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${STATUS_STYLE[t.status] || STATUS_STYLE["In progress"]}`}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="relative p-4 text-right">
  <button
    onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
  >
    <MoreVertical size={18} />
  </button>

  {openMenu === t.id && (
    <div className="absolute z-50 overflow-hidden bg-white border border-gray-200 shadow-xl right-4 top-12 w-36 dark:bg-gray-900 dark:border-gray-700 rounded-xl">
      <button
        onClick={() => {
          setEditTask(t);
          setModalOpen(true);
          setOpenMenu(null);
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        ✏️ Засах
      </button>

      <button
        onClick={() => {
          handleDelete(t.id);
          setOpenMenu(null);
        }}
        className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        🗑️ Устгах
      </button>
    </div>
  )}
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSave={handleSave}
        projects={projects}
        users={users}
        initial={editTask}
      />
    </div>
  );
}