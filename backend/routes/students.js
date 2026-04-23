const express = require('express')
const router = express.Router()
const { createStudent, readAllStudents, readStudentById, updateStudent, deleteStudent } = require('../controllers/studentsController')

router.post('/', createStudent)
router.get('/', readAllStudents)
router.get('/:id', readStudentById)
router.put('/:id', updateStudent)
router.delete('/:id', deleteStudent)

module.exports = router