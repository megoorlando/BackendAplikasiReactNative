const express = require('express')
const path = require('path')
const cors = require('cors')
const userLoginRoute = require('./src/routes/UserLoginRoute')
const burgerLogin = require('./src/routes/BurgerLogin')

//Piked
const LoginRouteP = require ('./src/routes/LoginRouteP')
const MainRoute = require('./src/routes/MainRoute')
const MyAccount = require('./src/routes/MyAccount')
const HomeRoute = require('./src/routes/HomeRoute')
const ChoiceRoute = require('./src/routes/ChoiceRoute')
const Transaction = require('./src/routes/Transaction')
const Rating = require('./src/routes/Rating')
const Item = require('./src/routes/Item')
const dotenv  = require('dotenv').config()

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())

app.use('/api/static',express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.send('Hallo dunia')
})

app.use('/api/userLogin', userLoginRoute)
app.use('/api/burgerLogin', burgerLogin)


//Piked
app.use ('/api/userLoginP',LoginRouteP)
app.use ('/api/MainRoute',MainRoute)
app.use('/api/MyAccount',MyAccount)
app.use('/api/HomeRoute',HomeRoute)
app.use('/api/ChoiceRoute',ChoiceRoute)
app.use('/api/Transaction',Transaction)
app.use('/api/Rating',Rating)
app.use('/api/Item',Item)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
