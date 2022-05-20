const path = require('path')
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'), { foreginKeySuffix: 'id' })
const middlewares = jsonServer.defaults({ bodyParser: true })
const constants = require('./constants')


server.db = router.db

server.use(jsonServer.bodyParser)

server.post('/registration', (req, res, next) => {
  const { db } = req.app
  const {password, email} = req.body
  const isSameMail = db.get('users').find({email}).value()

  if(isSameMail) {
    return res.status(200).jsonp({mailMessage: 'Email is already in use'})
  }
  if(!email) {
    return res.status(200).jsonp({mailMessage: 'Email is empty'})
  }
  if (!email.match(constants.correctEmail)) {
    return res.status(200).jsonp({mailMessage: 'Incorrect email'})
  }
  if(!password) {
    return res.status(200).jsonp({passwordMessage: 'Password is empty'})
  }
  if(password.length < 8) {
    return res.status(200).jsonp({passwordMessage: 'Password must be more than 8 characters'})
  }
  if(!password.match(constants.correctPassword)) {
    return res.status(200).jsonp({passwordMessage: 'Incorrect password'})
  }

  const dbCopy = JSON.parse(JSON.stringify(db))
  const userId = dbCopy.users.length + 1

  req.body.id = userId

  db.get('users').push(req.body).write()
  // return res.status(200).jsonp(db)
  next()
})

server.post('/login', (req, res, next) => {
  const { db } = req.app
  const {password, email} = req.body

  const isCorrectData = db.get('users').find({email, password}).value()

  if (isCorrectData) {
    return res.status(200).jsonp({successMessage: 'Login is successed'})
  } else {
    return res.status(200).jsonp({errorMessage: 'Email or password arent correct'})
  }
})

server.use(middlewares)

server.use(router)

server.listen(3000, () => {
  console.log('JSON Server is running\nhttp://localhost:3000/')
})