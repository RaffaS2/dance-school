const express = require('express')
const router = express.Router()
const { createInvoice, readAllInvoices, readInvoiceById, updateInvoice, deleteInvoice } = require('../controllers/invoicesController')

router.post('/', createInvoice)
router.get('/', readAllInvoices)
router.get('/:id', readInvoiceById)
router.put('/:id', updateInvoice)
router.delete('/:id', deleteInvoice)

module.exports = router