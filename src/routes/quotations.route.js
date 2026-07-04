const express = require('express');
const router = express.Router();
const quotationscontroller = require('../controllers/quotations.controller.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware.verifyToken,quotationscontroller.getAllQuotations);
router.post('/', authMiddleware.verifyToken,quotationscontroller.addQuotations);
router.put('/:id', authMiddleware.verifyToken,quotationscontroller.updateQuotations);
router.get('/:id', authMiddleware.verifyToken,quotationscontroller.getQuotationsById);
router.delete('/:id', authMiddleware.verifyToken,quotationscontroller.deleteQuotations);
router.post('/:id/items', authMiddleware.verifyToken,quotationscontroller.getAllQuotationItems);
router.post('/ai/quotation-draft',quotationscontroller.generateQuotationDraft);





module.exports = router;