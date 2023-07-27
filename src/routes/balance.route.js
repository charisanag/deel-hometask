const express = require('express');
const router = express.Router();
const {getProfile} = require('../middleware/getProfile');
const balanceController = require('../controllers/balance.controller')


router.post('/deposit/:userId', getProfile, balanceController.depositToClient);


module.exports = router;