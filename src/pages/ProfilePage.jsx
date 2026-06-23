// 📁 src/pages/ProfilePage.jsx (admin/manager) эсвэл src/client/ClientProfile.jsx (хэрэглэгч)
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { users, timeLogs, projects } = useAppContext();

  // ✅ ЗАСВАР: AppContext-ийн users жагсаалтаас өөрийн бичлэгийг олно —
  // энэ нь jobTitle, assignedProjects зэрэг admin-аас шинэчилсэн
  // хамгийн сүүлийн мэдээллийг агуулдаг (auth дахь хуучирсан утга биш)
  const user = useMemo(
    () => users.find((u) => u.id === authUser?.id) || authUser,
    [users, authUser]
  );

  // assignedProjects нь баазаас JSON string болж ирж болно — аюулгүй parse
  const myAssignedIds = useMemo(() => {
    if (Array.isArray(user?.assignedProjects)) return user.assignedProjects;
    try { return JSON.parse(user?.assignedProjects || "[]"); } catch { return []; }
  }, [user]);

  // ✅ Зөвхөн энэ хэрэглэгчийн бичлэгүүд
  const myLogs = useMemo(
    () => timeLogs.filter((l) => l.userId === user?.id),
    [timeLogs, user]
  );

  const totalHours = myLogs.reduce((sum, l) => sum + Number(l.hours || 0), 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyHours = myLogs
    .filter((l) => new Date(l.date) >= oneWeekAgo)
    .reduce((sum, l) => sum + Number(l.hours || 0), 0);

  // Хамгийн их цаг зарцуулсан төсөл
  const projectHours = useMemo(() => {
    const m = {};
    myLogs.forEach((l) => {
      m[l.project] = (m[l.project] || 0) + Number(l.hours || 0);
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [myLogs]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Хувийн мэдээлэл */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl uppercase flex-shrink-0">
          {user?.name?.slice(0, 2) || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name}</h2>
          <p className="text-xs text-gray-500 truncate">{user?.email || user?.username}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase">
              {user?.role}
            </span>
            {/* ✅ ШИНЭ: Admin-аас оноосон ажлын төрөл — зөвхөн ХАРАХ, засварлах боломжгүй */}
            {user?.jobTitle ? (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {user.jobTitle}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Ажлын төрөл оноогоогүй
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Статистик */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-xs text-gray-400">Нийт бүртгэсэн цаг</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalHours}ц</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Энэ долоо хоног</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{weeklyHours}ц</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Хуваарилагдсан төсөл</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {projects.filter(p => myAssignedIds.includes(p.id)).length}
          </div>
        </div>
      </div>

      {/* Төслүүдийн харьцаа */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Төслүүд дэх зарцуулсан цаг</h3>
        {projectHours.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Одоогоор бүртгэгдсэн цаг алга байна.</p>
        ) : (
          <div className="space-y-3">
            {projectHours.map(([proj, hrs]) => (
              <div key={proj}>
                <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span className="truncate pr-4">{proj}</span>
                  <span className="flex-shrink-0">{hrs}ц</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(hrs / (totalHours || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 📁 БАРУУН ТАЛ: ЦАГИЙН БҮРТГЭЛИЙН ЖАГСААЛТ */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800/60 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              📂 Миний сүүлийн бүртгэлүүд
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Таны системд бүртгүүлсэн ажлын түүх</p>
          </div>
          <span className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-xl font-bold font-mono border border-gray-100 dark:border-gray-800">
            Нийт: {myLogs.length}
          </span>
        </div>

        <div className="space-y-3">
          {myLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-2xl mb-2">☕</span>
              <p className="text-xs text-gray-400">Бүртгэл одоогоор байхгүй байна.</p>
            </div>
          ) : (
            myLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="p-4 bg-gray-50/40 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800/60 hover:border-indigo-500/20 rounded-xl transition-all flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block font-bold text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-indigo-100/30">
                      {log.Project?.name || log.project}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      • {log.logDate || log.date}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                    {log.taskDescription || log.desc}
                  </div>
                </div>

                {/* Баруун талын цагийн тэмдэглэгээ */}
                <div className="text-right whitespace-nowrap bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 px-3 py-1 rounded-xl text-xs font-bold">
                  {log.hoursSpent || log.hours} цаг
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
