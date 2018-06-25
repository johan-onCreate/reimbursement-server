var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var UserModel  = require('../models/user')
var User = UserModel.user
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var _ = require('lodash')
var moment = require('moment')
// var form = require('../form_data/expenses-form')

const form = {
  car_type: ['Egen bil', 'Företagsbil diesel', 'Företagsbil bensin']
}

const appRoutes = function(app) {

  app.post('/getexpenses', jsonParser, function (req, res) {
    // var expenses = { data: [] }
    var admin
    console.log('post, /getexpenses, body:', req.body)
    var userId = req.body.userId
    console.log(userId)
    var resp = {}
    User.findOne({ _id : userId }, function(err, user) {
      if(err){
        console.log(3)
        let res = {response: 'Error 1'}
        res.send(JSON.stringify(resp))
        }
        console.log(2)
        admin = user.admin
        console.log('admin:', admin)
        resp = Object.assign({}, user.toObject(), form)
        console.log('resp:', resp)
        var userMap = {}
        if (admin) {
          console.log(4)
          User.find({}, function(error, users) {
            console.log(5)
            users.forEach(function(user){
              console.log(6)
              if (user._id != userId) {
                resp.expenses = resp.expenses.concat(user.expenses)
              }
            })
            res.send(JSON.stringify(resp))
          })
      } else {
        res.send(JSON.stringify(resp))
      }
        console.log(8)
      })
      console.log(9)
      
    })

  app.post('/authenticate', jsonParser, function(req, res) {
    console.log('post, /authenticate, body:', req.body)
    var email = req.body.email
    let data
    if(email.match('@sylog.se$')){
      User.findOne({ email }, function(err, user) {
        if(err){
          data = {data: 'BAD RESPONSE'}
          res.send(JSON.stringify(data))
          }
        data = {validEmail: true, userId: user._id}
        console.log('data:', data)
        res.send(JSON.stringify(data))
      })
     
    } else {
      data = {validEmail: false}
      res.send(JSON.stringify(data))
    }
  })
  
  app.post('/addexpense', jsonParser, function(req, res) {
    console.log('post, /addexpense, body:', req.body)
    var userId = req.body.userId
    let expense = {date: moment(req.body.expensesProp.date.timestamp).local().toDate(), car_type: req.body.expensesProp.car_type, km: req.body.expensesProp.km, route_descr: req.body.expensesProp.route_descr, attest: false, client: req.body.expensesProp.client, userId}
    let data
    console.log('userId:', userId)
    User.findOneAndUpdate({ _id: userId }, { $push: { expenses: expense } }, function (err, success) {
      if (err) {
        let feedback = feedbackWhenError(req.body.expensesProp)
        data = {resp: 'Error', feedback}

        console.log('DET BLEV FEL')
        res.send(JSON.stringify(data))
      } else {
        data = {resp: 'OK'}
        res.send(JSON.stringify(data))
      }
    })
  })
}

function feedbackWhenError (expenseForm) {
  // check km, if Integer
  // check if route_descr & client empty
  if (expenseForm.km && expenseForm.km.match('^[0-9]+$')){

  }
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