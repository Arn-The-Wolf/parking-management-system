const { Parking } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// POST /api/parkings
const createParking = async (req, res, next) => {
  try {
    const { code, name, totalSpaces, location, chargingFeePerHour } = req.body;

    const existing = await Parking.findOne({ where: { code } });
    if (existing) {
      return errorResponse(res, 'Parking code already exists.', 409);
    }

    const parking = await Parking.create({
      code,
      name,
      totalSpaces,
      availableSpaces: totalSpaces,
      location,
      chargingFeePerHour,
    });

    logger.info(`Parking created: ${code} - ${name}`);
    return successResponse(res, 'Parking registered successfully.', parking, 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/parkings
const getAllParkings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { code: { [Op.iLike]: `%${search}%` } },
            { location: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Parking.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return paginatedResponse(res, 'Parkings retrieved.', rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// GET /api/parkings/:id
const getParkingById = async (req, res, next) => {
  try {
    const parking = await Parking.findByPk(req.params.id);
    if (!parking) return errorResponse(res, 'Parking not found.', 404);
    return successResponse(res, 'Parking retrieved.', parking);
  } catch (error) {
    next(error);
  }
};

// PUT /api/parkings/:id
const updateParking = async (req, res, next) => {
  try {
    const parking = await Parking.findByPk(req.params.id);
    if (!parking) return errorResponse(res, 'Parking not found.', 404);

    const { name, location, chargingFeePerHour, isActive } = req.body;
    await parking.update({ name, location, chargingFeePerHour, isActive });

    logger.info(`Parking updated: ${parking.code}`);
    return successResponse(res, 'Parking updated successfully.', parking);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/parkings/:id
const deleteParking = async (req, res, next) => {
  try {
    const parking = await Parking.findByPk(req.params.id);
    if (!parking) return errorResponse(res, 'Parking not found.', 404);

    await parking.destroy();
    logger.info(`Parking deleted: ${parking.code}`);
    return successResponse(res, 'Parking deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createParking, getAllParkings, getParkingById, updateParking, deleteParking };
