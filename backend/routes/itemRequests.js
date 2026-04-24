const express = require('express')
const router = express.Router()
const { createItemRequest, readAllItemRequests, readItemRequestById, updateItemRequest, deleteItemRequest } = require('../controllers/itemRequestsController')

router.post('/', createItemRequest)
router.get('/', readAllItemRequests)
router.get('/:id', readItemRequestById)
router.put('/:id', updateItemRequest)
router.delete('/:id', deleteItemRequest)

module.exports = router