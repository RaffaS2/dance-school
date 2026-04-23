const express = require('express')
const router = express.Router()
const { createProfessorModality, readAllProfessorModalities, readProfessorModalitiesByProfessor, deleteProfessorModality } = require('../controllers/professorModalitiesController')

router.post('/', createProfessorModality)
router.get('/', readAllProfessorModalities)
router.get('/:id', readProfessorModalitiesByProfessor)
router.delete('/:id_professor/:id_modality', deleteProfessorModality)

module.exports = router