const express = require('express');
const router = express.Router();
const logincontroller = require('../controllers/login.controller.js');
const authMiddleware = require('../middleware/auth');

router.post('/login', logincontroller.getLoginUser);
router.get('/sidemenu', authMiddleware.verifyToken,logincontroller.getSideMenus);


module.exports = router;