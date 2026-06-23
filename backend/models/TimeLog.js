const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Project = require('./Project');

const TimeLog = sequelize.define('TimeLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taskDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  hoursSpent: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  logDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Хүснэгт хоорондын хамаарлыг зааж өгөх (Relationships)
TimeLog.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
TimeLog.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });

module.exports = TimeLog;