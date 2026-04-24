const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createStudio, readAllStudios, readStudioById, updateStudio, deleteStudio } = require('../controllers/studiosController')

router.post('/',     authorize(1),       createStudio)        
router.get('/',      authorize(1, 2, 3), readAllStudios)      
router.get('/:id',   authorize(1, 2, 3), readStudioById)      
router.put('/:id',   authorize(1),       updateStudio)        
router.delete('/:id',authorize(1),       deleteStudio)        

module.exports = router
