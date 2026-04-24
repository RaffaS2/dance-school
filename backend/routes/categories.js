const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createCategory, readAllCategories, readCategoryById, updateCategory, deleteCategory } = require('../controllers/categoriesController')

router.post('/',     authorize(1),       createCategory)      
router.get('/',      authorize(1, 2, 3), readAllCategories)   
router.get('/:id',   authorize(1, 2, 3), readCategoryById)    
router.put('/:id',   authorize(1),       updateCategory)      
router.delete('/:id',authorize(1),       deleteCategory)      

module.exports = router