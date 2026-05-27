const express = require('express');
const router = express.Router();
const { getOutgoingReport, getEnteredReport, getDashboard } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Parking reports and analytics
 */

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalParkings:
 *                   type: integer
 *                 totalCarsParked:
 *                   type: integer
 *                 totalCarsExited:
 *                   type: integer
 *                 todayEntries:
 *                   type: integer
 *                 todayRevenue:
 *                   type: string
 */
router.get('/dashboard', authenticate, getDashboard);

/**
 * @swagger
 * /api/reports/outgoing:
 *   get:
 *     summary: Report - All outgoing cars with total amount charged between two datetimes
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: "2024-12-31T23:59:59Z"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Outgoing cars report with total amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalCars:
 *                       type: integer
 *                     totalAmountCharged:
 *                       type: string
 */
router.get('/outgoing', authenticate, authorize('admin'), getOutgoingReport);

/**
 * @swagger
 * /api/reports/entered:
 *   get:
 *     summary: Report - All entered cars between two datetimes
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: "2024-12-31T23:59:59Z"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Entered cars report
 */
router.get('/entered', authenticate, authorize('admin'), getEnteredReport);

module.exports = router;
