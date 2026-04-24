const express = require('express')
const router = express.Router()
const { createProfessor, readAllProfessors, readProfessorById, updateProfessor, deleteProfessor, } = require('../controllers/professorsController')

router.post('/', createProfessor)
router.get('/', readAllProfessors)
router.get('/:id', readProfessorById)
router.put('/:id', updateProfessor)
router.delete('/:id', deleteProfessor)

module.exports = router