const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Parking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           example: "PKG-001"
 *         name:
 *           type: string
 *           example: "City Center Parking"
 *         totalSpaces:
 *           type: integer
 *           example: 100
 *         availableSpaces:
 *           type: integer
 *           example: 75
 *         location:
 *           type: string
 *           example: "Kigali, Rwanda"
 *         chargingFeePerHour:
 *           type: number
 *           format: float
 *           example: 500
 *         isActive:
 *           type: boolean
 */
const Parking = sequelize.define('Parking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true },
  },
  totalSpaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  availableSpaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },
  location: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: { notEmpty: true },
  },
  chargingFeePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'parkings',
  timestamps: true,
});

module.exports = Parking;
