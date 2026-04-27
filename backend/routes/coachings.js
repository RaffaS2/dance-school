const express = require('express')
const router = express.Router()
const {
	createCoaching,
	readAllCoachings,
	readCoachingById,
	readCoachingsByProfessor,
	readCoachingsByGuardian,
	updateCoaching,
	deleteCoaching,
} = require('../controllers/coachingsController')

router.post('/', createCoaching)
router.get('/', readAllCoachings)
router.get('/professor/:id_professor', readCoachingsByProfessor) 
router.get('/guardian/:id_user', readCoachingsByGuardian) 
router.get('/:id', readCoachingById)
router.put('/:id', updateCoaching)
router.delete('/:id', deleteCoaching)

module.exports = router