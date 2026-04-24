const express = require('express')
const router = express.Router()
const authorize = require('../middleware/authorize')
const { createProfessorModality, readAllProfessorModalities, readProfessorModalitiesByProfessor, deleteProfessorModality } = require('../controllers/professorModalitiesController')

router.post('/',                          authorize(1),       createProfessorModality)           
router.get('/',                           authorize(1, 2),    readAllProfessorModalities)         
router.get('/:id',                        authorize(1, 2),    readProfessorModalitiesByProfessor)  
router.delete('/:id_professor/:id_modality', authorize(1),   deleteProfessorModality)             

module.exports = router