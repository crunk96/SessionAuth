const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')

const TWO_HOURS = 1000 * 60 * 60 * 2

const {
  PORT = 10111,
  SESS_LIFETIME = TWO_HOURS,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = 'this is a default SECRET /?)Q',
} = process.env

const app = express()

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

const IN_PROD = NODE_ENV === 'production'

const users = [
  { id: 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret' },
  { id: 2, name: 'Max', email: 'max@gmail.com', password: 'secret' },
  { id: 3, name: 'Calvin', email: 'calvin@gmail.com', password: 'secret' },
]

app.use(
  session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: SESS_LIFETIME,
      sameSite: true,
      secure: IN_PROD,
    },
  }),
)

app.listen(PORT, function (err) {
  // console.log(`www.localhost:${PORT}`;
  if (err) console.log('Error in server setup')
  console.log('Server is listening on Port', PORT)
})

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login')
  } else {
    next()
  }
}

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home')
  } else {
    next()
  }
}

app.get('/', (req, res) => {
  const { userId } = req.session
  res.send(`
  <h1>Welcome!</h1>
  ${
    userId
      ? `
  <a href='/home'>Home</a>
  <form method='post' action='/logout'> 
    <button>Logout</button> 
  </form>
  `
      : `
  <a href='/login'>Login</a>
  <a href='/register'>Register</a>
  `
  }
  `)
})

app.get('/home', redirectLogin, (req, res) => {
  const user = users.find((user) => user.id === req.session.userId)
  res.send(`
  <h1>Home</h1>
  <a href='/'>Main</a>
  <ul>
    <li>Name: ${user.name}</li>
    <li>Email: ${user.email}</li>
  </ul>
  `)
})

app.get('/login', redirectHome, (req, res) => {
  res.send(`
  <h1>Login</h1>
  <form method='post' action='/login'>
    <input type='email' name='email' placeholder='Email' required/>
    <input type='password' name='password' placeholder='Password' required/>
    <input type='submit'/>
  </form>
  `)
})

app.get('/register', redirectHome, (req, res) => {
  res.send(`
  <h1>Register</h1>
  <form method='post' action='/register'>
    <input type='text' name='name' placeholder='Name' required/>  
    <input type='email' name='email' placeholder='Email' required/>
    <input type='password' name='password' placeholder='Password' required/>
    <input type='submit'/>
  </form>
  `)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

  if (email && password) {
    const user = users.find(
      (user) => user.email === email && user.password === password,
    )
    if (user) {
      req.session.userId = user.id
      return res.redirect('/home')
    } else {
      res.redirect('/login')
    }
  }
})

app.post('/register', redirectHome, (req, res) => {})

app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy()
  res.redirect('login')
})
