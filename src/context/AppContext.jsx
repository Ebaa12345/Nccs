import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user, API_URL } = useAuth();
  const [users,      setUsersState]    = useState([]);
  const [timeLogs,   setTimeLogsState] = useState([]);
  const [projects,   setProjectsState] = useState([]);
  const [tasks,      setTasksState]    = useState([]);
  const [jobTitles,  setJobTitles]     = useState([]);
  const [toast,      setToast]         = useState(null);
  const [loading,    setLoading]       = useState(false);

  const showNotify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Баазаас бүх өгөгдөл ачаалах ────────────────────────
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [initRes, tasksRes] = await Promise.all([
          fetch(`${API_URL}/appdata/init?userId=${user.id}&role=${user.role}`),
          fetch(`${API_URL}/tasks`),
        ]);
        if (initRes.ok) {
          const data = await initRes.json();
          setUsersState(data.users    || []);
          setProjectsState(data.projects || []);
          setTimeLogsState(data.timeLogs || []);
        }
        if (tasksRes.ok) {
          setTasksState(await tasksRes.json());
        }
      } catch (err) {
        console.error("Баазаас дата уншихад алдаа:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    fetch(`${API_URL}/appdata/job-titles`)
      .then(res => res.ok ? res.json() : [])
      .then(titles => setJobTitles(titles))
      .catch(err => console.error("Ажлын төрлүүд татахад алдаа:", err));
  }, [user, API_URL]);

  // ─── PROJECTS ────────────────────────────────────────────
  const addProject = async (projData) => {
    try {
      const res = await fetch(`${API_URL}/appdata/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projData),
      });
      if (res.ok) {
        const saved = await res.json();
        setProjectsState(prev => [...prev, saved]);
        showNotify("Төсөл амжилттай нэмэгдлээ ✓");
        return saved;
      }
    } catch (e) {
      console.error("Төсөл нэмэхэд алдаа:", e);
      showNotify("⚠️ Төсөл хадгалахад алдаа гарлаа");
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/appdata/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjectsState(prev => prev.filter(p => p.id !== id));
        setUsersState(prev => prev.map(u => ({
          ...u,
          assignedProjects: (u.assignedProjects || []).filter(pid => pid !== id),
        })));
        showNotify("Төсөл устгагдлаа");
      }
    } catch (e) {
      console.error("Төсөл устгахад алдаа:", e);
    }
  };

  // ─── USERS ───────────────────────────────────────────────
  const toggleProjectUser = async (userId, projectId) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const current = Array.isArray(targetUser.assignedProjects)
      ? targetUser.assignedProjects
      : JSON.parse(targetUser.assignedProjects || "[]");
    const updated = current.includes(projectId)
      ? current.filter(id => id !== projectId)
      : [...current, projectId];
    try {
      const res = await fetch(`${API_URL}/appdata/users/${userId}/projects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedProjects: updated }),
      });
      if (res.ok) {
        setUsersState(prev => prev.map(u =>
          u.id === userId ? { ...u, assignedProjects: updated } : u
        ));
      }
    } catch (e) {
      console.error("Хуваарилахад алдаа:", e);
    }
  };

  const assignJobTitle = async (userId, jobTitle) => {
    try {
      const res = await fetch(`${API_URL}/appdata/users/${userId}/job-title`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle }),
      });
      if (res.ok) {
        setUsersState(prev => prev.map(u =>
          u.id === userId ? { ...u, jobTitle } : u
        ));
        showNotify("Ажлын төрөл хадгалагдлаа ✓");
      }
    } catch (e) {
      console.error("Ажлын төрөл оноохад алдаа:", e);
      showNotify("⚠️ Ажлын төрөл хадгалахад алдаа гарлаа");
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/appdata/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsersState(prev => prev.filter(u => u.id !== id));
        showNotify("Хэрэглэгч устлаа");
      }
    } catch (e) {
      console.error("Хэрэглэгч устгахад алдаа:", e);
    }
  };

  // ─── TIME LOGS ────────────────────────────────────────────
  const setTimeLogs = async (newLogsOrFn) => {
    const updatedLogs = typeof newLogsOrFn === "function"
      ? newLogsOrFn(timeLogs)
      : newLogsOrFn;
    const addedLog = updatedLogs.find(l => !timeLogs.some(old => old.id === l.id));
    if (addedLog) {
      try {
        const res = await fetch(`${API_URL}/appdata/timelogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId:          addedLog.userId || user.id,
            projectId:       addedLog.projectId || projects.find(p => p.name === addedLog.project)?.id,
            taskDescription: addedLog.desc,
            hoursSpent:      Number(addedLog.hours),
            logDate:         addedLog.date,
          }),
        });
        if (res.ok) {
          const saved = await res.json();
          setTimeLogsState(prev => [saved, ...prev.filter(l => l.id !== addedLog.id)]);
          showNotify("Цагийн бүртгэл амжилттай хадгалагдлаа.");
          return;
        }
      } catch (e) {
        console.error("Цаг хадгалахад алдаа:", e);
      }
    }
    setTimeLogsState(updatedLogs);
  };

  const deleteTimeLog = async (id) => {
    try {
      const res = await fetch(`${API_URL}/appdata/timelogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTimeLogsState(prev => prev.filter(l => l.id !== id));
        showNotify("Бүртгэл амжилттай устгагдлаа.");
      }
    } catch (err) {
      console.error("Устгахад алдаа:", err);
    }
  };

  return (
    <AppContext.Provider value={{
      users,    setUsers: setUsersState, deleteUser, toggleProjectUser, assignJobTitle,
      jobTitles,
      timeLogs, setTimeLogs, deleteTimeLog,
      projects, setProjects: setProjectsState, addProject, deleteProject,
      tasks,    setTasks: setTasksState,
      toast,    setToast,
      showNotify,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);