const { sequelize } = require('../config/database');
const User = require('./User');
const Parking = require('./Parking');
const CarEntry = require('./CarEntry');

// Associations
Parking.hasMany(CarEntry, { foreignKey: 'parkingId', as: 'carEntries' });
CarEntry.belongsTo(Parking, { foreignKey: 'parkingId', as: 'parking' });

User.hasMany(CarEntry, { foreignKey: 'attendantId', as: 'carEntries' });
CarEntry.belongsTo(User, { foreignKey: 'attendantId', as: 'attendant' });

module.exports = { sequelize, User, Parking, CarEntry };
