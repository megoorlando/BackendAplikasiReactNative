var mysql = require('mysql')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'paipaypie',
  password: 'ahmad223',
  database: 'piked'
})

connection.connect((err)=>{
    if(err) console.log(err)

    console.log('Database Connected')
})

module.exports = connection