const express = require('express')
const router = express.Router()
const authorize = require('../middleware/authorize')
const { createStudioModality, readAllStudioModalities, readStudioModalitiesByStudio, deleteStudioModality } = require('../controllers/studioModalitiesController')

router.post('/',                          authorize(1),       createStudioModality)             
router.get('/',                           authorize(1, 2, 3), readAllStudioModalities)           
router.get('/:id',                        authorize(1, 2, 3), readStudioModalitiesByStudio)      
router.delete('/:id_studio/:id_modality', authorize(1),       deleteStudioModality)              

module.exports = router