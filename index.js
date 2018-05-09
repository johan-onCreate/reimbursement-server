var express = require('express')
var db = require('mongoose')
var app = express()
var appRoutes = require('./routes')
var UserModel  = require('./models/user')
var User = UserModel.user
const port = 3000

db.connect('mongodb://localhost/REIMBURSE_DB')

var auser = new User({
  _id: new db.Types.ObjectId(),
  name: 'Michael Sohl',
  email: 'micso@sylog.se'
})
auser.save((error) => { 
  if (error) console.log('error:', error)})

appRoutes(app)
app.listen(port)
console.log('Server is now running on:', port)
