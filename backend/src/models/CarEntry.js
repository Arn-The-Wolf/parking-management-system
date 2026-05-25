const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     CarEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         plateNumber:
 *           type: string
 *           example: "RAB 123 A"
 *         parkingCode:
 *           type: string
 *           example: "PKG-001"
 *         entryDateTime:
 *           type: string
 *           format: date-time
 *         exitDateTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         chargedAmount:
 *           type: number
 *           format: float
 *           example: 0
 *         status:
 *           type: string
 *           enum: [parked, exited]
 */
const CarEntry = sequelize.define('CarEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  plateNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { notEmpty: true },
  },
  parkingCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  parkingId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  entryDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  exitDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  chargedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM('parked', 'exited'),
    defaultValue: 'parked',
  },
  attendantId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'car_entries',
  timestamps: true,
});

module.exports = CarEntry;
