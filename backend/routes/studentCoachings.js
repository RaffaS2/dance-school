const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createStudentCoaching, readAllStudentCoachings, readStudentCoachingsByStudent, deleteStudentCoaching } = require('../controllers/studentCoachingsController')

router.post('/',                           authorize(1, 2, 3), createStudentCoaching)           
router.get('/',                            authorize(1, 2),    readAllStudentCoachings)          
router.get('/:id',                         authorize(1, 2, 3), readStudentCoachingsByStudent)   
router.delete('/:id_student/:id_coaching', authorize(1, 2, 3), deleteStudentCoaching)           

module.exports = router