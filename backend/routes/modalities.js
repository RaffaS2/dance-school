const express = require('express')
const router = express.Router()
const { createModality, readAllModalities, readModalityById, updateModality, deleteModality } = require('../controllers/modalitiesController')

router.post('/', createModality)
router.get('/', readAllModalities)
router.get('/:id', readModalityById)
router.put('/:id', updateModality)
router.delete('/:id', deleteModality)

module.exports = router