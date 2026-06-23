// 📁 src/pages/DashboardPage.jsx
import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const PRIORITY_STYLE = {
  High:   "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  Medium: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  Low:    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};
const STATUS_STYLE = {
  "In progress": "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  "Completed":   "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  "On hold":     "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function DashboardPage() {
  const { user, API_URL } = useAuth();
  const { users, timeLogs, projects } = useAppContext();
  const navigate = useNavigate();

  // ✅ Tasks-ийг DashboardPage дотроо fetch хийнэ — AppContext-д байгаа эсэхээс үл хамааран
  const [tasks, setTasks] = useState([]);
  const [activeTaskDropdown, setActiveTaskDropdown] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error("Tasks fetch алдаа:", e); }
  }, [API_URL]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const getHours    = (l) => Number(l.hoursSpent ?? l.hours ?? 0);
  const getDate     = (l) => l.logDate ?? l.date ?? "";
  const getUserName = (l) => l.User?.username ?? l.user ?? "—";
  const getProjName = (l) => l.Project?.name  ?? l.project ?? "—";

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    return d < today;
  };

  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === "Идэвхтэй").length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyHours = timeLogs
      .filter(l => new Date(getDate(l)) >= oneWeekAgo)
      .reduce((sum, l) => sum + getHours(l), 0);
    return { activeUsers: users.length, activeProjects, weeklyHours };
  }, [users, timeLogs, projects]);

  const recentLogs = useMemo(() => {
    return [...timeLogs]
      .sort((a, b) => new Date(getDate(b)) - new Date(getDate(a)))
      .slice(0, 3);
  }, [timeLogs]);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const engineerName = (t) => {
    if (!t.engineer) return "—";
    const e = t.engineer;
    if (e.firstName && e.lastName) return `${e.lastName[0]}. ${e.firstName}`;
    return e.displayName || e.username || "—";
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Мэндчилгээ */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-sm">
        <h2 className="text-base font-bold">Сайн байна уу, {user?.firstName || user?.displayName || "Хэрэглэгч"}! 👋</h2>
        <p className="text-xs text-indigo-100 mt-0.5">Өнөөдрийн системийн ерөнхий статистик болон ажлын явц.</p>
      </div>

      {/* Статистик */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Нийт хэрэглэгчид",      value: stats.activeUsers,    icon: "👥" },
          { label: "Идэвхтэй төслүүд",       value: stats.activeProjects, icon: "📁" },
          { label: "Сүүлийн 7 хоногийн цаг", value: `${stats.weeklyHours} ц`, icon: "⏱" },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</h3>
            </div>
            <span className="text-xl bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Tasks хүснэгт */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 flex items-center justify-between border-b dark:border-gray-800 bg-white dark:bg-gray-900">
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">📋 Системийн нийт ажлуудын явц</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Нийт {tasks.length} даалгавар бүртгэлтэй</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/tasks")}
            className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-semibold hover:opacity-80 transition-all"
          >
            Даалгавар удирдах хэсэг рүү очих →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 uppercase text-[10px] tracking-wider border-b dark:border-gray-800">
                <th className="p-4">Task</th>
                <th className="p-4">Project</th>
                <th className="p-4">Engineer</th>
                <th className="p-4 text-center">Est.</th>
                <th className="p-4">Due</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Одоогоор ямар нэгэн Task үүсээгүй байна.
                  </td>
                </tr>
              ) : tasks.map(t => {
                const est  = Number(t.estimatedHours) || 0;
                const over = isOverdue(t.dueDate) && t.status !== "Completed";
                return (
                  <tr key={t.id} className="border-b dark:border-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition">
                    <td className="p-4 font-medium text-gray-900 dark:text-white max-w-[180px]">
                      <span className="truncate block" title={t.title}>{t.title}</span>
                    </td>
                    <td className="p-4 text-gray-500 max-w-[160px]">
                      <span className="truncate block">{t.project?.name || "—"}</span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">
                      {engineerName(t)}
                    </td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400 font-mono">
                      {est > 0 ? `${est}h` : "—"}
                    </td>
                    <td className={`p-4 font-mono whitespace-nowrap text-xs ${over ? "text-orange-500 font-semibold" : "text-gray-500"}`}>
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium}`}>
                        {t.priority || "Medium"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${STATUS_STYLE[t.status] || STATUS_STYLE["In progress"]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right relative whitespace-nowrap">
                      <button
                        onClick={e => { e.stopPropagation(); setActiveTaskDropdown(activeTaskDropdown === t.id ? null : t.id); }}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 font-bold transition-all inline-flex items-center justify-center"
                      >
                        •••
                      </button>
                      {activeTaskDropdown === t.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveTaskDropdown(null)} />
                          <div className="absolute right-4 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-20 p-1 text-left">
                            <button
                              onClick={() => { navigate("/dashboard/tasks"); setActiveTaskDropdown(null); }}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium"
                            >
                              ⚙️ Засах / Устгах
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Сүүлийн цагийн бүртгэлүүд */}
      <div className="card p-4 space-y-3">
        <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">⏱ Сүүлийн цагийн бүртгэлүүд</h3>
          <button onClick={() => navigate("/dashboard/timelogs")}
            className="text-xs text-indigo-500 hover:underline font-medium">
            Бүх цаг харах →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2 col-span-3">Бүртгэл байхгүй</p>
          ) : recentLogs.map(l => (
            <div key={l.id} className="flex items-center justify-between p-2.5 border dark:border-gray-800/60 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                  {getUserName(l)?.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{getUserName(l)}</div>
                  <div className="text-[10px] text-gray-400 truncate">{getProjName(l)}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg">
                {getHours(l)}ц
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}