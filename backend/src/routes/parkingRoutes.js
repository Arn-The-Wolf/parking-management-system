const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createParking, getAllParkings, getParkingById, updateParking, deleteParking,
} = require('../controllers/parkingController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Parking
 *   description: Parking space management
 */

/**
 * @swagger
 * /api/parkings:
 *   post:
 *     summary: Register a new parking (Admin only)
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, totalSpaces, location, chargingFeePerHour]
 *             properties:
 *               code:
 *                 type: string
 *                 example: PKG-001
 *               name:
 *                 type: string
 *                 example: City Center Parking
 *               totalSpaces:
 *                 type: integer
 *                 example: 100
 *               location:
 *                 type: string
 *                 example: Kigali, Rwanda
 *               chargingFeePerHour:
 *                 type: number
 *                 example: 500
 *     responses:
 *       201:
 *         description: Parking registered
 *       409:
 *         description: Code already exists
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('code').trim().notEmpty().withMessage('Parking code is required'),
    body('name').trim().notEmpty().withMessage('Parking name is required'),
    body('totalSpaces').isInt({ min: 1 }).withMessage('Total spaces must be a positive integer'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('chargingFeePerHour').isFloat({ min: 0 }).withMessage('Charging fee must be a positive number'),
  ],
  validate,
  createParking
);

/**
 * @swagger
 * /api/parkings:
 *   get:
 *     summary: Get all parkings
 *     tags: [Parking]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of parkings with pagination
 */
router.get('/', authenticate, getAllParkings);

/**
 * @swagger
 * /api/parkings/{id}:
 *   get:
 *     summary: Get parking by ID
 *     tags: [Parking]
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
 *         description: Parking details
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, getParkingById);

/**
 * @swagger
 * /api/parkings/{id}:
 *   put:
 *     summary: Update parking (Admin only)
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               chargingFeePerHour:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Parking updated
 */
router.put('/:id', authenticate, authorize('admin'), updateParking);

/**
 * @swagger
 * /api/parkings/{id}:
 *   delete:
 *     summary: Delete parking (Admin only)
 *     tags: [Parking]
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
 *         description: Parking deleted
 */
router.delete('/:id', authenticate, authorize('admin'), deleteParking);

module.exports = router;
