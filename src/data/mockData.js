// 📁 src/data/mockData.js

export const PROJECTS = [
  {
    id: "p1",
    name: "Дотоод болон Гадна төслийн хуралд оролцсон цаг",
    client: "Дотоод",
    contractNo: "—",
    status: "Идэвхтэй",
  },
  {
    id: "p2",
    name: "Temproray work",
    client: "Hatch",
    contractNo: "SC001",
    status: "Идэвхтэй",
  },
  {
    id: "p3",
    name: "LDI Design review",
    client: "Hatch",
    contractNo: "SC001",
    status: "Идэвхтэй",
  },
  {
    id: "p4",
    name: "Manpower supply",
    client: "Hatch",
    contractNo: "SC0017",
    status: "Идэвхтэй",
  },
];

export const ROLES = ["Architect", "Structural engineer", "HVAC engineer", "Piping engineer", "Electrical engineer", "Automation engineer","Communication engineer","Mechanical engineer"];
export const STATUSES = ["Идэвхтэй", "Хүлээгдэж байна", "Идэвхгүй"];

// 👥 Хэрэглэгчид
// ✅ ТАЙЛБАР: Clerk Dashboard-д publicMetadata тохируулах хэрэгтэй:
// { "role": "admin", "assignedProjects": ["p1", "p2"] }
export const INITIAL_USERS = [
  {
    id: 1,
    name: "Б. Эрдэнэ",
    email: "admin@system.mn",
    role: "admin",
    jobTitle: "Хөгжүүлэгч",
    date: "2025-05-01",
    status: "Идэвхтэй",
    assignedProjects: ["p1", "p2"],
  },
  {
    id: 2,
    name: "Д. Нарантуяа",
    email: "manager@system.mn",
    role: "manager",
    jobTitle: "PM",
    date: "2025-05-03",
    status: "Идэвхтэй",
    assignedProjects: ["p1", "p3"],
  },
  {
    id: 3,
    name: "Г. Батболд",
    email: "user@system.mn",
    role: "user",
    jobTitle: "Дизайнер",
    date: "2025-05-10",
    status: "Хүлээгдэж байна",
    assignedProjects: ["p2", "p4"],
  },
  {
    id: 4,
    name: "О. Мөнхзул",
    email: "tester@system.mn",
    role: "user",
    jobTitle: "Тестер",
    date: "2025-05-14",
    status: "Идэвхтэй",
    assignedProjects: ["p1", "p4"],
  },
];

export const INITIAL_LOGS = [
  { id: 1, user: "Б. Эрдэнэ",    project: "Дотоод болон Гадна төслийн хуралд оролцсон цаг", desc: "UI компонент хөгжүүлэлт", hours: 8, date: "2025-06-14" },
  { id: 2, user: "Д. Нарантуяа", project: "LDI Design review",                                desc: "Sprint төлөвлөгөө",       hours: 6, date: "2025-06-14" },
  { id: 3, user: "Г. Батболд",   project: "Temproray work",                                   desc: "Дизайн макет",             hours: 7, date: "2025-06-13" },
  { id: 4, user: "О. Мөнхзул",   project: "Manpower supply",                                  desc: "API тест",                 hours: 5, date: "2025-06-13" },
  { id: 5, user: "Б. Эрдэнэ",    project: "Temproray work",                                   desc: "Bug засвар",               hours: 4, date: "2025-06-12" },
  { id: 6, user: "Д. Нарантуяа", project: "Дотоод болон Гадна төслийн хуралд оролцсон цаг", desc: "Баг хурал",                hours: 3, date: "2025-06-11" },
];
