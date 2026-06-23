import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Home, Shield, User } from "lucide-react";


export default function ClientLayout() {
  const { user, logout } = useAuth();

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/20 dark:border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>

            <div>
              <h1 className="font-bold text-xl text-slate-800 dark:text-white">
                NCCS
              </h1>
              <p className="text-xs text-slate-500">
                 Цаг бүртгэлийн систем
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-3">

            <Link
              to="/home"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <Home size={18} />
              <span>Нүүр хуудас</span>
            </Link>

            {/* ✅ ШИНЭ: Профайл линк */}
            <Link
              to="/home/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <User size={18} />
              <span>Профайл</span>
            </Link>

            {/* User */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>

              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  System User
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-lg hover:scale-105 transition-all duration-300"
            >
              <LogOut size={18} />
              Гарах
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 dark:border-slate-800 p-6 min-h-[80vh]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}