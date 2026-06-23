// 📁 models/Task.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  estimatedHours: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'In progress',
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assignedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// ✅ Association-г model дотор биш, server.js-д хийнэ
module.exports = Task;