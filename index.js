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
 * 
var auser = new User({
  _id: new db.Types.ObjectId(),
  name: 'Michael Sohl',
  email: 'michael.sohl@sylog.se',
  admin: false,
  expenses: [{date: new Date('2018-04-16T11:16:36.858Z'), car_type: 'Own', km: 100, route_descr: 'Träffade kund på golfbanan i Jönköping', attest: true, client: 'Kund A'},
{date: new Date('2018-04-26T11:16:36.858Z'), car_type: 'Own', km: 505, route_descr: 'Träffade kund i Stockholm', attest: false, client: 'Kund A'},{date: new Date('2018-03-16T11:16:36.858Z'), car_type: 'comp_car_dies', km: 400, route_descr: 'Träffade kund i Köpenhamn', attest: true, client: 'Kund B'},
{date: new Date('2017-12-16T11:16:36.858Z'), car_type: 'comp_car_dies', km: 490, route_descr: 'Träffade kund i Stockholm', attest: false, client: 'Kund B'},{date: new Date('2018-01-10T11:16:36.858Z'), car_type: 'comp_car_gas', km: 500, route_descr: 'Malmö på kundträff', attest: false, client: 'Kund C'}]
})
 auser.save((error) => { 
  if (error) console.log('error:', error)})
 */
/**
 * var connectedDb = db.connect('mongodb://localhost/REIMBURSE_DB')
var auser = new User({
  _id: new db.Types.ObjectId(),
  name: 'Fredrik Landberg',
  email: 'fredrik.landberg@sylog.se',
  admin: true,
  expenses: []
})
 auser.save((error) => { 
  if (error) console.log('error:', error)})
 */

 /**
 *  fredrik: 5b30d3f179c424a80b44a5b5 (admin)
 *  michael: 5b30e72932d80ead0854dc9f
  * User.findOneAndUpdate({ _id: '5b30e72932d80ead0854dc9f' }, { $set: { expenses: [] } }, function (err, success) {
  if (err) {
    console.log('something went wrong!')
  }

})
  * 
  */