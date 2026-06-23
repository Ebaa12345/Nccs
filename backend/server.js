const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const User    = require('./models/User');
const Project = require('./models/Project');
const TimeLog = require('./models/TimeLog');
const Task    = require('./models/Task');

// Associations
TimeLog.belongsTo(User,    { foreignKey: 'userId',         onDelete: 'CASCADE' });
TimeLog.belongsTo(Project, { foreignKey: 'projectId',      onDelete: 'CASCADE' });
Task.belongsTo(Project,    { foreignKey: 'projectId',      onDelete: 'CASCADE' });
Task.belongsTo(User,       { foreignKey: 'assignedUserId', onDelete: 'SET NULL', as: 'assignedUser' });

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',       (req, res) => res.json({ message: '✅ Server ажиллаж байна!' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/appdata', require('./routes/appDataRoutes'));
app.use('/api/tasks',   require('./routes/taskRoutes'));
app.use('/api',         require('./routes/apiRoutes'));

app.use((req, res) => res.status(404).json({ error: `Route олдсонгүй: ${req.method} ${req.path}` }));
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Серверийн алдаа гарлаа.' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  // ✅ alter:true — Tasks хүснэгтэд startDate багана нэмнэ, бусад өгөгдөл хэвээр үлдэнэ
  await sequelize.sync({ alter: true });
  console.log('✅ MySQL хүснэгтүүд синхрончлогдлоо (startDate нэмэгдлээ).');
  app.listen(PORT, () => console.log(`✅ Сервер http://localhost:${PORT} дээр ажиллаж байна.`));
};

startServer().catch((error) => {
  console.error('🛑 Сервер эхлүүлэхэд алдаа:', error.message);
  process.exit(1);
});