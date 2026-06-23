// 📁 routes/taskRoutes.js
const express = require('express');
const router  = express.Router();

// ✅ Models-г db.js-аас авна — давхар define хийхгүй
const { sequelize } = require('../config/db');
const Task    = require('../models/Task');
const User    = require('../models/User');
const Project = require('../models/Project');

const taskIncludes = [
  { model: Project, attributes: ['id', 'name', 'client'] },
  {
    model: User,
    as: 'assignedUser',
    attributes: ['id', 'username', 'displayName', 'firstName', 'lastName', 'jobTitle'],
  },
];

const formatTask = (t) => {
  const d = t.toJSON ? t.toJSON() : t;
  return {
    id:             d.id,
    title:          d.title,
    description:    d.description,
    estimatedHours: d.estimatedHours,
    startDate:      d.startDate,
    dueDate:        d.dueDate,
    priority:       d.priority,
    status:         d.status,
    projectId:      d.projectId,
    project:        d.Project ? { id: d.Project.id, name: d.Project.name, client: d.Project.client } : null,
    assignedUserId: d.assignedUserId,
    engineer:       d.assignedUser
      ? {
          id:          d.assignedUser.id,
          username:    d.assignedUser.username,
          displayName: d.assignedUser.displayName,
          firstName:   d.assignedUser.firstName,
          lastName:    d.assignedUser.lastName,
          jobTitle:    d.assignedUser.jobTitle,
        }
      : null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
};

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: taskIncludes,
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks.map(formatTask));
  } catch (err) {
    console.error('Tasks GET алдаа:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: taskIncludes });
    if (!task) return res.status(404).json({ error: 'Task олдсонгүй' });
    res.json(formatTask(task));
  } catch (err) {
    console.error('Task GET/:id алдаа:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const {
      title, description, projectId, assignedUserId,
      estimatedHours, startDate, dueDate, priority, status,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Гарчиг заавал шаардлагатай' });
    if (!projectId)     return res.status(400).json({ error: 'Төсөл заавал шаардлагатай' });

    const task = await Task.create({
      title:          title.trim(),
      description:    description || '',
      projectId:      Number(projectId),
      assignedUserId: assignedUserId ? Number(assignedUserId) : null,
      estimatedHours: Number(estimatedHours) || 0,
      startDate:      startDate  || null,
      dueDate:        dueDate    || null,
      priority:       priority   || 'Medium',
      status:         status     || 'In progress',
    });

    const full = await Task.findByPk(task.id, { include: taskIncludes });
    res.status(201).json(formatTask(full));
  } catch (err) {
    console.error('Task POST алдаа:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task олдсонгүй' });

    const fields = ['title', 'description', 'projectId', 'assignedUserId', 'estimatedHours', 'startDate', 'dueDate', 'priority', 'status'];
    const updates = {};
    fields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (updates.projectId)      updates.projectId      = Number(updates.projectId);
    if (updates.assignedUserId) updates.assignedUserId = Number(updates.assignedUserId);
    if (updates.estimatedHours) updates.estimatedHours = Number(updates.estimatedHours);

    await task.update(updates);
    const full = await Task.findByPk(task.id, { include: taskIncludes });
    res.json(formatTask(full));
  } catch (err) {
    console.error('Task PUT алдаа:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Task олдсонгүй' });
    res.json({ success: true });
  } catch (err) {
    console.error('Task DELETE алдаа:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;