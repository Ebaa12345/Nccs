# NCCS Цаг Бүртгэлийн Систем — Кодын бүрэн тайлбар

Энэ баримт нь төслийн **бүх код**-ын логикийг файл бүрээр, дараалалтайгаар тайлбарладаг. Зорилго нь: та энэ баримтыг уншаад, ямар файл юу хийдэг, яагаад тэгж бичигдсэн, өгөгдөл хэрхэн урсдаг гэдгийг бүрэн ойлгох.

---

## 1. Систем юу хийдэг вэ?

NCCS Engineering компанийн дотоод **ажлын цаг бүртгэлийн систем**. Үндсэн боломжууд:

- Ажилтан бүр өдөр тутмын ажилласан цагаа, ямар төсөл/даалгаварт зарцуулснаа бүртгэнэ
- Admin/Менежер бүх ажилтны цагийг 7 хоногийн хүснэгтээр хардаг
- Admin төсөл үүсгэж, ажилтнуудад хуваарилдаг
- Admin даалгавар (Task) үүсгэж, инженерт хуваарилж, явцыг (progress %) хардаг
- Тайлан CSV болгож экспортлодог
- Хэрэглэгч бүр username + password-аар нэвтэрдэг (Microsoft login-г устгасан)

---

## 2. Ашигласан технологи

| Хэсэг | Технологи |
|---|---|
| Frontend | React 19 + Vite + React Router v7 + Tailwind CSS 3 |
| 3D эффект | Three.js (`@react-three/fiber`, `@react-three/drei`) — зөвхөн Landing/Login хуудсанд |
| Icons | `lucide-react` |
| Backend | Node.js + Express |
| Өгөгдлийн сан | MySQL (Sequelize ORM-оор) |
| Нэвтрэлт | Өөрийн username/password систем (bcrypt hash) + localStorage session |

---

## 3. Төслийн бүтэц

```
web/
├── index.html              # Vite-ийн үндсэн HTML (script src="/src/main.jsx")
├── vite.config.js          # Vite build тохиргоо (React plugin)
├── tailwind.config.js      # Tailwind тохиргоо (darkMode: "class" гэдгийг анзаараарай!)
├── src/
│   ├── main.jsx             # Апп эхлэх цэг — <App /> render хийнэ
│   ├── App.jsx              # Бүх routing логик (аль хуудас хэнд харагдахыг шийднэ)
│   ├── index.css            # Tailwind + өөрийн component класс (.card, .btn-sm, .input г.м)
│   ├── context/
│   │   ├── AuthContext.jsx   # Нэвтрэлт (login/logout), dark mode төлөв
│   │   └── AppContext.jsx    # Бүх өгөгдөл (users, projects, tasks, timeLogs) татах/хадгалах
│   ├── components/
│   │   ├── Layout.jsx        # Admin/Manager-ийн sidebar бүхий layout
│   │   ├── UI.jsx             # Дахин ашиглагддаг жижиг компонентууд (Modal, Avatar, Toast г.м)
│   │   ├── Hero3D.jsx         # Landing хуудасны 3D анимэйшн бөмбөрцөг
│   │   └── ProgressBar.jsx    # Task-ийн явцын % харуулах progress bar
│   ├── client/
│   │   ├── ClientLayout.jsx   # Энгийн "user" эрхтэй хэрэглэгчийн layout
│   │   ├── ClientHome.jsx     # Энгийн хэрэглэгчийн өдөр тутмын цаг бүртгэх хуудас
│   │   └── Footer.jsx         # (одоогоор хаана ч render хийгддэггүй, ашиглагдаагүй)
│   └── pages/
│       ├── LoginPage.jsx      # "/" болон "/login" — нэвтрэх + танилцуулга хуудас
│       ├── LandingPage.jsx    # (route-д холбогдоогүй, LoginPage-тэй ижилхэн хуучин хувилбар)
│       ├── DashboardPage.jsx  # Admin/Manager-ийн нүүр хуудас (статистик + task жагсаалт)
│       ├── UsersPage.jsx      # Хэрэглэгч & Төслийн удирдлага (зөвхөн admin/manager)
│       ├── TasksPage.jsx      # Бүх Task-ийн жагсаалт, үүсгэх/засах
│       ├── TimeLogsPage.jsx   # 7 хоногийн цагийн matrix (admin харагдац)
│       ├── ReportsPage.jsx    # Тайлан + CSV экспорт
│       └── ProfilePage.jsx    # Хэрэглэгчийн хувийн профайл
└── backend/
    ├── server.js              # Express сервер эхлэх цэг
    ├── config/db.js           # MySQL холболт (Sequelize)
    ├── models/                # User, Project, Task, TimeLog (өгөгдлийн сангийн бүтэц)
    └── routes/
        ├── authRoutes.js       # POST /api/auth/login
        ├── appDataRoutes.js    # Users/Projects/TimeLogs CRUD бүх route
        ├── taskRoutes.js       # Task CRUD
        └── webhookRoutes.js    # (Clerk webhook — одоогоор ашиглагдахгүй, хуучин үлдэгдэл)
```

