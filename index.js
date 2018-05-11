var express = require('express')
var db = require('mongoose')
var app = express()
var appRoutes = require('./routes')
var UserModel  = require('./models/user')
var User = UserModel.user
const port = 3000

var connectedDb = db.connect('mongodb://localhost/REIMBURSE_DB')

appRoutes(app, connectedDb)
app.listen(port)
console.log('Server is now running on:', port)

/**
 * var auser = new User({
  _id: new db.Types.ObjectId(),
  name: 'Michael Sohl',
  email: 'micso@sylog.se',
  expenses: [{date: new Date(), price: 0.87, km: 100, routeDescr: 'Träffade kund i Stockholm'},
{date: new Date(), price: 0.87, km: 505, routeDescr: 'Träffade kund i Stockholm'},{date: new Date(), price: 1.12, km: 400, routeDescr: 'Träffade kund i Stockholm'},
{date: new Date(), price: 0.84, km: 490, routeDescr: 'Träffade kund i Stockholm'},{date: new Date(), price: 0.87, km: 500, routeDescr: 'Träffade kund i Stockholm'}]
 auser.save((error) => { 
  if (error) console.log('error:', error)})
 */