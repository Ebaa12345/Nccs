const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  // ✅ ШИНЭ талбарууд — UsersPage дотор client, contractNo ашигладаг
  client: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  contractNo: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Идэвхтэй',
  },
}, {
  timestamps: true,
});

module.exports = Project;
