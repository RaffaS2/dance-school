const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createAvailability, readAllAvailabilities, readAvailabilityById, readAvailabilitiesByProfessor,deleteAvailability } = require('../controllers/availabilitiesController')

router.post('/',                                authorize(1, 2),    createAvailability)
router.get('/',                                 authorize(1, 2, 3), readAllAvailabilities)
router.get('/professor/:id_professor',          authorize(1, 2, 3), readAvailabilitiesByProfessor)
router.get('/:id',                              authorize(1, 2, 3), readAvailabilityById)
router.delete('/:id',                           authorize(1, 2),    deleteAvailability)

module.exports = router