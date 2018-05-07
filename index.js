var express = require('express')
var app = express()

var appRoutes = require('./routes')

const port = 3000
// respond with "hello world" when a GET request is made to the homepage

appRoutes(app)
app.listen(port)
console.log('Server is now running on:', port)
