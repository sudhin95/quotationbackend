const express = require('express');
const router = express.Router();
const clientscontroller = require('../controllers/clients.controller.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware.verifyToken,clientscontroller.getAllClients);
router.get('/:id', authMiddleware.verifyToken,clientscontroller.getClientsById);
router.post('/', authMiddleware.verifyToken,clientscontroller.addClients);
router.put('/:id', authMiddleware.verifyToken,clientscontroller.updateClients);
router.delete('/:id', authMiddleware.verifyToken,clientscontroller.deleteClients);




module.exports = router;