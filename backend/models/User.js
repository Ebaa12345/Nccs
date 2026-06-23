const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
  },
  microsoftId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // ✅ ШИНЭ: Azure AD-аас авсан овог, нэр
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // ✅ ШИНЭ: Admin-аас оноосон ажлын төрөл (Хөгжүүлэгч, Дизайнер г.м.)
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  assignedProjects: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
  },
}, {
  timestamps: true,
});

module.exports = User;
