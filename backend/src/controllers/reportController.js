const { CarEntry, Parking, User, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const moment = require('moment');

// GET /api/reports/outgoing
// All outgoing cars with total amount charged between two datetimes
const getOutgoingReport = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return errorResponse(res, 'startDate and endDate are required.', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse(res, 'Invalid date format. Use ISO 8601 (e.g. 2024-01-01T00:00:00Z).', 400);
    }

    if (start >= end) {
      return errorResponse(res, 'startDate must be before endDate.', 400);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {
      status: 'exited',
      exitDateTime: { [Op.between]: [start, end] },
    };

    // Get paginated rows
    const { count, rows } = await CarEntry.findAndCountAll({
      where: whereClause,
      include: [
        { model: Parking, as: 'parking', attributes: ['name', 'location', 'code'] },
        { model: User, as: 'attendant', attributes: ['firstName', 'lastName'] },
      ],
      limit: limitNum,
      offset,
      order: [['exitDateTime', 'DESC']],
    });

    // Aggregate total amount across ALL matching records (not just current page)
    const totalAmountResult = await CarEntry.sum('chargedAmount', { where: whereClause });
    const totalAmount = parseFloat(totalAmountResult || 0);

    return res.status(200).json({
      success: true,
      message: 'Outgoing cars report generated.',
      data: rows,
      summary: {
        totalCars: count,
        totalAmountCharged: totalAmount.toFixed(2),
        period: {
          from: moment(start).format('YYYY-MM-DD HH:mm:ss'),
          to: moment(end).format('YYYY-MM-DD HH:mm:ss'),
        },
      },
      meta: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/entered
// All entered cars between two datetimes
const getEnteredReport = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return errorResponse(res, 'startDate and endDate are required.', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse(res, 'Invalid date format. Use ISO 8601 (e.g. 2024-01-01T00:00:00Z).', 400);
    }

    if (start >= end) {
      return errorResponse(res, 'startDate must be before endDate.', 400);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {
      entryDateTime: { [Op.between]: [start, end] },
    };

    const { count, rows } = await CarEntry.findAndCountAll({
      where: whereClause,
      include: [
        { model: Parking, as: 'parking', attributes: ['name', 'location', 'code'] },
        { model: User, as: 'attendant', attributes: ['firstName', 'lastName'] },
      ],
      limit: limitNum,
      offset,
      order: [['entryDateTime', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Entered cars report generated.',
      data: rows,
      summary: {
        totalCars: count,
        period: {
          from: moment(start).format('YYYY-MM-DD HH:mm:ss'),
          to: moment(end).format('YYYY-MM-DD HH:mm:ss'),
        },
      },
      meta: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/dashboard
// Summary statistics for the dashboard
const getDashboard = async (req, res, next) => {
  try {
    const totalParkings = await Parking.count({ where: { isActive: true } });
    const totalCarsParked = await CarEntry.count({ where: { status: 'parked' } });
    const totalCarsExited = await CarEntry.count({ where: { status: 'exited' } });

    const today = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();

    const todayEntries = await CarEntry.count({
      where: { entryDateTime: { [Op.between]: [today, todayEnd] } },
    });

    const todayRevenue = await CarEntry.sum('chargedAmount', {
      where: {
        status: 'exited',
        exitDateTime: { [Op.between]: [today, todayEnd] },
      },
    });

    const totalRevenue = await CarEntry.sum('chargedAmount', {
      where: { status: 'exited' },
    });

    const parkings = await Parking.findAll({
      where: { isActive: true },
      attributes: ['id', 'code', 'name', 'totalSpaces', 'availableSpaces', 'location', 'chargingFeePerHour'],
      order: [['name', 'ASC']],
    });

    return successResponse(res, 'Dashboard data retrieved.', {
      totalParkings,
      totalCarsParked,
      totalCarsExited,
      todayEntries,
      todayRevenue: parseFloat(todayRevenue || 0).toFixed(2),
      totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
      parkings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOutgoingReport, getEnteredReport, getDashboard };