---

## 4. BACKEND тайлбар

### 4.1 `backend/server.js` — Серверийн эхлэл

```js
TimeLog.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
TimeLog.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'assignedUserId', onDelete: 'SET NULL', as: 'assignedUser' });
```

Энэ хэсэг нь хүснэгтүүдийн **хоорондын холбоог** (relations) зааж өгдөг:
- Нэг TimeLog нь яг **нэг** User, **нэг** Project-той холбогдоно (хэн, ямар төсөлд цаг зарцуулсан)
- Нэг Task нь **нэг** Project-д харьяалагдаж, **нэг эсвэл 0** User-т (`assignedUser`) хуваарилагдана
- `onDelete: 'CASCADE'` — Хэрэглэгч/Төсөл устахад холбогдох TimeLog-ууд ч мөн устана
- `onDelete: 'SET NULL'` — Хэрэглэгч устахад Task устахгүй, зөвхөн `assignedUserId` нь хоосон болно

Дараа нь:
```js
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appdata', require('./routes/appDataRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
```
Энэ 3 мөр нь **бүх backend API-ийн route-уудыг** тохирох URL prefix-тэй холбож байна. Жишээ нь `authRoutes.js` дотор `router.post('/login', ...)` бичсэн бол бодит URL нь `POST /api/auth/login` болно.

`sequelize.sync({ alter: true })` — хөгжүүлэлтийн үед (`NODE_ENV=development`) өгөгдлийн сангийн хүснэгтийн бүтцийг models-тай **автоматаар тааруулна** (шинэ багана нэмэгдвэл сан руу нэмнэ). Prod орчинд `sync()` (alter-гүй) ашиглана — учир нь alter нь том санд аюултай байж болно.

### 4.2 `backend/config/db.js` — MySQL холболт

```js
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, { host, dialect: 'mysql' });
```
`.env` файлаас MySQL-ийн холболтын мэдээллийг уншиж, Sequelize instance үүсгэнэ. `connectDB()` функц нь холболтыг шалгаад, амжилтгүй бол серверийг унтраана (`process.exit(1)`).

### 4.3 Models (өгөгдлийн сангийн хүснэгтүүд)

**`User.js`**
| Багана | Тайлбар |
|---|---|
| `username` | Нэвтрэх нэр (жишээ: `it@nccs.mn`) — unique |
| `password` | bcrypt-ээр hash хийсэн нууц үг |
| `role` | `"admin"`, `"manager"`, `"user"` |
| `microsoftId` | Хуучин Microsoft login-ий үлдэгдэл багана (одоо ашиглагдахгүй, `NULL` байж болно) |
| `displayName`, `firstName`, `lastName` | Хэрэглэгчийн нэр |
| `jobTitle` | Admin-аас оноосон ажлын төрөл (жишээ: "Architect") |
| `assignedProjects` | JSON string хэлбэрээр хадгалагдсан **төслийн ID-нуудын массив** (жишээ: `"[3,5,7]"`) |

> ⚠️ **Чухал:** `assignedProjects` бол өгөгдлийн санд **TEXT** төрлөөр хадгалагддаг тул код дотор үргэлж `JSON.parse(...)` хийж унших ёстой. Хаа сайгүй `getAssigned(u)` гэдэг функц давтагдаж байгаа шалтгаан нь энэ.

**`Project.js`** — `name`, `client` (захиалагч), `contractNo` (гэрээний дугаар), `status`.

**`Task.js`** — `title`, `description`, `estimatedHours` (төлөвлөсөн цаг), `startDate`, `dueDate`, `priority` (Low/Medium/High), `status` (In progress/Completed/On hold), `projectId`, `assignedUserId`.

