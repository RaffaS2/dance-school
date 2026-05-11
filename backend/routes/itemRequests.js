const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createItemRequest, readAllItemRequests, readItemRequestById, updateItemRequest, deleteItemRequest, getPendingReturns } = require('../controllers/itemRequestsController')

router.post('/',              authorize(1, 2, 3), createItemRequest)   
router.get('/pending-returns', authorize(1),       getPendingReturns)
router.get('/',               authorize(1, 2, 3), readAllItemRequests)  
router.get('/:id',            authorize(1, 2, 3), readItemRequestById)  
router.put('/:id',            authorize(1, 2, 3), updateItemRequest)    
router.delete('/:id',         authorize(1),       deleteItemRequest)    

module.exports = router