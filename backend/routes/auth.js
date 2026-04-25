const express = require('express')
const router = express.Router()
const { register, login, forgotPassword, resetPassword, logout,   approveTeacher} = require('../controllers/authController')

// POST /api/auth/register      // cria conta nova
router.post('/register', register)

// POST /api/auth/login         // inicia sessão e devolve JWT em cookie
router.post('/login', login)

// POST /api/auth/forgot-password // envia email de recuperação
router.post('/forgot-password', forgotPassword)

// POST /api/auth/logout        //limpa o cookie e termina a sessão
router.post('/logout', logout)

router.post('/reset-password', resetPassword)


// GET  /api/auth/approve-teacher //chamado pela coordenação via link no email
router.get('/approve-teacher', approveTeacher)
module.exports = router
