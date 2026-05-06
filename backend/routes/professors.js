const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createProfessor, readAllProfessors, readProfessorById, updateProfessor, deleteProfessor } = require('../controllers/professorsController')
const { readAvailabilitiesByProfessor } = require('../controllers/availabilitiesController')

router.post('/',     authorize(1),       createProfessor)     
router.get('/',      authorize(1, 2, 3), readAllProfessors)   
router.get('/:id',   authorize(1, 2, 3), readProfessorById)   
router.put('/:id',   authorize(1),       updateProfessor)     
router.delete('/:id',authorize(1),       deleteProfessor)     
router.get('/:id_professor/availabilities', readAvailabilitiesByProfessor)

{/*}=======
const { createProfessor, readAllProfessors, readProfessorById, updateProfessor, deleteProfessor, } = require('../controllers/professorsController')
const { readAvailabilitiesByProfessor } = require('../controllers/availabilitiesController')

router.post('/', createProfessor)
router.get('/', readAllProfessors)
router.get('/:id', readProfessorById)
router.put('/:id', updateProfessor)
router.delete('/:id', deleteProfessor)
router.get('/:id_professor/availabilities', readAvailabilitiesByProfessor)
>>>>>>> rafa-branch*/}

module.exports = router