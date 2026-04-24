const express = require('express')
const router = express.Router()
const { createItem, readAllItems, readItemById, updateItem, deleteItem } = require('../controllers/itemsController')

router.post('/', createItem)
router.get('/', readAllItems)
router.get('/:id', readItemById)
router.put('/:id', updateItem)
router.delete('/:id', deleteItem)

module.exports = router