> Анхаарах зүйл: Task-д "хэдэн цаг зарцуулсан бэ" гэдэг **шууд багана байхгүй**. Энэ нь TimeLog хүснэгтээс тооцоологддог (доор [8-р бүлэгт](#явцын-хувь-progress-тооцоолол) тайлбарласан).

**`TimeLog.js`** — `taskDescription` (хийсэн ажлын тайлбар), `hoursSpent`, `logDate`, `userId`, `projectId`. Энэ бол хэрэглэгчийн ӨДӨР ТУТМЫН бүртгэсэн ажлын цагийн мөр бүр.

### 4.4 Routes (API endpoint-ууд)

**`authRoutes.js`** — зөвхөн 1 route:
```js
POST /api/auth/login   { username, password } →  { id, username, displayName, role, ... }
```
`User.findOne({ where: { username } })` олоод, `bcrypt.compare(password, user.password)`-ээр нууц үгийг шалгана. Зөв бол хэрэглэгчийн мэдээллийг **flat object** хэлбэрээр буцаана (frontend яг үүнийг `localStorage`-д хадгалдаг).

**`appDataRoutes.js`** — хамгийн олон route агуулсан файл:

| Route | Тайлбар |
|---|---|
| `GET /init?userId=&role=` | Апп ачаалахад **users, projects, timeLogs** гурвыг нэг дор буцаана (AppContext эхлэхэд дуудна) |
| `GET /job-titles` | Ажлын төрлүүдийн жагсаалт (hard-coded массив) |
| `PUT /users/:id/job-title` | Admin ажилтанд ажлын төрөл оноох |
| `POST /projects`, `DELETE /projects/:id` | Төсөл нэмэх/устгах |
| `GET/PUT /users/:userId/projects` | Ажилтны хуваарилагдсан төслүүдийг унших/шинэчлэх |
| `POST /users` | **Шинэ хэрэглэгч үүсгэх** (username+password) — bcrypt-ээр hash хийж хадгална |
| `PUT /users/:id/password` | Хэрэглэгчийн нууц үг шинэчлэх (admin-аас) |
| `DELETE /users/:id` | Хэрэглэгч устгах |
| `GET/POST/DELETE /timelogs` | Цагийн бүртгэл унших/нэмэх/устгах |

**`taskRoutes.js`** — Task-ийн CRUD (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`). `formatTask()` функц нь Sequelize-ийн raw объектыг frontend-д тохиромжтой, `project` болон `engineer` гэсэн nested объект бүхий хэлбэрт хөрвүүлдэг.

**`webhookRoutes.js`** — Clerk (гуравдагч талын auth үйлчилгээ) webhook-той харилцах хуучин код. Одоо системд Clerk ашиглагдахгүй болсон тул энэ route дуудагдахгүй, гэхдээ устгагдаагүй үлдсэн.

---

## 5. FRONTEND тайлбар

### 5.1 `main.jsx` — Апп эхлэх цэг

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```
Маш энгийн. Өмнө нь энд Microsoft MSAL provider байсан, устгагдсан.

### 5.2 `App.jsx` — Routing логик (хамгийн чухал файл)

Энэ файл **"хэн, хаана орох ёстой вэ"** гэдгийг бүхэлд нь шийддэг. 3 гол хэсэгтэй:

**a) `ProtectedRoute` компонент** — "хамгаалалт" гэсэн үг:
```jsx
function ProtectedRoute({ allowedRoles }) {
  if (isLoading) return <Spinner />;              // хэрэглэгч мэдээлэл ачаалж байвал хүлээ
  if (!user) return <Navigate to="/login" />;       // нэвтрээгүй бол login руу
  if (!allowedRoles.includes(user.role))            // эрх тохирохгүй бол
    return <Navigate to={ ... } />;                 //   өөрийн эрхэд тохирох хуудас руу шидэх
  return <Outlet />;                                 // бүх шаардлага хангавал жинхэнэ хуудсыг харуул
}
```
Жишээ нь: `allowedRoles={["admin"]}` гэж заасан route-ыг manager орж чадахгүй (2-р нөхцөл дээр `/dashboard` руу буцаана).

**b) Route бүтэц:**
```jsx
<Route path="/"      element={user ? <Navigate to={fallbackPath} /> : <LoginPage />} />
<Route path="/login" element={user ? <Navigate to={fallbackPath} /> : <LoginPage />} />
```
Энэ 2 мөр **чухал засвар байсан**: өмнө нь энд нөхцөлгүйгээр үргэлж `<LoginPage />`-г харуулдаг байсан тул нэвтэрсэн хэрэглэгч ч гэсэн "/" руу орвол дахин Login хуудас л харагддаг байсан (admin login хийгээд ч dashboard руу шилждэггүй байсан шалтгаан).

```jsx
<Route element={<ProtectedRoute allowedRoles={["user"]} />}>
  <Route element={<ClientLayout />}>
    <Route path="/home" element={<ClientHome />} />
    ...
```
`"user"` эрхтэй хүн зөвхөн `ClientLayout`-той (энгийн navbar) хуудсуудыг харна.

```jsx
<Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
  <Route element={<Layout />}>
    <Route path="/home" element={<ClientHome />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    ...
```
`admin`/`manager` эрхтэй хүн `Layout`-той (sidebar-тай) хуудсуудыг харна.

> ⚠️ **Мэдэгдэж буй жижиг зөрчил:** `/home` гэсэн зам ХОЁУЛАА тодорхойлогдсон байгаа (нэг нь `["user"]`-д, нөгөө нь `["admin","manager"]`-д). React Router эхний тохирсон route-оо сонгодог тул admin хэрэглэгч `/home` руу шууд орохыг оролдвол эхний (`"user"`-т зориулсан) `ProtectedRoute`-д баригдаж, тэр нь эрх тохирохгүй гэж `/dashboard` руу шидчихдэг. Практикт admin `fallbackPath`-аараа шууд `/dashboard`-д ордог тул энэ асуудал бараг харагддаггүй, гэхдээ мэдэж байх хэрэгтэй.

**c) `AppShell`** — дээрх бүгдийг агуулж, `<ToastLayer />`-ийг (амжилт/алдааны мессеж харуулагч) бас render хийдэг гол компонент. Хамгийн доод талд `App()` нь `BrowserRouter` → `AuthProvider` → `AppProvider` гэсэн дарааллаар бүгдийг ороож өгдөг (Context-ууд хамгийн гадна байх ёстой, учир нь дотор нь байгаа бүх компонент тэднийг ашигладаг).

