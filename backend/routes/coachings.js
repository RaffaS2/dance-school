const express = require('express')
const router = express.Router()
const {
	createCoaching,
	readAllCoachings,
	readCoachingById,
	updateCoaching,
	deleteCoaching,
} = require('../controllers/coachingsController')

router.post('/', createCoaching)
router.get('/', readAllCoachings)
router.get('/:id', readCoachingById)
router.put('/:id', updateCoaching)
router.delete('/:id', deleteCoaching)

module.exports = router