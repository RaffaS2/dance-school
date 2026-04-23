const express = require('express')
const router = express.Router()
const { createStudio, readAllStudios, readStudioById, updateStudio, deleteStudio } = require('../controllers/studiosController')

router.post('/', createStudio)
router.get('/', readAllStudios)
router.get('/:id', readStudioById)
router.put('/:id', updateStudio)
router.delete('/:id', deleteStudio)

module.exports = router