### 5.3 Context-ууд

**`AuthContext.jsx`** — "Хэн нэвтэрсэн бэ?" гэдгийг хариуцна.

```jsx
const [user, setUser] = useState(null);
```

```jsx
useEffect(() => {
  const saved = localStorage.getItem("nccs_user");
  if (saved) setUser(JSON.parse(saved));
  setIsLoading(false);
}, []);
```
Апп нээгдэх бүрд localStorage-с хадгалсан session-г **сэргээнэ** — тиймээс browser-ыг хаагаад дахин нээхэд дахин нэвтрэх шаардлагагүй.

```jsx
const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, { method: "POST", body: JSON.stringify({username, password}) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  setUser(data);
  localStorage.setItem("nccs_user", JSON.stringify(data));
};
```
`LoginPage`-ийн форм энэ функцийг дуудна. Амжилтгүй бол `throw` хийж, `LoginPage`-ийн `catch` блок алдааг дэлгэцэнд харуулна.

```jsx
const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
useEffect(() => {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
}, [dark]);
```
Dark mode-ийн логик. `<html>` тагт `class="dark"` нэмэх/хасах замаар ажилладаг. **Энэ зөв ажиллахын тулд `tailwind.config.js`-д `darkMode: "class"` заавал байх ёстой** — өмнө нь дутуу байсныг олж нэмсэн.

**`AppContext.jsx`** — "Өгөгдөл (users/projects/tasks/timeLogs) хэрхэн авах, хадгалах вэ?" гэдгийг хариуцна.

```jsx
useEffect(() => {
  if (!user) return;
  const loadData = async () => {
    const [initRes, tasksRes] = await Promise.all([
      fetch(`${API_URL}/appdata/init?userId=${user.id}&role=${user.role}`),
      fetch(`${API_URL}/tasks`),
    ]);
    ...
  };
  loadData();
}, [user, API_URL]);
```
Хэрэглэгч нэвтрэх БҮРД (эсвэл сэргэх бүрд) энэ `useEffect` ажиллаж, backend-ээс **бүх өгөгдлийг нэг удаа** татаж React state-д хадгална. Дараа нь бүх хуудас (`DashboardPage`, `UsersPage`, гэх мэт) `useAppContext()` дуудаад шууд ашигладаг — тус тусдаа дахин fetch хийдэггүй.

