const express = require('express')
const router = express.Router()
const { createAvailability, readAllAvailabilities, readAvailabilityById, readAvailabilitiesByProfessor, deleteAvailability } = require('../controllers/availabilitiesController')

router.post('/', createAvailability)
router.get('/', readAllAvailabilities)
router.get('/:id', readAvailabilityById)
router.delete('/:id', deleteAvailability)


/*
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)
*/

module.exports = router