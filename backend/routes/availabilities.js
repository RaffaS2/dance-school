const express = require('express')
const router = express.Router()
const { createAvailability, readAllAvailabilities, readAvailabilityById, readAvailabilitiesByProfessor } = require('../controllers/availabilitiesController')

router.post('/', createAvailability)
router.get('/', readAllAvailabilities)
router.get('/:id', readAvailabilityById)

/*
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)
*/

module.exports = router