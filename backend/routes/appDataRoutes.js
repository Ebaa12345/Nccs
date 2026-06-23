const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const TimeLog = require('../models/TimeLog');
const User = require('../models/User');

const DEFAULT_PROJECTS = [
  { id: 'p1', name: 'Дотоод болон Гадна төслийн хуралд оролцсон цаг', client: 'Дотоод', contractNo: '—' },
  { id: 'p2', name: 'Temporary work', client: 'Hatch', contractNo: 'SC001' },
  { id: 'p3', name: 'LDI Design review', client: 'Hatch', contractNo: 'SC001' },
  { id: 'p4', name: 'Manpower supply', client: 'Hatch', contractNo: 'SC0017' },
];

// ✅ Admin-аас оноох боломжтой стандарт ажлын төрлүүд
const JOB_TITLES = ["Architect", "Structural engineer", "HVAC engineer", "Piping engineer", "Electrical engineer", "Automation engineer","Communication engineer","Mechanical engineer"];;

// ==========================================
// USER SYNC
// ==========================================
router.post('/sync-user', async (req, res) => {
  try {
    const { clerkId, email, role } = req.body;
    const username = email || `clerk_${clerkId}`;

    const [user, created] = await User.findOrCreate({
      where: { username },
      defaults: { username, password: '', role: role || 'user' },
    });

    if (!created && role && user.role !== role) {
      await user.update({ role });
    }

    res.json({ success: true, user: { ...user.toJSON(), _id: user.id }, created });
  } catch (error) {
    console.error('sync-user алдаа:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// JOB TITLES — Боломжит ажлын төрлүүдийн жагсаалт
// ==========================================
router.get('/job-titles', (req, res) => {
  res.json(JOB_TITLES);
});

// ✅ ШИНЭ: Admin хэрэглэгчид ажлын төрөл оноох
router.put('/users/:id/job-title', async (req, res) => {
  try {
    const { jobTitle } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });

    await user.update({ jobTitle: jobTitle || '' });
    res.json({ success: true, user: { ...user.toJSON(), _id: user.id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// INIT
// ==========================================
router.get('/init', async (req, res) => {
  try {
    let [users, projects, timeLogs] = await Promise.all([
      User.findAll(),
      Project.findAll(),
      TimeLog.findAll({
        include: [
          { model: User, attributes: ['id', 'username', 'role', 'jobTitle'] },
          { model: Project, attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
      }),
    ]);

    if (projects.length === 0) {
      console.log('📁 Default төслүүд MySQL рүү нэмж байна...');
      await Project.bulkCreate(DEFAULT_PROJECTS, { ignoreDuplicates: true });
      projects = await Project.findAll();
    }

    const formattedUsers = users.map(u => {
      const data = u.toJSON();
      return { ...data, _id: data.id };
    });

    const formattedProjects = projects.map(p => {
      const data = p.toJSON();
      return { ...data, _id: data.id };
    });

    const formattedLogs = timeLogs.map(t => {
      const data = t.toJSON();
      return {
        _id: data.id,
        id: data.id,
        userId: data.userId,
        projectId: data.projectId,
        user: data.User ? data.User.username : 'Устсан хэрэглэгч',
        jobTitle: data.User ? data.User.jobTitle : '',
        project: data.Project ? data.Project.name : 'Устсан төсөл',
        desc: data.taskDescription,
        hours: data.hoursSpent,
        date: data.logDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    res.json({
      users: formattedUsers,
      projects: formattedProjects,
      timeLogs: formattedLogs
    });
  } catch (error) {
    console.error('INIT Route алдаа:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PROJECTS
// ==========================================
router.get('/projects', async (req, res) => {
  try {
    const list = await Project.findAll();
    res.json(list.map(p => ({ ...p.toJSON(), _id: p.id })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, description, client, contractNo, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Төслийн нэр заавал шаардлагатай' });

    const project = await Project.create({
      name,
      description: description || '',
      client: client || '',
      contractNo: contractNo || '—',
      status: status || 'Идэвхтэй',
    });

    res.status(201).json({ ...project.toJSON(), _id: project.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const deleted = await Project.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Төсөл олдсонгүй' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// USERS — assignedProjects удирдлага
// ==========================================
router.get('/users/:userId/projects', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });

    const assignedIds = user.assignedProjects ? JSON.parse(user.assignedProjects) : [];
    const projects = await Project.findAll({ where: { id: assignedIds } });

    res.json(projects.map(p => ({ ...p.toJSON(), _id: p.id })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:userId/projects', async (req, res) => {
  try {
    const { assignedProjects } = req.body;
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });

    await user.update({ assignedProjects: JSON.stringify(assignedProjects) });
    res.json({ success: true, assignedProjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TIME LOGS
// ==========================================
router.get('/timelogs', async (req, res) => {
  try {
    const logs = await TimeLog.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'role', 'jobTitle'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });

    const formattedLogs = logs.map(t => {
      const data = t.toJSON();
      return {
        _id: data.id,
        id: data.id,
        userId: data.userId,
        projectId: data.projectId,
        user: data.User ? data.User.username : 'Устсан хэрэглэгч',
        jobTitle: data.User ? data.User.jobTitle : '',
        project: data.Project ? data.Project.name : 'Устсан төсөл',
        desc: data.taskDescription,
        hours: data.hoursSpent,
        date: data.logDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/timelogs', async (req, res) => {
  try {
    const { userId, projectId, taskDescription, hoursSpent, logDate } = req.body;

    const finalDesc  = taskDescription || req.body.desc;
    const finalHours = hoursSpent || req.body.hours;
    const finalDate  = logDate || req.body.date;

    const log = await TimeLog.create({
      userId,
      projectId,
      taskDescription: finalDesc,
      hoursSpent: Number(finalHours),
      logDate: finalDate
    });

    const fullLog = await TimeLog.findByPk(log.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'role', 'jobTitle'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });

    const data = fullLog.toJSON();
    const formatted = {
      _id: data.id,
      id: data.id,
      userId: data.userId,
      projectId: data.projectId,
      user: data.User ? data.User.username : '',
      jobTitle: data.User ? data.User.jobTitle : '',
      project: data.Project ? data.Project.name : '',
      desc: data.taskDescription,
      hours: data.hoursSpent,
      date: data.logDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };

    res.status(201).json(formatted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/timelogs/:id', async (req, res) => {
  try {
    const deleted = await TimeLog.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Бүртгэл олдсонгүй' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
