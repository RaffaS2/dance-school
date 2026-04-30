const express = require('express')
const router = express.Router()
const authorize = require('./authorize')

const { createCoaching, readAllCoachings, readCoachingById, readCoachingsByProfessor, readCoachingsByGuardian, updateCoaching, deleteCoaching,
} = require('../controllers/coachingsController')

{/*<<<<<<< HEAD
router.post('/',     authorize(1, 2),    createCoaching)      
router.get('/',      authorize(1, 2, 3), readAllCoachings)    
router.get('/:id',   authorize(1, 2, 3), readCoachingById)    
router.put('/:id',   authorize(1, 2),    updateCoaching)      
router.delete('/:id',authorize(1),       deleteCoaching)      
=======*/}
router.post('/', createCoaching)
router.get('/', readAllCoachings)
router.get('/professor/:id_professor', readCoachingsByProfessor) 
router.get('/guardian/:id_user', readCoachingsByGuardian) 
router.get('/:id', readCoachingById)
router.put('/:id', updateCoaching)
router.delete('/:id', deleteCoaching)
{/*>>>>>>> origin/Nuno-branch*/}

module.exports = router
