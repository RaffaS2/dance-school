const express = require('express')
const router = express.Router()
const { createStudioModality, readAllStudioModalities, readStudioModalitiesByStudio, deleteStudioModality } = require('../controllers/studioModalitiesController')

router.post('/', createStudioModality)
router.get('/', readAllStudioModalities)
router.get('/:id', readStudioModalitiesByStudio)
router.delete('/:id_studio/:id_modality', deleteStudioModality)

module.exports = router