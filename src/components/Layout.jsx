import { useState } from "react";
// 🌟 1. БҮРЭЛДЭХҮҮН ХЭСЭГТ Outlet НЭМЖ ИМПОРТЛОХ
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Calendar } from "lucide-react";

const NAV = [
  
  { path: "/dashboard",          icon: "⊞", label: "Хянах самбар" },
  { path: "/dashboard/users",    icon: "👥", label: "Хэрэглэгч & Проект" },
  { path: "/dashboard/timelogs", icon: "⏱", label: "Цагийн бүртгэл" },
  { path: "/dashboard/reports",  icon: "📊", label: "Тайлан & Export" },
  { path: "/dashboard/profile",  icon: "👤", label: "Профайл" },
  { path: "/dashboard/tasks",    icon: "✅", label: "Task" }
];

export default function Layout() { // <-- children хэрэгцээгүй тул авлаа
  const { user, logout, dark, setDark } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mini, setMini] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const currentTitle  = NAV.find((n) => n.path === location.pathname)?.label || "Хянах самбар";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">

      {/* ── Sidebar ── */}
      <aside className={`${mini ? "w-16" : "w-56"} flex flex-col bg-white dark:bg-gray-900
                         border-r border-gray-100 dark:border-gray-800
                         transition-all duration-200 flex-shrink-0`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${mini ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white dark:text-gray-900 text-sm font-bold">A</span>
          </div>
          {!mini && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">Admin панел</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-600 truncate">E-Commerce систем</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={mini ? item.label : undefined}
                className={`nav-link w-full ${active ? "nav-link-active" : ""} ${mini ? "justify-center px-2" : ""}`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!mini && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-2 space-y-1">
          {/* Dark mode */}
          <button
            onClick={() => setDark(!dark)}
            className={`nav-link w-full ${mini ? "justify-center px-2" : ""}`}
            title={mini ? (dark ? "Цайруулах" : "Харлуулах") : undefined}
          >
            <span className="text-base">{dark ? "☀" : "☾"}</span>
            {!mini && <span className="text-sm">{dark ? "Цайлуулах" : "Харлуулах"}</span>}
          </button>

          {/* Collapse */}
          <button
            onClick={() => setMini(!mini)}
            className={`nav-link w-full ${mini ? "justify-center px-2" : ""}`}
          >
            <span className="text-base">{mini ? "▶" : "◀"}</span>
            {!mini && <span className="text-sm">Хураах</span>}
          </button>
        </div>

        {/* User */}
        <div className={`border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2.5 ${mini ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold flex-shrink-0">
            {user?.name?.[0] || "А"}
          </div>
          {!mini && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-gray-400 dark:text-gray-600 truncate">{user?.role}</div>
              </div>
              <button onClick={handleLogout} className="btn-icon text-sm" title="Гарах">⏻</button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-white dark:bg-gray-900
                           border-b border-gray-100 dark:border-gray-800 flex-shrink-0 transition-colors duration-300">
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{currentTitle}</h1>
            <div className="inline-flex items-center gap-1.5 mt-1 pl-1 pr-2.5 py-0.5 rounded-full
                            bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <span className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Calendar size={10} className="text-white" strokeWidth={2.5} />
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                {new Date().toLocaleDateString("mn-MN", { weekday: "long" })}
              </span>
              <span className="text-[11px] text-indigo-400 dark:text-indigo-500">·</span>
              <span className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 font-mono">
                {new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950
                               text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
              {user?.role === "admin" ? "● Admin" : "● Менежер"}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              ⏻ Гарах
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {/* ✅ animate-fade-in ашиглана: animate-slide-up нь transform ашигладаг тул
              animation дуусаад ч transform:translateY(0) хэвээр үлдэж, дотор нь байгаа
              "position: fixed" модалуудын containing block-г viewport-ээс энэ div рүү
              өөрчилдөг байсан (модал бүтэн харагдахгүй, буруу scroll хийдэг байсан шалтгаан) */}
          <div className="animate-fade-in">
            {/* 🌟 2. ЭНД Outlet-ИЙГ БАЙРЛУУЛЖ ӨГСӨНӨӨР ҮНДСЭН ЦОНХНУУД БУЦАЖ ГАРНА */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}