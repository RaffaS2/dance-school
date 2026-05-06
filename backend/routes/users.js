const express = require('express')
const router = express.Router()
const authorize = require('./authorize') // Middleware de autorização para proteger as rotas
const { createUser, readAllUsers, readUserById, updateUser, deleteUser } = require('../controllers/usersController')

router.post('/',     authorize(1),       createUser)          
router.get('/',      authorize(1),       readAllUsers)        
router.get('/:id',   authorize(1, 2, 3), readUserById)        
router.put('/:id',   authorize(1),       updateUser)          
router.delete('/:id',authorize(1),       deleteUser)          

module.exports = router