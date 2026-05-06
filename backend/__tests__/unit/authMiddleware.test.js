const jwt = require('jsonwebtoken')
const authMiddleware = require('../../middleware/authMiddleware')

const SECRET = 'test-secret'

beforeEach(() => {
  process.env.JWT_SECRET = SECRET
})

// Cria objetos falsos que imitam o req, res e next do Express
function createMocks(token) {
  // simula o REQ do Express
  let req
  if (token) {
    req = { cookies: { token: token } }
  } else {
    req = { cookies: {} }
  }

  // simula o RES do Express
  // mockReturnThis() permite encadear: res.status(401).json({...})
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  }

  // simula o NEXT do Express (função que passa para o próximo middleware/controller)
  const next = jest.fn()

  return { req, res, next }
}

// testes
describe('authMiddleware', () => {

  test('without cookie - 401', () => {
    const { req, res, next } = createMocks() // sem token

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('invalid token - 401', () => {
    const { req, res, next } = createMocks('invalid.token.here')

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('expired token - 401', () => {
    const expiredToken = jwt.sign({ id: 1 }, SECRET, { expiresIn: '0s' })
    const { req, res, next } = createMocks(expiredToken)

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('valid token - calls next() and stores user in req', () => {
    const invalidToken = jwt.sign({ id: 1, email: 'test@test.com' }, SECRET)
    const { req, res, next } = createMocks(invalidToken)

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()          
    expect(req.user.id).toBe(1)              
    expect(req.user.email).toBe('test@test.com')
  })

})