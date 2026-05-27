const { CarEntry, Parking, User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { sendBillEmail, sendEntryEmail } = require('../utils/mailer');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const moment = require('moment');

// POST /api/car-entries  - Register car entry
const registerEntry = async (req, res, next) => {
  try {
    const { plateNumber, parkingCode } = req.body;

    const parking = await Parking.findOne({ where: { code: parkingCode, isActive: true } });
    if (!parking) return errorResponse(res, 'Parking not found or inactive.', 404);

    if (parking.availableSpaces <= 0) {
      return errorResponse(res, 'No available spaces in this parking.', 400);
    }

    // Check if car is already parked
    const existing = await CarEntry.findOne({
      where: { plateNumber, status: 'parked' },
    });
    if (existing) {
      return errorResponse(res, 'This vehicle is already parked.', 409);
    }

    const entry = await CarEntry.create({
      plateNumber: plateNumber.toUpperCase(),
      parkingCode,
      parkingId: parking.id,
      entryDateTime: new Date(),
      exitDateTime: null,
      chargedAmount: 0,
      status: 'parked',
      attendantId: req.user.id,
    });

    // Decrease available spaces
    await parking.update({ availableSpaces: parking.availableSpaces - 1 });

    logger.info(`Car entry: ${plateNumber} at ${parkingCode}`);

    // Generate ticket
    const ticket = {
      ticketId: entry.id,
      plateNumber: entry.plateNumber,
      parkingName: parking.name,
      parkingCode: parking.code,
      location: parking.location,
      entryDateTime: moment(entry.entryDateTime).format('YYYY-MM-DD HH:mm:ss'),
      chargingFeePerHour: parking.chargingFeePerHour,
      attendant: `${req.user.firstName} ${req.user.lastName}`,
    };

    // Send entry notification email to the attendant (non-blocking)
    sendEntryEmail({ email: req.user.email, ticket });

    return successResponse(res, 'Car entry registered. Ticket generated.', { entry, ticket }, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/car-entries/:id/exit  - Register car exit
const registerExit = async (req, res, next) => {
  try {
    const entry = await CarEntry.findByPk(req.params.id, {
      include: [{ model: Parking, as: 'parking' }],
    });

    if (!entry) return errorResponse(res, 'Car entry not found.', 404);
    if (entry.status === 'exited') return errorResponse(res, 'Car has already exited.', 400);

    const exitDateTime = new Date();
    const entryDateTime = new Date(entry.entryDateTime);

    // Calculate duration in hours
    const durationMs = exitDateTime - entryDateTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const chargedAmount = parseFloat((durationHours * parseFloat(entry.parking.chargingFeePerHour)).toFixed(2));

    await entry.update({ exitDateTime, chargedAmount, status: 'exited' });

    // Increase available spaces
    await entry.parking.update({
      availableSpaces: entry.parking.availableSpaces + 1,
    });

    logger.info(`Car exit: ${entry.plateNumber} from ${entry.parkingCode}, charged: ${chargedAmount}`);

    const durationFormatted = moment.duration(durationMs).humanize();

    const bill = {
      ticketId: entry.id,
      plateNumber: entry.plateNumber,
      parkingName: entry.parking.name,
      parkingCode: entry.parkingCode,
      location: entry.parking.location,
      entryDateTime: moment(entry.entryDateTime).format('YYYY-MM-DD HH:mm:ss'),
      exitDateTime: moment(exitDateTime).format('YYYY-MM-DD HH:mm:ss'),
      duration: durationFormatted,
      durationHours: durationHours.toFixed(2),
      chargingFeePerHour: entry.parking.chargingFeePerHour,
      totalCharged: chargedAmount,
    };

    // Send bill email to the attendant who registered the entry (non-blocking)
    if (entry.attendantId) {
      const attendant = await User.findByPk(entry.attendantId, { attributes: ['email'] });
      if (attendant) sendBillEmail({ email: attendant.email, bill });
    }

    return successResponse(res, 'Car exit registered. Bill generated.', { entry, bill });
  } catch (error) {
    next(error);
  }
};

// GET /api/car-entries
const getAllEntries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search || '';

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { plateNumber: { [Op.iLike]: `%${search}%` } },
        { parkingCode: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await CarEntry.findAndCountAll({
      where: whereClause,
      include: [
        { model: Parking, as: 'parking', attributes: ['name', 'location'] },
        { model: User, as: 'attendant', attributes: ['firstName', 'lastName', 'email'] },
      ],
      limit,
      offset,
      order: [['entryDateTime', 'DESC']],
    });

    return paginatedResponse(res, 'Car entries retrieved.', rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// GET /api/car-entries/:id
const getEntryById = async (req, res, next) => {
  try {
    const entry = await CarEntry.findByPk(req.params.id, {
      include: [
        { model: Parking, as: 'parking' },
        { model: User, as: 'attendant', attributes: ['firstName', 'lastName', 'email'] },
      ],
    });
    if (!entry) return errorResponse(res, 'Car entry not found.', 404);
    return successResponse(res, 'Car entry retrieved.', entry);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerEntry, registerExit, getAllEntries, getEntryById };
