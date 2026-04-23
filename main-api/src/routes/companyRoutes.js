const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
// Aquí podríamos agregar un middleware de autenticación si fuera necesario
// const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', companyController.getAllCompanies);
router.get('/tree', companyController.getHierarchyTree);
router.get('/:id/sites', companyController.getCompanySites);

module.exports = router;
