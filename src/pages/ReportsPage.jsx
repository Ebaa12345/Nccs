// 📁 src/pages/ReportsPage.jsx
import { useMemo, useState } from "react";
import { Avatar } from "../components/UI";
import { useAppContext } from "../context/AppContext";

export default function ReportsPage() {
  const { users, timeLogs, showNotify } = useAppContext();

  const getHours    = (l) => Number(l.hours ?? l.hoursSpent ?? 0);
  const getDate     = (l) => l.date ?? l.logDate ?? "";
  const getProjName = (l) => l.project ?? l.Project?.name ?? "—";
  const getDesc     = (l) => l.desc ?? l.taskDescription ?? "—";
  const getUserName = (l) => {
    const name = l.user ?? l.User?.username ?? "—";
    return typeof name === "object" ? name?.username : name;
  };

  const userHours = useMemo(() => {
    const m = {};
    timeLogs.forEach((l) => {
      const key = getUserName(l);
      if (key && key !== "—") m[key] = (m[key] || 0) + getHours(l);
    });
    return m;
  }, [timeLogs]);

  const projHours = useMemo(() => {
    const m = {};
    timeLogs.forEach((l) => {
      const name = getProjName(l);
      m[name] = (m[name] || 0) + getHours(l);
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [timeLogs]);

  const total = timeLogs.reduce((a, l) => a + getHours(l), 0);
  const maxP  = Math.max(...projHours.map(([, h]) => h), 1);

  const detailRows = useMemo(() => {
    return timeLogs.map((l) => {
      const uname = getUserName(l);
      const uObj  = users.find((u) => u.id === l.userId)
                 || users.find((u) => (u.username || u.user) === uname);

      const lastName  = uObj?.lastName  || "";
      const firstName = uObj?.firstName || "";
      const displayName = uObj?.displayName
        || (firstName || lastName ? `${lastName} ${firstName}`.trim() : uname);

      return {
        id:          l.id,
        date:        getDate(l),
        lastName,
        firstName,
        displayName,
        jobTitle:    uObj?.jobTitle || uObj?.title || uObj?.profession || "—",
        project:     getProjName(l),
        desc:        getDesc(l),
        hours:       getHours(l),
        role:        uObj?.role || "user",
        uname,
      };
    }).sort((a, b) => a.date.localeCompare(b.date) || a.lastName.localeCompare(b.lastName));
  }, [timeLogs, users]);

  const [filterUser,    setFilterUser]    = useState("");
  const [filterProject, setFilterProject] = useState("");

  const uniqueUsers    = useMemo(() => [...new Set(timeLogs.map(getUserName))].filter(n => n !== "—").sort(), [timeLogs]);
  const uniqueProjects = useMemo(() => [...new Set(timeLogs.map(getProjName))].filter(n => n !== "—").sort(), [timeLogs]);

  const filteredRows = useMemo(() => detailRows.filter((r) => {
    if (filterUser    && r.uname   !== filterUser)    return false;
    if (filterProject && r.project !== filterProject) return false;
    return true;
  }), [detailRows, filterUser, filterProject]);

  const filteredTotal = filteredRows.reduce((a, r) => a + r.hours, 0);

  const exportCSV = () => {
    const rows = [
      ["№", "Огноо", "Нэр", "Албан тушаал", "Төсөл", "Хийсэн ажил", "Зарцуулсан цаг"],
      ...filteredRows.map((r, i) => [
        i + 1,
        r.date,
        r.firstName || r.displayName || r.uname || "—",
        r.jobTitle,
        r.project,
        r.desc,
        r.hours + "ц",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (showNotify) showNotify("CSV амжилттай татагдлаа ✓");
  };

  return (
    <div className="space-y-6">
      {/* Гарчиг + Экспорт */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Хяналтын тайлан</h1>
          <p className="text-xs text-gray-500">Системийн нийт цагийн зарцуулалт</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 transition-colors"
        >
          📊 Экспорт (CSV)
        </button>
      </div>

      {/* Статистик картууд */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-gray-400 font-medium">Нийт бүртгэгдсэн цаг</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}ц</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400 font-medium">Нийт бүртгэл</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{timeLogs.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400 font-medium">Дундаж цаг / ажилтан</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {users.length ? Math.round(total / users.length) : 0}ц
          </div>
        </div>
      </div>

      {/* Төслийн харьцаа */}
      {projHours.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Төслүүдийн цагийн харьцаа</h3>
          <div className="space-y-3">
            {projHours.map(([proj, hrs]) => (
              <div key={proj}>
                <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span className="truncate pr-4">{proj}</span>
                  <span className="flex-shrink-0">{hrs}ц</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(hrs / maxP) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Дэлгэрэнгүй жагсаалт */}
      <div className="card overflow-hidden p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Дэлгэрэнгүй бүртгэлийн жагсаалт</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Нийт {filteredRows.length} бичлэг · {filteredTotal}ц</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="input text-xs py-1.5 px-2 h-auto"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">Бүх ажилтан</option>
              {uniqueUsers.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select
              className="input text-xs py-1.5 px-2 h-auto"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">Бүх төсөл</option>
              {uniqueProjects.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b dark:border-gray-800 uppercase text-[10px] tracking-wider">
                <th className="p-3 text-center w-8">№</th>
                <th className="p-3 whitespace-nowrap">Огноо</th>
                <th className="p-3 whitespace-nowrap">Нэр</th>
                <th className="p-3 whitespace-nowrap">Албан тушаал</th>
                <th className="p-3 whitespace-nowrap">Төсөл</th>
                <th className="p-3">Хийсэн ажил</th>
                <th className="p-3 text-right whitespace-nowrap">Зарцуулсан цаг</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    Бүртгэл олдсонгүй
                  </td>
                </tr>
              ) : filteredRows.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b dark:border-gray-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-colors ${
                    i % 2 === 0 ? "" : "bg-gray-50/40 dark:bg-gray-800/10"
                  }`}
                >
                  <td className="p-3 text-center text-gray-400 font-mono">{i + 1}</td>
                  <td className="p-3 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.date}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                      <Avatar name={r.displayName || r.uname} size="sm" />
                      <span className="font-medium">{r.firstName || r.displayName || r.uname}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{r.jobTitle}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded-md">
                      {r.project}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 max-w-[240px] truncate">{r.desc}</td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {r.hours}ц
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <td colSpan={6} className="p-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Нийт ({filteredRows.length} бичлэг)
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {filteredTotal}ц
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Ажилчдын нэгтгэл */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ажилчдын нийт цагийн нэгтгэл</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b dark:border-gray-800 uppercase text-[10px] tracking-wider">
                <th className="p-3">Ажилтан</th>
                <th className="p-3">Эрх</th>
                <th className="p-3">Албан тушаал</th>
                <th className="p-3">Оролцсон төслүүд</th>
                <th className="p-3 text-right">Нийт цаг</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">Хэрэглэгч байхгүй</td>
                </tr>
              ) : users.map((u) => {
                const uKey = u.username || u.user || "";
                const uLogs = timeLogs.filter((l) => getUserName(l) === uKey);
                const uProjects = [...new Set(uLogs.map(getProjName))];
                return (
                  <tr key={u.id} className="border-b dark:border-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.displayName || uKey} size="sm" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                            {u.displayName || uKey}
                          </div>
                          {(u.lastName || u.firstName) && (
                            <div className="text-[10px] text-gray-400 font-mono">
                              {u.lastName} {u.firstName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        u.role === "admin"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                      }`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {u.jobTitle || u.title || u.profession || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {uProjects.length > 0
                          ? uProjects.map((p, idx) => (
                              <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded-md">
                                {p}
                              </span>
                            ))
                          : <span className="text-gray-400 italic">Байхгүй</span>
                        }
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {userHours[uKey] || 0}ц
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}