Context дотор `addUser`, `deleteUser`, `resetPassword`, `toggleProjectUser`, `assignJobTitle`, `addProject`, `deleteProject`, `addTimeLog`, `deleteTimeLog` гэх мэт функцууд бий — эдгээр нь бүгд **ижил хэв маягтай**: (1) backend руу fetch илгээх → (2) амжилттай бол local state-г шинэчлэх (дахин бүх өгөгдлийг дахин татахгүйгээр, зөвхөн шинэчлэгдсэн хэсгийг) → (3) `showNotify(...)`-аар мессеж харуулах.

### 5.4 Layout-ууд

**`Layout.jsx`** (admin/manager) — зүүн талд sidebar (навигацийн цэс), дээд талд header (өнөөдрийн огноо + Admin badge + Гарах товч), голд хуудасны агуулга (`<Outlet />`).

```jsx
<main className="flex-1 overflow-auto p-6">
  <div className="animate-fade-in">
    <Outlet />
  </div>
</main>
```
> ⚠️ **Чухал бас**: энд өмнө нь `animate-slide-up` ашигладаг байсан бөгөөд энэ нь `transform` CSS property ашигладаг animation тул (`fill-mode: both`-ийн улмаас animation дуусаад ч `transform` хэвээр үлддэг) — **дотор нь байгаа бүх `position: fixed` модалуудын containing block-ыг viewport-ээс энэ div рүү өөрчилдөг байсан**. Ингэснээр Task модал зэрэг бүх fixed модал дэлгэцийн төвд биш, харин энэ жижиг div-ийн хэмжээгээр хавчигдаж байрладаг байсан. `animate-fade-in` (зөвхөн opacity, transform ашигладаггүй) болгож сольсноор засагдсан.

**`ClientLayout.jsx`** (энгийн "user" эрх) — дээд талд навбар (лого, "Нүүр хуудас", "Профайл", "Гарах"), доор нь агуулга. Илүү энгийн, sidebar байхгүй.

### 5.5 Components

**`UI.jsx`** — систем даяар дахин ашиглагддаг жижиг блокууд:
- `Avatar` — нэрнээс эхний үсгүүдийг гаргаж, өнгийг **автоматаар** (5 өнгийн палитраас дараалан) оноодог
- `Modal` — стандарт popup цонх (гарчиг + агуулга + Цуцлах/Хадгалах товч)
- `ConfirmModal` — устгах гэх мэт эргэлт буцалтгүй үйлдлийн баталгаажуулах цонх
- `Toast` — баруун дээд буланд гарч ирдэг амжилтын мессеж
- `StatusBadge`, `FormGroup`, `EmptyState`, `Spinner` — жижиг туслах компонентууд

**`Hero3D.jsx`** — Landing/Login хуудасны баруун талд харагддаг 3D анимэйшн. Three.js-ийн `MeshDistortMaterial`-тай бөмбөрцөг + эргэлдэж буй 3 цагираг + одтой сансрын дэвсгэр. Хулганы байрлалаас хамааран камер бага зэрэг хөдөлдөг (`Rig` компонент).

**`ProgressBar.jsx`** — Task-ийн "зарцуулсан цаг / төлөвлөсөн цаг" харьцааг хувиар (%) харуулах жижиг компонент. Дундаж, эсвэл дуусах шатандаа байгаагаас хамааран өнгө өөрчлөгддөг (шар → индиго → ногоон).

### 5.6 Pages (гол хуудсууд)

**`LoginPage.jsx`** — Landing + нэвтрэх хуудас нэг дор. Дээд хэсэгт 3D hero, "Онцлог" хэсэгт системийн боломжуудыг харуулна, доод хэсэгт бодит нэвтрэх форм (username + password) байна. `useAuth().login(username, password)`-г дуудаж, алдаа гарвал улаан анхааруулга харуулна.

**`DashboardPage.jsx`** — Admin/Manager-ийн нүүр хуудас:
- 4 статистик карт: Нийт хэрэглэгчид, Идэвхтэй төслүүд, 7 хоногийн цаг, **Дундаж явц** (бүх task-уудын дундаж гүйцэтгэлийн хувь)
- "Системийн нийт ажлуудын явц" хүснэгт — task бүрийн `ProgressBar`-тай
- `loggedMap` гэдэг `useMemo` нь task бүрийн **бодит зарцуулсан цагийг** тооцоолдог: тухайн task-ийн project + assignedUser-тэй ТААРЧ буй бүх TimeLog-уудын цагийг нэмнэ (учир нь Task өөрөө "хэдэн цаг зарцуулсан" гэдгийг шууд хадгалдаггүй)

