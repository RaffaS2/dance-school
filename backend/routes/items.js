const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createItem, readAllItems, readItemById, updateItem, deleteItem } = require('../controllers/itemsController')

router.post('/',     authorize(1, 2, 3), createItem)         
router.get('/',      authorize(1, 2, 3), readAllItems)        
router.get('/:id',   authorize(1, 2, 3), readItemById)        
router.put('/:id',   authorize(1, 2, 3), updateItem)          
router.delete('/:id',authorize(1, 2, 3), deleteItem)          

module.exports = router