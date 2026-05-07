const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createModality, readAllModalities, readModalityById, updateModality, deleteModality } = require('../controllers/modalitiesController')

router.post('/',     authorize(1),       createModality)      
router.get('/',      authorize(1, 2, 3), readAllModalities)  
router.get('/:id',   authorize(1, 2, 3), readModalityById)    
router.put('/:id',   authorize(1),       updateModality)      
router.delete('/:id',authorize(1),       deleteModality)      

module.exports = router