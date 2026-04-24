const express = require('express')
const router = express.Router()
const authorize = require('../middleware/authorize')
const { createProfessor, readAllProfessors, readProfessorById, updateProfessor, deleteProfessor } = require('../controllers/professorsController')

router.post('/',     authorize(1),       createProfessor)     
router.get('/',      authorize(1, 2, 3), readAllProfessors)   
router.get('/:id',   authorize(1, 2, 3), readProfessorById)   
router.put('/:id',   authorize(1),       updateProfessor)     
router.delete('/:id',authorize(1),       deleteProfessor)     

module.exports = router