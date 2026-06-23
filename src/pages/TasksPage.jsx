// 📁 src/pages/TasksPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

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
    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
      {initials}
    </div>
  );
}

function ProgressBar({ logged, estimated }) {
  const pct = estimated > 0 ? Math.min(Math.round((logged / estimated) * 100), 100) : 0;
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 60 ? "bg-indigo-500" : pct > 0 ? "bg-amber-400" : "bg-gray-200 dark:bg-gray-700";
  return (
    <div className="flex items-center gap-2 min-w-[130px]">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-gray-500 w-9 text-right font-mono">{pct}%</span>
    </div>
  );
}

// ── Шинэ/Засах Task Modal ─────────────────────────────────────
function TaskModal({ open, onClose, onSave, projects, users, initial }) {
  const empty = {
    title: "", description: "", projectId: "", assignedUserId: "",
    estimatedHours: "", startDate: "", dueDate: "",
    priority: "Medium", status: "In progress",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial ? { ...empty, ...initial, projectId: initial.projectId || initial.project?.id || "" } : empty);
  }, [open, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Гарчиг бөглөнө үү");
    if (!form.projectId)    return alert("Төсөл сонгоно уу");
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
        {/* Гарчиг */}
        <div className="px-5 py-4 border-b dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            {initial ? "Task засварлах" : "New task"}
          </h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Task нэр */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Task нэр <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. CAD design review"
              className="input w-full text-xs mt-1" />
          </div>

          {/* Төсөл + Est цаг — нэг мөрт */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Төсөл <span className="text-red-500">*</span></label>
              <select value={form.projectId} onChange={e => set("projectId", e.target.value)}
                className="input w-full text-xs mt-1">
                <option value="">— Сонгоно уу —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. цаг</label>
              <input type="number" min={0} value={form.estimatedHours}
                onChange={e => set("estimatedHours", e.target.value)}
                placeholder="40" className="input w-full text-xs mt-1" />
            </div>
          </div>

          {/* Start date + Delivery date + Priority — нэг мөрт */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start date</label>
              <input type="date" value={form.startDate || ""} onChange={e => set("startDate", e.target.value)}
                className="input w-full text-xs mt-1" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery date</label>
              <input type="date" value={form.dueDate || ""} onChange={e => set("dueDate", e.target.value)}
                className="input w-full text-xs mt-1" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)}
                className="input w-full text-xs mt-1">
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="input w-full text-xs mt-1">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Assign engineers — жижигрүүлсэн жагсаалт */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign engineer</label>
            <div className="border rounded-xl dark:border-gray-700 divide-y dark:divide-gray-800 max-h-32 overflow-y-auto mt-1">
              {users.map(u => {
                const name = u.firstName && u.lastName
                  ? `${u.firstName} ${u.lastName}`
                  : u.displayName || u.username;
                return (
                  <label key={u.id} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="radio" name="engineer" checked={String(form.assignedUserId) === String(u.id)}
                      onChange={() => set("assignedUserId", u.id)} className="accent-indigo-600" />
                    <Avatar name={name} />
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 flex-1">{name}</span>
                    <span className="text-[10px] text-gray-400">{u.username}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Товч */}
        <div className="px-5 py-4 border-t dark:border-gray-800 flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2 rounded-xl text-xs hover:opacity-90 transition disabled:opacity-50">
            {saving ? "Хадгалж байна..." : initial ? "Хадгалах" : "Create task"}
          </button>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Cancel
          </button>
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

  // TimeLog-оос task бүрт logged цагийг projectId + assignedUserId-аар тооцох
  const loggedMap = (() => {
    const m = {};
    tasks.forEach(t => {
      const key = `${t.projectId}_${t.assignedUserId}`;
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
    if (filterProj   && String(t.projectId) !== String(filterProj))      return false;
    if (filterUser   && String(t.assignedUserId) !== String(filterUser))  return false;
    if (filterStatus && t.status !== filterStatus)                         return false;
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
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-xl hover:opacity-80 transition"
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
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
                  <tr key={t.id} className="border-b dark:border-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition">
                    {/* Task */}
                    <td className="p-4 font-medium text-gray-900 dark:text-white max-w-[160px]">
                      <span className="truncate block" title={t.title}>{t.title}</span>
                    </td>
                    {/* Project */}
                    <td className="p-4 text-gray-500 max-w-[160px]">
                      <span className="truncate block">{t.project?.name || "—"}</span>
                    </td>
                    {/* Engineer */}
                    <td className="p-4">
                      {eName ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={eName} />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{eName}</span>
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    {/* Est */}
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400 font-mono">
                      {est > 0 ? `${est}h` : "—"}
                    </td>
                    {/* Logged */}
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400 font-mono">
                      {logged > 0 ? `${logged}h` : "—"}
                    </td>
                    {/* Progress */}
                    <td className="p-4">
                      <ProgressBar logged={logged} estimated={est} />
                    </td>
                    {/* Due date */}
                    <td className={`p-4 font-mono whitespace-nowrap text-xs ${over ? "text-orange-500 font-semibold" : "text-gray-500"}`}>
                      {formatDate(t.dueDate)}
                    </td>
                    {/* Priority */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium}`}>
                        {t.priority}
                      </span>
                    </td>
                    {/* Status — dropdown */}
                    <td className="p-4">
                      <select
                        value={t.status}
                        onChange={e => handleStatusChange(t, e.target.value)}
                        className={`text-[11px] px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${STATUS_STYLE[t.status] || STATUS_STYLE["In progress"]}`}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    {/* Үйлдэл */}
                    <td className="p-4 text-right whitespace-nowrap space-x-2">
                      <button onClick={() => { setEditTask(t); setModalOpen(true); }}
                        className="text-indigo-500 hover:underline font-medium">Засах</button>
                      <button onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:underline font-medium">Устгах</button>
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