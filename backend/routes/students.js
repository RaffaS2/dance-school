const express = require('express')
const router = express.Router()
const authorize = require('../middleware/authorize')
const { createStudent, readAllStudents, readStudentById, updateStudent, deleteStudent } = require('../controllers/studentsController')

router.post('/',     authorize(1),       createStudent)       
router.get('/',      authorize(1, 2),    readAllStudents)     
router.get('/:id',   authorize(1, 2, 3), readStudentById)     
router.put('/:id',   authorize(1),       updateStudent)       
router.delete('/:id',authorize(1),       deleteStudent)       

module.exports = router
