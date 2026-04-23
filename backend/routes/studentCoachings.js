const express = require('express')
const router = express.Router()
const { createStudentCoaching, readAllStudentCoachings, readStudentCoachingsByStudent, deleteStudentCoaching } = require('../controllers/studentCoachingsController')

router.post('/', createStudentCoaching)
router.get('/', readAllStudentCoachings)
router.get('/:id', readStudentCoachingsByStudent)
router.delete('/:id_student/:id_coaching', deleteStudentCoaching)

module.exports = router