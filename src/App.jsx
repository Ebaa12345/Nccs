// 📁 src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Toast, Spinner } from "./components/UI";

import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import ClientLayout from "./client/ClientLayout";

import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import TimeLogsPage from "./pages/TimeLogsPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import ClientHome from "./client/ClientHome";
import TasksPage from "./pages/TasksPage";

// 🛡️ Зам хамгаалагч
function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "user" ? "/home" : "/dashboard"} replace />;
  }

  return <Outlet />;
}

// ✅ ЗАСВАР: Toast-ийг AppContext-оос авна, prop drilling байхгүй
function ToastLayer() {
  const { toast, setToast } = useAppContext();
  return toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null;
}

function AppShell() {
  const { user } = useAuth();

  // ✅ ЗАСВАР: user?.role — null байхад crash болохгүй
  const fallbackPath = user
    ? user.role === "user" ? "/home" : "/dashboard"
    : "/login";

  return (
    <>
      <ToastLayer />
      <Routes>
        {/* Нэвтрэх */}
        <Route path="/login" element={<LoginPage />} />

        {/* 👤 Энгийн хэрэглэгч */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route element={<ClientLayout />}>
            <Route path="/home" element={<ClientHome />} />
            <Route path="/home/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 💼 Админ / Менежер */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
          <Route element={<Layout />}>
          <Route path="/home" element={<ClientHome />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/timelogs" element={<TimeLogsPage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/tasks" element={<TasksPage />} />
            // Admin/Manager route-ын дотор:
            

            {/* Зөвхөн Админ */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/dashboard/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Бусад бүх зам */}
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
