const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Solo usuarios logueados pueden acceder a estos endpoints
router.use(authMiddleware.protect);

// Endpoint para traer las empresas disponibles (filtradas por rol del usuario actual)
router.get('/empresas', userController.getEmpresas);

// Endpoint para crear usuarios (Solo Admin y SuperAdmin)
router.post('/', authMiddleware.authorizeRoles('Admin', 'SuperAdmin'), userController.createUser);

module.exports = router;
