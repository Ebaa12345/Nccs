// 📁 src/pages/TimeLogsPage.jsx
import { useState, useMemo } from "react";
import { Avatar, Modal, FormGroup, ConfirmModal, EmptyState } from "../components/UI";
import { useAppContext } from "../context/AppContext";

const WEEKDAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

// Долоо хоногийн Даваагийн огноог буцаана (ISO — Даваа = эхлэл)
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Ням, 1=Даваа, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatISO(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export default function TimeLogsPage() {
  const { users, timeLogs, setTimeLogs, deleteTimeLog, projects, showNotify } = useAppContext();

  const [modalOpen, setModal] = useState(false);
  const [confirmOpen, setConf] = useState(false);
  const [deleteId, setDelId] = useState(null);

  // ✅ ШИНЭ: Долоо хоног сонгох төлөв — өнөөдрийг агуулсан долоо хоногоос эхэлнэ
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const emptyForm = {
    userId:    users[0]?.id    || "",
    projectId: projects[0]?.id || "",
    desc:      "",
    hours:     "",
    date:      new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = useState(emptyForm);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // appDataRoutes.js нь .toJSON()-оор user/project нэрийг шууд талбар болгож хувиргадаг
  const getUserName    = (l) => l.user    ?? l.User?.username ?? "—";
  const getProjectName = (l) => l.project ?? l.Project?.name  ?? "—";
  const getHours        = (l) => Number(l.hours ?? l.hoursSpent ?? 0);
  const getDesc          = (l) => l.desc   ?? l.taskDescription ?? "";
  const getDate           = (l) => l.date   ?? l.logDate ?? "";

  // ── Долоо хоногийн 7 өдрийн огноо массив ──────────────────
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => formatISO(addDays(weekStart, i))),
    [weekStart]
  );

  const weekLabel = `${formatISO(weekStart)} — ${formatISO(addDays(weekStart, 6))}`;

  const goPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goThisWeek = () => setWeekStart(getMonday(new Date()));

  // ── Сонгосон долоо хоногт хамаарах бичлэгүүд ────────────────
  const weekLogs = useMemo(
    () => timeLogs.filter((l) => weekDates.includes(getDate(l))),
    [timeLogs, weekDates]
  );

  // ── Хэрэглэгч тус бүрийн өдөр бүрийн нийт цаг (matrix) ───────
  // { userId: { "2026-06-15": 8, "2026-06-16": 4, ... } }
  const matrix = useMemo(() => {
    const m = {};
    weekLogs.forEach((l) => {
      const uid = l.userId;
      if (!m[uid]) m[uid] = {};
      const d = getDate(l);
      m[uid][d] = (m[uid][d] || 0) + getHours(l);
    });
    return m;
  }, [weekLogs]);

  // Долоо хоногт оролцсон хэрэглэгчид (зөвхөн бичлэгтэй хэрэглэгчдийг харуулна)
  const activeUserIds = useMemo(() => {
    const ids = new Set(weekLogs.map((l) => l.userId));
    return users.filter((u) => ids.has(u.id));
  }, [users, weekLogs]);

  const weekTotal = weekLogs.reduce((a, l) => a + getHours(l), 0);

  // ── Нэмэх ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.userId || !form.projectId || !form.desc || !form.hours) {
      showNotify("⚠️ Бүх талбарыг бөглөнө үү!");
      return;
    }

    const project = projects.find((p) => p.id === Number(form.projectId));

    const newLog = {
      id:        "tmp_" + Date.now(),
      userId:    Number(form.userId),
      projectId: Number(form.projectId),
      project:   project?.name,
      desc:      form.desc,
      hours:     Number(form.hours),
      date:      form.date,
    };

    await setTimeLogs([newLog, ...timeLogs]);
    setModal(false);
    setForm(emptyForm);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, date: weekDates[0] });
    setModal(true);
  };

  const triggerDelete = (id) => { setDelId(id); setConf(true); };
  const confirmDelete = async () => {
    await deleteTimeLog(deleteId);
    setConf(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Цагийн бүртгэлүүд</h1>
          <p className="text-xs text-gray-400">Ажилчдын 7 хоногийн цагийн хүснэгт</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
            <button onClick={goPrevWeek} className="btn-icon w-7 h-7 text-xs">←</button>
            <button onClick={goThisWeek} className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600">
              {weekLabel}
            </button>
            <button onClick={goNextWeek} className="btn-icon w-7 h-7 text-xs">→</button>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            + Цаг нэмэх
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-gray-400">Долоо хоногийн нийт цаг</div>
          <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{weekTotal}ц</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Оролцсон ажилтан</div>
          <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{activeUserIds.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-400">Нийт бүртгэл тоо</div>
          <div className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{weekLogs.length}</div>
        </div>
      </div>

      {/* ✅ ШИНЭ: 7 хоногийн матриц хүснэгт — мөр = ажилтан, багана = өдөр */}
      <div className="card overflow-hidden p-0">
        {activeUserIds.length === 0 ? (
          <EmptyState
            title="Энэ долоо хоногт бүртгэл алга"
            desc="Сонгосон долоо хоногт ямар нэгэн цаг бүртгэгдээгүй байна."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b dark:border-gray-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3 sticky left-0 bg-gray-50 dark:bg-gray-800/50 z-10">Ажилтан</th>
                  {WEEKDAYS.map((wd, i) => (
                    <th key={wd} className="p-3 text-center min-w-[64px]">
                      <div>{wd}</div>
                      <div className="text-[9px] text-gray-400 font-mono normal-case">
                        {weekDates[i].slice(5)}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                    Нийт
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUserIds.map((u) => {
                  const row = matrix[u.id] || {};
                  const rowTotal = weekDates.reduce((sum, d) => sum + (row[d] || 0), 0);
                  return (
                    <tr key={u.id} className="border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="p-3 font-medium sticky left-0 bg-white dark:bg-gray-900 z-10">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white whitespace-nowrap">
                          <Avatar name={u.username} size="sm" />
                          {u.username}
                        </div>
                      </td>
                      {weekDates.map((d) => (
                        <td key={d} className="p-3 text-center">
                          {row[d] ? (
                            <span className="font-semibold text-gray-900 dark:text-white">{row[d]}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-700">—</span>
                          )}
                        </td>
                      ))}
                      <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
                        {rowTotal}ц
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-3 font-bold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-800/50">
                    Өдрийн нийт
                  </td>
                  {weekDates.map((d) => {
                    const dayTotal = activeUserIds.reduce((sum, u) => sum + ((matrix[u.id] || {})[d] || 0), 0);
                    return (
                      <td key={d} className="p-3 text-center font-semibold text-gray-600 dark:text-gray-400">
                        {dayTotal || "—"}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {weekTotal}ц
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Дэлгэрэнгүй жагсаалт (засах/устгах) ── */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Дэлгэрэнгүй бичлэгүүд</h3>
        {weekLogs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Бичлэг алга</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b dark:border-gray-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3">Ажилтан</th>
                  <th className="p-3">Төсөл</th>
                  <th className="p-3">Хийсэн ажил</th>
                  <th className="p-3">Цаг</th>
                  <th className="p-3">Огноо</th>
                  <th className="p-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {weekLogs.map((l) => (
                  <tr key={l.id} className="border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Avatar name={getUserName(l)} size="sm" />
                        {getUserName(l)}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 font-medium max-w-[160px] truncate">
                      {getProjectName(l)}
                    </td>
                    <td className="p-3 text-gray-500 max-w-xs truncate">{getDesc(l)}</td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{getHours(l)}ц</td>
                    <td className="p-3 text-gray-400 font-mono">{getDate(l)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => triggerDelete(l.id)}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Нэмэх Modal */}
      <Modal
        open={modalOpen}
        title="Цаг бүртгэх"
        onClose={() => setModal(false)}
        onSave={handleSave}
      >
        <FormGroup label="Хэрэглэгч">
          <select className="input" value={form.userId} onChange={set("userId")}>
            <option value="">— Сонгох —</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Төсөл">
          <select className="input" value={form.projectId} onChange={set("projectId")}>
            <option value="">— Сонгох —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Тайлбар">
          <input
            className="input"
            value={form.desc}
            onChange={set("desc")}
            placeholder="Хийсэн ажил..."
          />
        </FormGroup>
        <FormGroup label="Цаг">
          <input
            className="input"
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={form.hours}
            onChange={set("hours")}
            placeholder="8"
          />
        </FormGroup>
        <FormGroup label="Огноо">
          <select className="input" value={form.date} onChange={set("date")}>
            {weekDates.map((d, i) => (
              <option key={d} value={d}>{WEEKDAYS[i]} ({d})</option>
            ))}
          </select>
        </FormGroup>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        title="Бүртгэл устгах"
        desc="Та энэ цагийн бүртгэлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."
        onClose={() => setConf(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
