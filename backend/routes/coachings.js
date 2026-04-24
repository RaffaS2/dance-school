const express = require('express')
const router = express.Router()
const authorize = require('../middleware/authorize')
const { createCoaching, readAllCoachings, readCoachingById, updateCoaching, deleteCoaching } = require('../controllers/coachingsController')

router.post('/',     authorize(1, 2),    createCoaching)      
router.get('/',      authorize(1, 2, 3), readAllCoachings)    
router.get('/:id',   authorize(1, 2, 3), readCoachingById)    
router.put('/:id',   authorize(1, 2),    updateCoaching)      
router.delete('/:id',authorize(1),       deleteCoaching)      

module.exports = router
