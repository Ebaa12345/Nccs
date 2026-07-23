
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import Footer from "./Footer";
import { Clock, CalendarDays, FolderOpen, ListChecks, FileText, Send } from "lucide-react";

export default function ClientHome() {
  const { user, API_URL } = useAuth();
  const { timeLogs, tasks, showNotify, addTimeLog } = useAppContext();

  const [myProjects,         setMyProjects]         = useState([]);
  const [selectedProjectId,  setSelectedProjectId]  = useState("");
  const [selectedTaskId,     setSelectedTaskId]     = useState("");
  const [hours,  setHours]  = useState("8");
  const [desc,   setDesc]   = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);

  // Ажилтны төслүүдийг татах
  useEffect(() => {
    if (!user || !API_URL) return;
    const fetchMyProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/appdata/users/${user.id}/projects`);
        if (res.ok) {
          const data = await res.json();
          setMyProjects(data);
          if (data.length > 0) setSelectedProjectId(String(data[0].id));
        }
      } catch (e) {
        console.error("Төслүүдийг авахад алдаа:", e);
      }
    };
    fetchMyProjects();
  }, [user, API_URL]);

  // Сонгосон төслийн task-ууд (зөвхөн энэ ажилтанд хуваарилагдсан)
  const projectTasks = useMemo(() => {
    if (!selectedProjectId || !tasks) return [];
    return tasks.filter(
      (t) =>
        String(t.projectId) === String(selectedProjectId) &&
        (t.assignedUserId == null || String(t.assignedUserId) === String(user?.id))
    );
  }, [tasks, selectedProjectId, user]);

  // Төсөл солигдоход task сонголт цэвэрлэх
  useEffect(() => {
    setSelectedTaskId("");
    setDesc("");
  }, [selectedProjectId]);

  // Task сонгоход desc автоматаар бөглөх
  const handleTaskSelect = (task) => {
    if (selectedTaskId === String(task.id)) {
      // Дахин дарахад сонголт арилна
      setSelectedTaskId("");
      setDesc("");
    } else {
      setSelectedTaskId(String(task.id));
      setDesc(task.title);
    }
  };

  // 7 хоногийн календарь
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    const formatted = d.toISOString().slice(0, 10);
    const dayNameEn = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const monthNameEn = d.toLocaleDateString("en-US", { month: "short" });
    return {
      formatted,
      dayName: formatted === todayStr ? "ӨНӨӨДӨР" : dayNameEn,
      dayNum: d.getDate(),
      monthName: monthNameEn,
    };
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedProjectId) return showNotify("⚠️ Төсөл сонгоно уу!");
    if (!desc.trim())        return showNotify("⚠️ Хийсэн ажлын тайлбар бичнэ үү!");

    await addTimeLog({
      userId:    user.id,
      projectId: Number(selectedProjectId),
      desc:      desc.trim(),
      hours:     Number(hours),
      date,
    });

    setDesc("");
    setSelectedTaskId("");
  };

  const PRIORITY_COLOR = {
    High:   "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    Medium: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    Low:    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  const STATUS_COLOR = {
    "In progress": "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    "Completed":   "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    "On hold":     "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="relative max-w-6xl p-6 mx-auto overflow-hidden bg-white border border-gray-100 shadow-xl dark:bg-slate-900 rounded-3xl dark:border-slate-800/80 lg:p-8 animate-fade-in">

      {/* Дэвсгэр гэрэлтэлт */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/20 dark:from-indigo-500/10 dark:to-blue-500/5 blur-3xl" />

      {/* Толгой */}
      <div className="relative flex items-center gap-3.5 pb-4 mb-6 border-b border-gray-100 dark:border-slate-800/60">
        <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-indigo-600/25">
          <Clock size={20} className="text-white" strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Өдрийн цаг бүртгэл</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Гүйцэтгэсэн ажлын цагаа системдээ хялбараар бүртгүүлээрэй.</p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* ЗҮҮН ТАЛ */}
        <div className="lg:col-span-2 space-y-7">

          {/* 1. Огноо сонгох */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "40ms" }}>
            <div className="flex justify-between items-center px-0.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <CalendarDays size={13} className="text-indigo-400" />
                Огноо сонгох
              </label>
              <span className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl dark:text-indigo-400">
                {date}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
              {calendarDays.map((item) => {
                const isSelected = date === item.formatted;
                return (
                  <button
                    key={item.formatted}
                    type="button"
                    onClick={() => setDate(item.formatted)}
                    className={`flex flex-col items-center justify-center flex-1 min-w-[76px] h-[100px] rounded-[24px] transition-all duration-200 snap-start border ${
                      isSelected
                        ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg shadow-indigo-600/25 font-bold scale-[1.02]"
                        : "bg-[#f4f6f9] border-[#f4f6f9] text-slate-700 dark:bg-slate-800/60 dark:border-slate-800/40 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    <span className={`text-[9px] font-bold tracking-wider ${isSelected ? "text-indigo-100/90" : "text-slate-400 dark:text-slate-500"}`}>
                      {item.dayName}
                    </span>
                    <span className="mt-1 text-2xl font-extrabold leading-none tracking-tight">{item.dayNum}</span>
                    <span className={`text-[10px] font-medium mt-1.5 ${isSelected ? "text-indigo-200/80" : "text-slate-400/60"}`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Төсөл сонгох */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-0.5">
              <FolderOpen size={13} className="text-indigo-400" />
              Төсөл сонгох
            </label>
            {myProjects.length === 0 ? (
              <p className="p-5 text-xs italic text-center border border-dashed text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl dark:border-slate-800">
                — Төсөл хуваарилагдаагүй байна —
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
                {myProjects.map((p) => {
                  const isSelected = String(selectedProjectId) === String(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectId(String(p.id))}
                      className={`p-4 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between min-w-[190px] snap-start relative overflow-hidden ${
                        isSelected
                          ? "bg-white border-indigo-600 ring-2 ring-indigo-600/10 dark:bg-slate-900 dark:border-indigo-500 shadow-md"
                          : "bg-slate-50/50 border-slate-100/80 dark:bg-slate-800/30 dark:border-slate-800/60 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] px-2.5 py-0.5 rounded-bl-xl font-bold">
                          ✓ Сонгосон
                        </span>
                      )}
                      <div className="mt-2">
                        <span className={`block text-[10px] font-bold uppercase tracking-wider truncate mb-1 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                          {p.client || "Захиалагч"}
                        </span>
                        <span className={`block text-xs font-bold leading-tight line-clamp-2 ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                          {p.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Task сонгох — төсөл сонгосон үед гарна */}
          {selectedProjectId && (
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: "140ms" }}>
              <div className="flex items-center justify-between px-0.5">
                <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  <ListChecks size={13} className="text-indigo-400" />
                  Task сонгох
                </label>
                {selectedTaskId && (
                  <button
                    type="button"
                    onClick={() => { setSelectedTaskId(""); setDesc(""); }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                  >
                    Цуцлах
                  </button>
                )}
              </div>

              {projectTasks.length === 0 ? (
                <p className="p-4 text-xs italic text-center border border-dashed text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl dark:border-slate-800">
                  — Энэ төсөлд task байхгүй байна —
                </p>
              ) : (
                <div className="pr-1 space-y-2 overflow-y-auto max-h-52">
                  {projectTasks.map((task) => {
                    const isSelected = selectedTaskId === String(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => handleTaskSelect(task)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-500 ring-1 ring-indigo-400/30"
                            : "bg-slate-50/60 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start flex-1 min-w-0 gap-2">
                            {/* Checkbox харагдах */}
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-slate-300 dark:border-slate-600"
                            }`}>
                              {isSelected && (
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                                  <polyline points="1,4 3,6 7,2" strokeWidth="1.5" stroke="white" fill="none"/>
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200"}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.Medium}`}>
                              {task.priority}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${STATUS_COLOR[task.status] || STATUS_COLOR["In progress"]}`}>
                              {task.status}
                            </span>
                            {task.dueDate && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* БАРУУН ТАЛ */}
        <div className="p-5 border lg:col-span-1 bg-slate-50/60 dark:bg-slate-800/20 rounded-2xl border-slate-100 dark:border-slate-800/60 animate-slide-up" style={{ animationDelay: "180ms" }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Сонгосон task-ийн мэдээлэл */}
            {selectedTaskId && (() => {
              const task = projectTasks.find(t => String(t.id) === selectedTaskId);
              return task ? (
                <div className="p-3 border border-indigo-100 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl dark:border-indigo-900/50">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Сонгосон task</p>
                  <p className="text-xs font-bold text-indigo-700 truncate dark:text-indigo-300">{task.title}</p>
                  {task.estimatedHours > 0 && (
                    <p className="text-[10px] text-indigo-400 mt-0.5">Est: {task.estimatedHours}ц</p>
                  )}
                </div>
              ) : null;
            })()}

            {/* Ажилласан цаг */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
                <Clock size={12} className="text-indigo-400" />
                Ажилласан цаг
              </label>
              <div className="relative">
                <input
                  type="number" min="1" max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-3 text-xs font-bold transition-all bg-white border dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="absolute text-xs font-bold -translate-y-1/2 right-4 top-1/2 text-slate-400">цаг</span>
              </div>
            </div>

            {/* Хийсэн ажлын тайлбар */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
                <FileText size={12} className="text-indigo-400" />
                Хийсэн ажлын тайлбар
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Өнөөдөр ямар ажил гүйцэтгэснээ энд бичнэ үү..."
                rows={5}
                className="w-full px-4 py-3 text-xs font-medium transition-all bg-white border resize-none dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400/80"
              />
            </div>

            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/25 hover:-translate-y-0.5 active:scale-[0.99] transition-all tracking-wide uppercase mt-2"
            >
              <Send size={13} className="transition-transform group-hover:translate-x-0.5" />
              Ажлын цаг бүртгүүлэх
            </button>
          </form>
        </div>
      </div>
      
    </div>
   
  );
}