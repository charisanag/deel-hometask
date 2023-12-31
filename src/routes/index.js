const express = require('express');
const router = express.Router()

router.use('/contracts', require('./contract.route'))
router.use('/jobs', require('./job.route'))
router.use('/balances', require('./balance.route'))
router.use('/admin',require('./admin.route'))

module.exports = router