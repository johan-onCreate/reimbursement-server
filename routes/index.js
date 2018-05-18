var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var UserModel  = require('../models/user')
var User = UserModel.user
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var _ = require('lodash')

const appRoutes = function(app) {

  app.post('/getexpenses', jsonParser, function (req, res) {
    // var expenses = { data: [] }
    console.log('post, /getexpenses, body:', req.body.userId)
    var userId = req.body.userId
    var resp = []
    User.findOne({ _id : userId }, function(err, user) {
      console.log('User:', user)
      console.log('demo går så bra:', user.expenses)
      res.send(JSON.stringify(user))
      if(err){
        res.send('BAD RESPONSE')
        }
      })
    })

  app.post('/authenticate', jsonParser, function(req, res) {
    console.log('post, /authenticate, body:', req.body)
    var email = req.body.email
    if(email.match('@sylog.se$')){
      User.findOne({ email }, function(err, user) {
        if(err){
          console.log('BAD RESPONSE')
          res.send('BAD RESPONSE')
          }
        let data = {validEmail: true, userId: user._id}
        console.log('data:', data)
        res.send(JSON.stringify(data))
      })
     
    } else {
      let data = {validEmail: false}
      res.send(JSON.stringify(data))
    }
  })
}

function verifyJWTToken(token) 
{
  return new Promise((resolve, reject) =>
  {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => 
    {
      if (err || !decodedToken)
      {
        return reject(err)
      }

      resolve(decodedToken)
    })
  })
}

function createJWToken(details)
{
  if (typeof details !== 'object')
  {
    details = {}
  }

  if (!details.maxAge || typeof details.maxAge !== 'number')
  {
    details.maxAge = 3600
  }

  details.sessionData = _.reduce(details.sessionData || {}, (memo, val, key) =>
  {
    if (typeof val !== "function" && key !== "password")
    {
      memo[key] = val
    }
    return memo
  }, {})

  let token = jwt.sign({
     data: details.sessionData
    }, process.env.JWT_SECRET, {
      expiresIn: details.maxAge,
      algorithm: 'HS256'
  })

  return token
}

module.exports = appRoutes

/**
 * var auser = new User({
      _id: new db.Types.ObjectId(),
      name: 'Michael Sohl',
      email: 'micso@sylog.se',
      expenses: [{date: new Date(), price: 0.87, km: 100, routeDescr: 'Träffade kund i Köpenhamn', attest: false},
    {date: new Date(), price: 0.87, km: 505, routeDescr: 'Träffade kund i Stockholm', attest: true},{date: new Date(), price: 1.12, km: 400, routeDescr: 'Kundmöte på golfbanan i Jönköping', attest: false},
  {date: new Date(), price: 0.84, km: 490, routeDescr: 'Träffade kund i Stockholm', attest: true},{date: new Date(), price: 0.87, km: 500, routeDescr: 'Träffade kund i Stockholm', attest: true}]
    })
      auser.save((error) => { 
      if (error) console.log('error:', error)})
 */