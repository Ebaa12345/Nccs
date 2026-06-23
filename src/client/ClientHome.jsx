// 📁 src/client/ClientHome.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

export default function ClientHome() {
  const { user, API_URL } = useAuth();
  const { timeLogs, setTimeLogs, showNotify } = useAppContext();

  const [myProjects, setMyProjects] = useState([]);
  const [project, setProject] = useState(""); 
  const [hours,   setHours]   = useState("8");
  const [desc,    setDesc]    = useState("");
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);

  useEffect(() => {
    if (!user || !API_URL) return;
    const fetchMyProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/appdata/users/${user.id}/projects`);
        if (res.ok) {
          const data = await res.json();
          setMyProjects(data);
          if (data.length > 0) {
            setProject(data[0].name);
          }
        }
      } catch (e) {
        console.error("Төслүүдийг авахад алдаа:", e);
      }
    };
    fetchMyProjects();
  }, [user, API_URL]);

  // 🗓️ 7 хоногийн календарийн өдрүүд
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
      monthName: monthNameEn
    };
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!project) return showNotify("⚠️ Төсөл сонгоно уу!");
    if (!desc.trim()) return showNotify("⚠️ Хийсэн ажлын тайлбар бичнэ үү!");

    try {
      const res = await fetch(`${API_URL}/appdata/timelogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          project,
          hours: Number(hours),
          desc: desc.trim(),
          date
        })
      });

      if (res.ok) {
        const newLog = await res.json();
        setTimeLogs([newLog, ...timeLogs]);
        setDesc("");
        showNotify("🎉 Цаг амжилттай бүртгэгдлээ.");
      } else {
        showNotify("❌ Бүртгэхэд алдаа гарлаа.");
      }
    } catch (err) {
      showNotify("❌ Сүлжээний алдаа.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800/80 overflow-hidden p-6 lg:p-8">
      
      {/* 🔝 Толгой текст */}
      <div className="mb-6 border-b border-gray-100 dark:border-slate-800/60 pb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Өдрийн цаг бүртгэл</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Гүйцэтгэсэн ажлын цагаа системдээ хялбараар бүртгүүлээрэй.</p>
      </div>

      {/* 💻 Дэлгэцийн зайг бүрэн ашиглах ХЭВТЭЭ / ЗЭРЭГЦЭЭ бүтэц */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 👈 ЗҮҮН ТАЛ (2 багана эзэлнэ): Календарь + Төсөл сонголт хэвтээ чиглэлд */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ── 🗓️ 1. ОГНОО СОНГОХ ХЭСЭГ (Өргөн хэвтээ цуваа) ── */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Огноо сонгох
              </label>
              <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl text-indigo-600 dark:text-indigo-400">
                {date}
              </span>
            </div>
            
            {/* Картууд дэлгэц дагуу чөлөөтэй хэвтээгээр цуврах хэсэг */}
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
                        : "bg-[#f4f6f9] border-[#f4f6f9] text-slate-700 dark:bg-slate-800/60 dark:border-slate-800/40 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`text-[9px] font-bold tracking-wider ${
                      isSelected ? "text-indigo-100/90" : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {item.dayName}
                    </span>
                    <span className="text-2xl font-extrabold mt-1 tracking-tight leading-none">
                      {item.dayNum}
                    </span>
                    <span className={`text-[10px] font-medium mt-1.5 ${
                      isSelected ? "text-indigo-200/80" : "text-slate-400/60"
                    }`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 📁 2. ТӨСӨЛ СОНГОХ ХЭСЭГ (Өргөн хэвтээ цуваа) ── */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-0.5">
              Төсөл сонгох
            </label>
            
            {myProjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl text-center border border-dashed dark:border-slate-800">
                — Төсөл хуваарилагдаагүй байна —
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
                {myProjects.map((p) => {
                  const isSelected = project === p.name;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProject(p.name)}
                      className={`p-4 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between min-w-[190px] max-w-[22px] snap-start relative overflow-hidden ${
                        isSelected
                          ? "bg-white border-indigo-600 ring-2 ring-indigo-600/10 dark:bg-slate-900 dark:border-indigo-500"
                          : "bg-slate-50/50 border-slate-100/80 dark:bg-slate-800/30 dark:border-slate-800/60 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] px-2.5 py-0.5 rounded-bl-xl font-bold">
                          ✓ Сонгосон
                        </span>
                      )}
                      <div className="mt-2">
                        <span className={`block text-[10px] font-bold uppercase tracking-wider truncate mb-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                          {p.client || "Захиалагч"}
                        </span>
                        <span className={`block text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {p.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* 👉 БАРУУН ТАЛ (1 багана эзэлнэ): Цаг болон ажлын тайлбар оруулах Форм */}
        <div className="lg:col-span-1 bg-slate-50/60 dark:bg-slate-800/20 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Ажилласан цаг */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
                Ажилласан цаг
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">цаг</span>
              </div>
            </div>

            {/* Хийсэн ажлын тайлбар */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
                Хийсэн ажлын тайлбар
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Өнөөдөр ямар ажил гүйцэтгэснээ энд бичнэ үү..."
                rows={5}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder-slate-400/80"
              />
            </div>

            {/* Илгээх товч */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all tracking-wide uppercase mt-2"
            >
              🕒 Ажлын цаг бүртгүүлэх
            </button>
            
          </form>
        </div>

      </div>

    </div>
  );
}