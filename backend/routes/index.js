const express = require('express')
const router = express.Router()

router.use('/api/auth', require('./auth'))
router.use('/users', require('./users'))
router.use('/professors', require('./professors'))
router.use('/students', require('./students'))
router.use('/studios', require('./studios'))
router.use('/modalities', require('./modalities'))
router.use('/categories', require('./categories'))
router.use('/items', require('./items'))
router.use('/item-requests', require('./itemRequests'))
router.use('/coachings', require('./coachings'))
router.use('/invoices', require('./invoices'))
router.use('/professor-modalities', require('./professorModalities'))
router.use('/studio-modalities', require('./studioModalities'))
router.use('/student-coachings', require('./studentCoachings'))

module.exports = router
