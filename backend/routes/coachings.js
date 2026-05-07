const express = require('express')
const router = express.Router()
const authorize = require('./authorize')

const { createCoaching, readAllCoachings, readCoachingById, readCoachingsByProfessor, readCoachingsByGuardian, updateCoaching, deleteCoaching,
} = require('../controllers/coachingsController')

router.post('/',                        authorize(1, 2, 3),  createCoaching)           
router.get('/',                         authorize(1, 2, 3), readAllCoachings)          
router.get('/professor/:id_professor',  authorize(1, 2),    readCoachingsByProfessor)  
router.get('/guardian/:id_user',        authorize(1, 3),    readCoachingsByGuardian)   
router.get('/:id',                      authorize(1, 2, 3), readCoachingById)          
router.put('/:id',                      authorize(1, 2, 3),    updateCoaching)            
router.delete('/:id',                   authorize(1, 2, 3), deleteCoaching)  


module.exports = router
