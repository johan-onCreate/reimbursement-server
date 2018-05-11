var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var UserModel  = require('../models/user')
var User = UserModel.user
var mongoose = require('mongoose')

const appRoutes = function(app) {
  app.post('/getexpenses', jsonParser, function (req, res) {
    console.log('post, /getexpenses, body:', req.body.userId)
    var userId = req.body.userId
    mongoose.model('User').find((error, users) => {
      console.log('user:', users)
      if(users.name == userId) {
        res.send(users.expenses)
      } else {
        res.send('500 server did not find user')
      }
       
    })
  })

  app.post('/authenticate', jsonParser, function(req, res) {
    console.log('post, /authenticate, body:', req.body)
    var email = req.body.email
    if(email.match('@sylog.se$')){
      var data = {validEmail: true}
    } else {
      var data = {validEmail: false}
    }
    res.send(JSON.stringify(data))  
  })
}


module.exports = appRoutes

/**
 * var auser = new User({
      _id: new db.Types.ObjectId(),
      name: 'Michael Sohl',
      email: 'micso@sylog.se',
      expenses: [{date: new Date(), price: 0.87, km: 100, routeDescr: 'Träffade kund i Stockholm'},
    {date: new Date(), price: 0.87, km: 505, routeDescr: 'Träffade kund i Stockholm'},{date: new Date(), price: 1.12, km: 400, routeDescr: 'Träffade kund i Stockholm'},
  {date: new Date(), price: 0.84, km: 490, routeDescr: 'Träffade kund i Stockholm'},{date: new Date(), price: 0.87, km: 500, routeDescr: 'Träffade kund i Stockholm'}]
    })
      auser.save((error) => { 
      if (error) console.log('error:', error)})
 */