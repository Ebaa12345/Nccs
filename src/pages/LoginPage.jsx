// 📁 src/pages/LoginPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ Нэвтэрсэн хэрэглэгчийг role-оор зөв хуудас руу илгээнэ
  useEffect(() => {
    if (!user) return;
    if (user.role === "user") {
      navigate("/home", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Цаг Бүртгэлийн Систем</h2>
          <p className="text-xs text-gray-400 mt-1">NCCS — Аюулгүй нэвтрэх хэсэг</p>
        </div>

        {/* ✅ ЗАСВАР: Clerk SignIn/SignUp-ийн оронд Microsoft нэвтрэх товч */}
        <button
          onClick={login}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4
                     bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                     rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          {isLoading ? "Нэвтэрч байна..." : "Microsoft-оор нэвтрэх"}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Зөвхөн байгууллагын Microsoft 365 бүртгэлээр нэвтрэх боломжтой.
        </p>
      </div>
    </div>
  );
}
