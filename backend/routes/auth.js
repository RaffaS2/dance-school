const express = require('express')
const router = express.Router()
const authorize = require('./authorize')
const authMiddleware = require('../middleware/authMiddleware')

const { register, login, forgotPassword, resetPassword, changePassword, logout, approveTeacher, me } = require('../controllers/authController')


router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/logout', logout)
router.get('/me', me)
router.post('/reset-password', resetPassword)
router.post('/change-password', authMiddleware, changePassword)
router.get('/approve-teacher', approveTeacher)
module.exports = router
