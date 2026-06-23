// 📁 src/pages/UsersPage.jsx
import { useState } from "react";
import { Modal, FormGroup } from "../components/UI";
import { useAppContext } from "../context/AppContext";

const STATUSES = ["Идэвхтэй", "Хүлээгдэж байна", "Идэвхгүй"];

function LocalAvatar({ firstName, lastName, username }) {
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : username
      ? username.slice(0, 2)
      : "U";
  return (
    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
      {initials}
    </div>
  );
}

function LocalStatusBadge({ status }) {
  const isOk = status === "Идэвхтэй";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
      isOk
        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
    }`}>
      {status || "Идэвхтэй"}
    </span>
  );
}

export default function UsersPage() {
  const {
    users, deleteUser, toggleProjectUser, assignJobTitle, jobTitles,
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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Таб */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        {[
          { key: "users",    label: `👥 Хэрэглэгчид (${users.length})` },
          { key: "projects", label: `📁 Төслүүд (${projects.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ХЭРЭГЛЭГЧИД ── */}
      {activeTab === "users" && (
        <div className="card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Системийн хэрэглэгчид</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b dark:border-gray-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3">№</th>
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
                    <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                      Одоогоор хэрэглэгч байхгүй байна.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const assigned = getAssigned(u);
                    return (
                      <tr key={u.id} className="border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="p-3 font-medium text-gray-900 dark:text-white">
                          {u.lastName || "—"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                            <LocalAvatar firstName={u.firstName} lastName={u.lastName} username={u.username} />
                            {u.firstName || u.displayName || u.username}
                          </div>
                        </td>
                        <td className="p-3 text-gray-500 font-mono">{u.username}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold text-[10px] text-gray-600 dark:text-gray-400 uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={u.jobTitle || ""}
                            onChange={(e) => assignJobTitle(u.id, e.target.value)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700
                                       bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                        <td className="p-3"><LocalStatusBadge status="Идэвхтэй" /></td>
                        <td className="p-3 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === u.id ? null : u.id);
                            }}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 font-bold transition-all inline-flex items-center justify-center text-sm"
                          >
                            •••
                          </button>

                          {activeDropdown === u.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                              <div className="absolute right-3 mt-1 w-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-20 p-1 py-1.5 animate-fade-in">
                                <button
                                  onClick={() => {
                                    deleteUser(u.id);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                                >
                                  🗑️ Устгах
                                </button>
                              </div>
                            </>
                          )}
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
        <div className="space-y-4">
          
          {/* Жагсаалтын карт */}
          <div className="card">
            {/* ✅ ЗАСВАР: Төслийн толгой хэсэгт "+ Төсөл нэмэх" товчийг байрлуулав */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Идэвхтэй төслүүд ({projects.length})
              </h3>
              <button
                onClick={() => setProjectModal(true)}
                className="bg-indigo-600 text-white rounded-xl py-1.5 px-3.5 text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1"
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
                    {projects.map((p) => (
                      <tr key={p.id} className="border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
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
                        
                        <td className="p-3 text-right relative whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProjDropdown(activeProjDropdown === p.id ? null : p.id);
                            }}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 font-bold transition-all inline-flex items-center justify-center text-sm"
                          >
                            •••
                          </button>

                          {activeProjDropdown === p.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveProjDropdown(null)} />
                              <div className="absolute right-3 mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-20 p-1 space-y-0.5 animate-fade-in text-left">
                                <button
                                  onClick={() => {
                                    setSelectedProject(p);
                                    setAssignModal(true);
                                    setActiveProjDropdown(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                                >
                                  👥 Хуваарилах
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteProject(p.id);
                                    setActiveProjDropdown(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                                >
                                  🗑️ Устгах
                                </button>
                              </div>
                            </>
                          )}
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