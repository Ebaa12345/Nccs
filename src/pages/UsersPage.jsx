// 📁 src/pages/UsersPage.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Modal, FormGroup, Avatar, StatusBadge } from "../components/UI";
import { useAppContext } from "../context/AppContext";

// Гадуур дарахад цэсийг хаах — "fixed inset-0" давхарга ашиглахгүй, илүү найдвартай
function useClickOutside(active, onOutside, extraRef) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      const inButton = ref.current && ref.current.contains(e.target);
      const inMenu   = extraRef?.current && extraRef.current.contains(e.target);
      if (!inButton && !inMenu) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active, onOutside, extraRef]);
  return ref;
}

// ✅ Хүснэгт "overflow-x-auto" дотор байх үед dropdown хэсэгчлэгдэж (clip) дарагдахгүй
// болохоос сэргийлж document.body руу portal-оор гаргаж, fixed байрлалаар зурна.
function ActionMenu({ open, onToggle, onClose, items }) {
  const btnRef  = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const clickOutsideRef = useClickOutside(open, onClose, menuRef);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.right });
  }, [open]);

  const setBtnRef = (el) => { btnRef.current = el; clickOutsideRef.current = el; };

  return (
    <>
      <button
        ref={setBtnRef}
        type="button"
        onClick={onToggle}
        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 font-bold transition-all inline-flex items-center justify-center text-sm"
      >
        •••
      </button>
      {open && coords && createPortal(
        <div
          ref={menuRef}
          className="fixed w-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-[100] p-1 py-1.5 space-y-0.5 animate-fade-in text-left"
          style={{ top: coords.top, left: coords.left - 160 }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { item.onClick(); onClose(); }}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                item.danger
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

const STATUSES = ["Идэвхтэй", "Хүлээгдэж байна", "Идэвхгүй"];

const ROLE_STYLE = {
  admin:   "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200 dark:border-violet-900",
  manager: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900",
  user:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
};
const ROLE_LABEL = { admin: "Админ", manager: "Менежер", user: "Хэрэглэгч" };

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLE[role] || ROLE_STYLE.user}`}>
      {ROLE_LABEL[role] || role}
    </span>
  );
}

const EMPTY_USER_FORM = { username: "", password: "", firstName: "", lastName: "", role: "user" };

export default function UsersPage() {
  const {
    users, deleteUser, addUser, resetPassword, toggleProjectUser, assignJobTitle, jobTitles,
    projects, addProject, deleteProject,
    showNotify,
  } = useAppContext();

  const [activeTab,     setActiveTab]     = useState("users");
  const [projForm,      setProjForm]      = useState({ name: "", client: "", contractNo: "" });
  const [assignModal,   setAssignModal]   = useState(false);

  // ✅ ЗАСВАР: Төсөл нэмэх Модал цонхны төлөв
  const [projectModal,  setProjectModal]  = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [saving,         setSaving]        = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeProjDropdown, setActiveProjDropdown] = useState(null);

  const [userModal, setUserModal] = useState(false);
  const [userForm,  setUserForm]  = useState(EMPTY_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);

  const [passwordModal, setPasswordModal] = useState(null); // user object эсвэл null
  const [newPassword,   setNewPassword]   = useState("");

  const handleAddUserSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userForm.username.trim() || !userForm.password) {
      showNotify("⚠️ Нэвтрэх нэр болон нууц үгийг бөглөнө үү!");
      return;
    }
    setSavingUser(true);
    const saved = await addUser({
      username:  userForm.username.trim(),
      password:  userForm.password,
      firstName: userForm.firstName.trim(),
      lastName:  userForm.lastName.trim(),
      role:      userForm.role,
    });
    setSavingUser(false);
    if (saved) {
      setUserForm(EMPTY_USER_FORM);
      setUserModal(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 4) {
      showNotify("⚠️ Нууц үг дор хаяж 4 тэмдэгт байх ёстой!");
      return;
    }
    const ok = await resetPassword(passwordModal.id, newPassword);
    if (ok) {
      setPasswordModal(null);
      setNewPassword("");
    }
  };

  // ✅ ЗАСВАР: Модал дотроос хадгалах үед ажиллах функц
  const handleAddProjectSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!projForm.name.trim() || !projForm.client.trim()) {
      showNotify("⚠️ Төслийн нэр болон Захиалагчийг бөглөнө үү!");
      return;
    }
    setSaving(true);
    await addProject({
      name:       projForm.name.trim(),
      client:     projForm.client.trim(),
      contractNo: projForm.contractNo.trim() || "—",
      status:     "Идэвхтэй",
    });
    setProjForm({ name: "", client: "", contractNo: "" });
    setSaving(false);
    setProjectModal(false); // Хадгалж дуусаад модалыг хаана
    showNotify("🎉 Шинэ төсөл амжилттай нэмэгдлээ.");
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Энэ төслийг устгахдаа итгэлтэй байна уу?")) return;
    await deleteProject(id);
  };

  const handleToggle = async (userId, projectId) => {
    await toggleProjectUser(userId, projectId);
  };

  const getAssigned = (u) => {
    if (Array.isArray(u.assignedProjects)) return u.assignedProjects;
    try { return JSON.parse(u.assignedProjects || "[]"); } catch { return []; }
  };

  const roleCounts = useMemo(() => {
    return users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Толгой — статистик */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Нийт хэрэглэгч", value: users.length,             icon: "👥" },
          { label: "Админ",          value: roleCounts.admin || 0,     icon: "🛡️" },
          { label: "Менежер",        value: roleCounts.manager || 0,   icon: "📊" },
          { label: "Идэвхтэй төсөл", value: projects.length,           icon: "📁" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="card p-4 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</h3>
            </div>
            <span className="text-xl bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl flex-shrink-0">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Таб */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        {[
          { key: "users",    label: `👥 Хэрэглэгчид (${users.length})` },
          { key: "projects", label: `📁 Төслүүд (${projects.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-[1.02]"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ХЭРЭГЛЭГЧИД ── */}
      {activeTab === "users" && (
        <div className="card space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Системийн хэрэглэгчид</h2>
            <button
              onClick={() => setUserModal(true)}
              className="bg-indigo-600 text-white rounded-xl py-1.5 px-3.5 text-xs font-semibold hover:bg-indigo-700 hover:shadow-md active:scale-[0.97] transition-all shadow-sm flex items-center gap-1"
            >
              ➕ Хэрэглэгч нэмэх
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b dark:border-gray-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3">Нэр</th>
                  <th className="p-3">И-мэйл</th>
                  <th className="p-3">Эрх</th>
                  <th className="p-3">Ажлын төрөл</th>
                  <th className="p-3">Хуваарилагдсан төслүүд</th>
                  <th className="p-3">Төлөв</th>
                  <th className="p-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                      Одоогоор хэрэглэгч байхгүй байна.
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => {
                    const assigned = getAssigned(u);
                    const name = u.firstName && u.lastName
                      ? `${u.firstName} ${u.lastName}`
                      : u.displayName || u.username;
                    return (
                      <tr
                        key={u.id}
                        className="border-b dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-medium">
                            <Avatar name={name} />
                            <div className="min-w-0">
                              <div className="truncate">{name}</div>
                              {u.jobTitle && (
                                <div className="text-[10px] text-gray-400 truncate">{u.jobTitle}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{u.username}</td>
                        <td className="p-3"><RoleBadge role={u.role} /></td>
                        <td className="p-3">
                          <select
                            value={u.jobTitle || ""}
                            onChange={(e) => assignJobTitle(u.id, e.target.value)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700
                                       bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
                          >
                            <option value="">— Сонгоогүй —</option>
                            {jobTitles.map((jt) => (
                              <option key={jt} value={jt}>{jt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 max-w-xs text-gray-500">
                          {assigned.length > 0
                            ? projects
                                .filter(p => assigned.includes(p.id))
                                .map(p => p.name)
                                .join(", ") || "—"
                            : <span className="text-gray-300 dark:text-gray-600">Төсөл байхгүй</span>
                          }
                        </td>
                        <td className="p-3"><StatusBadge status="Идэвхтэй" /></td>
                        <td className="p-3 text-right">
                          <ActionMenu
                            open={activeDropdown === u.id}
                            onToggle={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                            onClose={() => setActiveDropdown(null)}
                            items={[
                              { label: "Нууц үг солих", icon: "🔑", onClick: () => setPasswordModal(u) },
                              { label: "Устгах", icon: "🗑️", danger: true, onClick: () => deleteUser(u.id) },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ТӨСЛҮҮД ── */}
      {activeTab === "projects" && (
        <div className="space-y-4 animate-fade-in">

          {/* Жагсаалтын карт */}
          <div className="card">
            {/* ✅ ЗАСВАР: Төслийн толгой хэсэгт "+ Төсөл нэмэх" товчийг байрлуулав */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Идэвхтэй төслүүд ({projects.length})
              </h3>
              <button
                onClick={() => setProjectModal(true)}
                className="bg-indigo-600 text-white rounded-xl py-1.5 px-3.5 text-xs font-semibold hover:bg-indigo-700 hover:shadow-md active:scale-[0.97] transition-all shadow-sm flex items-center gap-1"
              >
                ➕ Төсөл нэмэх
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                Одоогоор төсөл байхгүй байна. Баруун дээд талын товчлуураар шинэ төсөл нэмнэ үү.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px] tracking-wider">
                      <th className="p-3 w-2/5">Нэр</th>
                      <th className="p-3">Захиалагч</th>
                      <th className="p-3">Гэрээ №</th>
                      <th className="p-3">Төлөв</th>
                      <th className="p-3 text-right">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => (
                      <tr
                        key={p.id}
                        className="border-b dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors duration-200 animate-fade-in"
                        style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                      >
                        <td className="p-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                        <td className="p-3">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono text-[11px] text-gray-600 dark:text-gray-300">
                            {p.client || "—"}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-500">{p.contractNo || "—"}</td>
                        <td className="p-3">
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-medium text-[11px]">
                            {p.status || "Идэвхтэй"}
                          </span>
                        </td>
                        
                        <td className="p-3 text-right whitespace-nowrap">
                          <ActionMenu
                            open={activeProjDropdown === p.id}
                            onToggle={() => setActiveProjDropdown(activeProjDropdown === p.id ? null : p.id)}
                            onClose={() => setActiveProjDropdown(null)}
                            items={[
                              { label: "Хуваарилах", icon: "👥", onClick: () => { setSelectedProject(p); setAssignModal(true); } },
                              { label: "Устгах", icon: "🗑️", danger: true, onClick: () => handleDeleteProject(p.id) },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ ЗАСВАР: Төсөл нэмэх ШИНЭ Модал цонх (Зураг шиг харагдана) */}
      <Modal
        open={projectModal}
        title="📁 Шинэ төсөл үүсгэх"
        onClose={() => setProjectModal(false)}
        onSave={handleAddProjectSubmit}
      >
        <div className="space-y-3.5 p-1">
          <FormGroup label="Төслийн нэр">
            <input
              value={projForm.name}
              onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
              placeholder="Төслийн үндсэн нэр..."
              className="input text-xs py-2 w-full"
            />
          </FormGroup>
          
          <FormGroup label="Захиалагч байгууллага">
            <input
              value={projForm.client}
              onChange={(e) => setProjForm({ ...projForm, client: e.target.value })}
              placeholder="Жишээ: Hatch, Oyu Tolgoi гэх мэт..."
              className="input text-xs py-2 w-full"
            />
          </FormGroup>
          
          <FormGroup label="Гэрээний дугаар (Сонголттой)">
            <input
              value={projForm.contractNo}
              onChange={(e) => setProjForm({ ...projForm, contractNo: e.target.value })}
              placeholder="Жишээ нь: SC001 эсвэл гэрээний код..."
              className="input text-xs py-2 w-full"
            />
          </FormGroup>
          
          {saving && (
            <p className="text-[11px] text-indigo-500 animate-pulse">Төслийг системд бүртгэж байна, түр хүлээнэ үү...</p>
          )}
        </div>
      </Modal>

      {/* ── Хэрэглэгч нэмэх Modal ── */}
      <Modal
        open={userModal}
        title="👤 Шинэ хэрэглэгч нэмэх"
        onClose={() => setUserModal(false)}
        onSave={handleAddUserSubmit}
      >
        <div className="space-y-3.5 p-1">
          <FormGroup label="Нэвтрэх нэр (username)">
            <input
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              placeholder="жишээ: bataa@nccs.mn"
              className="input text-xs py-2 w-full"
            />
          </FormGroup>

          <FormGroup label="Нууц үг">
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              placeholder="Дор хаяж 4 тэмдэгт"
              className="input text-xs py-2 w-full"
            />
          </FormGroup>

          <FormGroup label="Овог">
            <input
              value={userForm.lastName}
              onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
              className="input text-xs py-2 w-full"
            />
          </FormGroup>

          <FormGroup label="Нэр">
            <input
              value={userForm.firstName}
              onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
              className="input text-xs py-2 w-full"
            />
          </FormGroup>

          <FormGroup label="Эрх">
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="input text-xs py-2 w-full"
            >
              <option value="user">Хэрэглэгч</option>
              <option value="manager">Менежер</option>
              <option value="admin">Админ</option>
            </select>
          </FormGroup>

          {savingUser && (
            <p className="text-[11px] text-indigo-500 animate-pulse">Хэрэглэгчийг системд бүртгэж байна, түр хүлээнэ үү...</p>
          )}
        </div>
      </Modal>

      {/* ── Нууц үг солих Modal ── */}
      <Modal
        open={!!passwordModal}
        title={`"${passwordModal?.displayName || passwordModal?.username}"-ийн нууц үг солих`}
        onClose={() => { setPasswordModal(null); setNewPassword(""); }}
        onSave={handleResetPasswordSubmit}
      >
        <div className="p-1">
          <FormGroup label="Шинэ нууц үг">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Дор хаяж 4 тэмдэгт"
              className="input text-xs py-2 w-full"
            />
          </FormGroup>
        </div>
      </Modal>

      {/* ── Ажилтан хуваарилах Modal ── */}
      <Modal
        open={assignModal}
        title={`"${selectedProject?.name}"-д ажилтан хуваарилах`}
        onClose={() => setAssignModal(false)}
        onSave={() => { setAssignModal(false); showNotify("Хуваарилалт хадгалагдлаа ✓"); }}
      >
        <div className="space-y-2 max-h-60 overflow-y-auto p-1">
          {users.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Хэрэглэгч байхгүй байна</p>
          ) : (
            users.map((u) => {
              const assigned = getAssigned(u);
              const isAssigned = assigned.includes(selectedProject?.id);
              const displayLabel = u.firstName && u.lastName
                ? `${u.lastName} ${u.firstName}`
                : u.displayName || u.username;
              return (
                <div key={u.id} className="flex items-center justify-between p-2 border rounded-xl dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {displayLabel}
                    <span className="text-gray-400 ml-1">({u.role})</span>
                  </span>
                  <button
                    onClick={() => handleToggle(u.id, selectedProject.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isAssigned
                        ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    }`}
                  >
                    {isAssigned ? "Хасах ✕" : "Нэмэх +"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}