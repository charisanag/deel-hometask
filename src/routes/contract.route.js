const express = require('express');
const router = express.Router();
const {getProfile} = require('../middleware/getProfile');
const contractController = require('../controllers/contract.controller')


router.get('/:id', getProfile, contractController.getContractById);
router.get('/', getProfile, contractController.getContractsByProfile);

module.exports = router;