**`UsersPage.jsx`** — 2 таб бүхий хуудас:
- **Хэрэглэгчид таб**: хэрэглэгчийн жагсаалт, ажлын төрөл оноох, нууц үг солих, устгах, шинэ хэрэглэгч нэмэх
- **Төслүүд таб**: төслийн жагсаалт, шинэ төсөл нэмэх, ажилтан хуваарилах (`toggleProjectUser`)
- `ActionMenu` гэдэг дотоод компонент нь "•••" дарахад гарч ирдэг цэсийг **найдвартай** гадуур-товших-үед-хаах логиктой хийдэг (`useClickOutside` hook — `document`-д `mousedown` listener түр хугацаанд нэмж, цэснээс гадуур товшихыг илрүүлнэ)

**`TasksPage.jsx`** — Бүх Task-ийн хүснэгт (шүүлтүүртэй: төсөл/ажилтан/төлөвөөр), `ProgressBar` баганатай. `TaskModal` дотоод компонент нь Task үүсгэх/засах форм — Task нэр, Тайлбар, Төсөл, Est. цаг, Огнооны 2 талбар, Priority/Status (өнгөт pill товчлуур хэлбэрээр), Assign engineer (radio жагсаалт).

**`TimeLogsPage.jsx`** — 7 хоногийн **matrix хүснэгт**: мөр бүр = нэг ажилтан, багана бүр = нэг өдөр (Даваа-Ням), нүд бүрт тухайн өдөр зарцуулсан цаг. `getMonday()` функц нь өгөгдсөн огнооноос тухайн долоо хоногийн Даваа гарагийг тооцдог (Даваагаас долоо хоног эхэлдэг гэж үзсэн).

**`ReportsPage.jsx`** — Тайлангийн хуудас: ажилтан/төслөөр шүүх, дэлгэрэнгүй хүснэгт, ажилтан бүрийн нэгтгэл, **CSV экспорт** (`exportCSV` функц нь өгөгдлийг CSV мөр болгож, `Blob`-оор файл татаж авдаг — сервер рүү хүсэлт явуулдаггүй, бүгд browser дээр л хийгддэг).

**`ProfilePage.jsx`** — Admin/Manager-ийн хувийн профайл: нийт бүртгэсэн цаг, 7 хоногийн цаг, хуваарилагдсан төслийн тоо, төсөл тус бүрт зарцуулсан цагийн харьцаа, сүүлийн бүртгэлүүдийн жагсаалт.

**`ClientHome.jsx`** — Энгийн "user" эрхтэй хэрэглэгчийн ӨДӨР ТУТМЫН цаг бүртгэх хуудас:
- 7 хоногийн огнооны сонголт (өнөөдрөөс ±3 хоног)
- Зөвхөн **өөрт нь хуваарилагдсан** төслүүдийг сонгох боломжтой (`GET /api/appdata/users/:id/projects`-ээс татна)
- Сонгосон төсөлд харьяалагдах Task-уудаас сонгож болно (сонговол тайлбар автоматаар бөглөгдөнө)
- Ажилласан цаг + тайлбар бичээд "Ажлын цаг бүртгүүлэх"

---

## 6. Нэвтрэлтийн урсгал (алхам алхмаар)

1. Хэрэглэгч `LoginPage`-д username/password бичээд "Нэвтрэх" дарна
2. `AuthContext.login()` → `POST /api/auth/login`
3. Backend: `authRoutes.js` → `User.findOne({username})` → `bcrypt.compare()` → зөв бол хэрэглэгчийн мэдээллийг буцаана
4. Frontend: `setUser(data)` + `localStorage.setItem("nccs_user", ...)`
5. `App.jsx`-ийн `"/"` route дахин render хийгдэж, `user` одоо байгаа тул `fallbackPath`-руу (`user.role === "user" ? "/home" : "/dashboard"`) шилжинэ
6. `AppContext`-ийн `useEffect([user])` ажиллаж, backend-ээс users/projects/tasks/timeLogs-г татна
7. Хуудас бэлэн боллоо

