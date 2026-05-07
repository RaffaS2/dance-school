const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const { createInvoice, readAllInvoices, readInvoiceById, updateInvoice, deleteInvoice } = require('../controllers/invoicesController')

router.post('/',     authorize(1),       createInvoice)       
router.get('/',      authorize(1, 2, 3), readAllInvoices)     
router.get('/:id',   authorize(1, 2, 3), readInvoiceById)    
router.put('/:id',   authorize(1),       updateInvoice)       
router.delete('/:id',authorize(1),       deleteInvoice)       

module.exports = router