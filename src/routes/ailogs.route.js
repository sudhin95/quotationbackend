const express = require('express');
const router = express.Router();
const ailogscontroller = require('../controllers/ailogs.controller.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware.verifyToken,ailogscontroller.getAllAILogs);

module.exports = router;