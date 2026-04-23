const express = require('express')
const router = express.Router()
const { createCategory, readAllCategories, readCategoryById, updateCategory, deleteCategory } = require('../controllers/categoriesController')

router.post('/', createCategory)
router.get('/', readAllCategories)
router.get('/:id', readCategoryById)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

module.exports = router