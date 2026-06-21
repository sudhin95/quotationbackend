const express = require('express');
const router = express.Router();
const logincontroller = require('../controllers/login.controller.js');
const authMiddleware = require('../middleware/auth');

router.post('/login', logincontroller.getLoginUser);
router.post('/register', logincontroller.getRegisterUser);

router.get('/sidemenu', authMiddleware.verifyToken,logincontroller.getSideMenus);


module.exports = router;