Гарахдаа (`logout()`): `setUser(null)` + `localStorage.removeItem("nccs_user")` — маш энгийн, серверт мэдэгдэх шаардлагагүй (session нь зөвхөн localStorage дээр байдаг, JWT/cookie ашигладаггүй).

---

## 7. Явцын хувь (Progress) тооцоолол

Энэ бол системийн хамгийн "logic"-той хэсэг тул тусад нь тайлбарлав. Task-д "хэдэн цаг зарцуулсан бэ" гэдэг **шууд багана байхгүй** — учир нь энэ нь тухайн Task-тай холбоотой TimeLog-уудаас **бодогддог**:

```js
const loggedMap = {};
tasks.forEach(t => {
  const hours = timeLogs
    .filter(l => l.projectId == t.projectId && l.userId == t.assignedUserId)
    .reduce((sum, l) => sum + Number(l.hours || l.hoursSpent || 0), 0);
  loggedMap[t.id] = hours;
});
```

Энэ логик нь: "энэ Task-д харгалзах ажилтан, ЯГ ЭНЭ ТӨСӨЛД бүртгэсэн бүх цагийг нэмээд, тэрийг Task-ийн зарцуулсан цаг гэж үзье" гэсэн **ойролцоо тооцоолол**. Учир нь TimeLog өөрөө аль Task-тай холбогдсон гэдгийг хадгалдаггүй (зөвхөн Project + User) — тиймээс нэг ажилтан нэг төсөлд ХОЁР Task хийж байгаа бол, хоёр Task ижил "зарцуулсан цаг" харуулна (энэ бол архитектурын хязгаарлалт, алдаа биш).

`ProgressBar` компонент дараа нь:
```js
pct = Math.min(Math.round((logged / estimated) * 100), 100)
```
—100%-иас хэтрэхгүйгээр хувь тооцоод, өнгөөр ялгаж харуулна.

---

## 8. Тайлбарлагдсан мэдэгдэж буй "хачирхалтай" зүйлс

Кодыг уншиж байхад анзаарагдах, гэхдээ алдаа биш зүйлс:

1. **`LandingPage.jsx`** — `LoginPage.jsx`-тэй бараг ижилхэн хуучин хувилбар, ГЭХДЭЭ ямар ч route-д холбогдоогүй (хэрэглэгдэхгүй "үхсэн" код).
2. **`Footer.jsx`** — `ClientHome.jsx`-д import хийгдсэн ч хаана ч `<Footer />` гэж render хийгдээгүй.
3. **`webhookRoutes.js`** — Clerk auth-тай холбоотой хуучин код, системд Clerk байхгүй болсон тул дуудагдахгүй.
4. **`microsoftId` багана** — `User` model-д үлдсэн хуучин Microsoft login-ий үлдэгдэл, одоо ямар ч логикт ашиглагдахгүй.
5. **`/home` route давхцал** — дээр [5.2-т](#52-appjsx--routing-логик-хамгийн-чухал-файл) тайлбарласан.

Эдгээрийг устгах эсвэл цэвэрлэх шаардлагатай бол хэлээрэй — энэ баримт зөвхөн тайлбарлах зорилготой тул би өөрөө устгаагүй болно.

---

## 9. Файлын хурдан лавлах хүснэгт

| Асуулт | Хаана хайх вэ |
|---|---|
| Нэвтрэх/гарах логик хэрхэн ажилладаг вэ? | `src/context/AuthContext.jsx`, `backend/routes/authRoutes.js` |
| Аль хуудас хэнд харагдах вэ? | `src/App.jsx` |
| Өгөгдөл хаанаас ирдэг вэ? | `src/context/AppContext.jsx`, `backend/routes/appDataRoutes.js` |
| Task-ийн явц хэрхэн бодогддог вэ? | `src/pages/DashboardPage.jsx` (loggedMap), `src/components/ProgressBar.jsx` |
| Dark mode яагаад ажилладаггүй байсан бэ? | `tailwind.config.js` (`darkMode: "class"`) |
| Модал яагаад дэлгэцийн төвд биш байсан бэ? | `src/components/Layout.jsx` (animate-fade-in) |
| CSV тайлан хэрхэн үүсдэг вэ? | `src/pages/ReportsPage.jsx` (`exportCSV`) |
| Өгөгдлийн сангийн бүтэц | `backend/models/*.js` |
