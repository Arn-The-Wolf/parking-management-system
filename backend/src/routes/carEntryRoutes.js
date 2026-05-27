const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerEntry, registerExit, getAllEntries, getEntryById } = require('../controllers/carEntryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Car Entries
 *   description: Car entry and exit management
 */

/**
 * @swagger
 * /api/car-entries:
 *   post:
 *     summary: Register car entry (generates ticket)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plateNumber, parkingCode]
 *             properties:
 *               plateNumber:
 *                 type: string
 *                 example: RAB 123 A
 *               parkingCode:
 *                 type: string
 *                 example: PKG-001
 *     responses:
 *       201:
 *         description: Car entry registered, ticket generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/CarEntry'
 *                     ticket:
 *                       type: object
 *       400:
 *         description: No available spaces
 *       409:
 *         description: Vehicle already parked
 */
router.post(
  '/',
  authenticate,
  [
    body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
    body('parkingCode').trim().notEmpty().withMessage('Parking code is required'),
  ],
  validate,
  registerEntry
);

/**
 * @swagger
 * /api/car-entries/{id}/exit:
 *   put:
 *     summary: Register car exit (generates bill)
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car entry ID
 *     responses:
 *       200:
 *         description: Car exit registered, bill generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     entry:
 *                       $ref: '#/components/schemas/CarEntry'
 *                     bill:
 *                       type: object
 *                       properties:
 *                         duration:
 *                           type: string
 *                         durationHours:
 *                           type: string
 *                         totalCharged:
 *                           type: number
 *       400:
 *         description: Car already exited
 *       404:
 *         description: Entry not found
 */
router.put('/:id/exit', authenticate, registerExit);

/**
 * @swagger
 * /api/car-entries:
 *   get:
 *     summary: Get all car entries with pagination
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [parked, exited]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of car entries
 */
router.get('/', authenticate, getAllEntries);

/**
 * @swagger
 * /api/car-entries/{id}:
 *   get:
 *     summary: Get car entry by ID
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car entry details
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, getEntryById);

module.exports = router;
