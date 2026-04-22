const express = require('express')
const router = express.Router()
const { createUser, readAllUsers, readUserById, updateUser, deleteUser,   } = require('../controllers/usersController')

router.post('/', createUser)
router.get('/', readAllUsers)
router.get('/:id', readUserById)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router