var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var UserModel  = require('../models/user')
var User = UserModel.user
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var _ = require('lodash')
var moment = require('moment')
var db = require('mongoose')
var bcrypt = require('bcrypt')
var sendmail = require('sendmail')({
  devHost:'localhost',
  devPort: 3000
})
var pdf = require('../lib/pdf')
var pdfcreator = pdf.pdfcreator

// var form = require('../form_data/expenses-form')

const form = {
  car_types: ['Egen bil', 'Företagsbil diesel', 'Företagsbil bensin']
}

const appRoutes = function(app) {

  app.post('/getexpenses', jsonParser, function (req, res) {
    // var expenses = { data: [] }
    var admin
    console.log('post, /getexpenses, body:', req.body)
    var userId = req.body.userId
    var resp = {}
    User.findOne({ _id : userId }, function(err, user) {
      if(err){
        let res = {response: 'Error 1'}
        res.send(JSON.stringify(resp))
        }
        admin = user.admin
        console.log('admin:', admin)
        resp = Object.assign({}, user.toObject(), form)
        console.log('resp:', resp)
        var userMap = {}
        if (admin) {
          User.find({}, function(error, users) {
            users.forEach(function(user){
              if (user._id != userId) {
                resp.expenses = resp.expenses.concat(user.expenses)
              }
            })
            res.send(JSON.stringify(resp))
          })
      } else {
        res.send(JSON.stringify(resp))
      }
      })
    })

  app.post('/authenticate', jsonParser, function(req, res) {
    console.log('post, /authenticate, body:', req.body)
    var email = req.body.email
    var password = req.body.password
    let data
    let pass
    if(email.match('@sylog.se$')){
      User.findOne({ email }, function(err, user) {
        if(err){
          data = { validEmail: false, reason: 'Du finns inte i databasen' }
          res.send(JSON.stringify(data))
          }
        if(user._id) {
          data = { validEmail: true, userId: user._id }
          comparePasswords(password, user, data ,res)
        } else {
          data = { validEmail: false, reason: 'Du finns inte i databasen' }
          res.send(JSON.stringify(data))
        }
      })
     
    } else {
      data = { validEmail: false, reason: 'Måste använda jobbmejlen'}
      res.send(JSON.stringify(data))
    }
  })
 
  app.post('/addexpense', jsonParser, function(req, res) {
    console.log('post, /addexpense, body:', req.body)
    var expense = {date: moment(req.body.expensesProp.date).add(1, 'd').local('sv').toDate(), car_type: req.body.expensesProp.carType, 
                    km: req.body.expensesProp.km, route_descr: req.body.expensesProp.route_descr, attest: false, client: req.body.expensesProp.client, 
                    userId: req.body.expensesProp.userId, name: req.body.expensesProp.name }
    var data
    User.findOneAndUpdate({ '_id' : req.body.expensesProp.userId }, { $push: { expenses: expense } }, function (err, success) {
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

  app.post('/toggleexpense', jsonParser, function(req, res){
    console.log('post, /toggleattest:', req.body)
    var data
    var userId = req.body.userId
    var expenseId = req.body.expenseId
    User.findOne({ _id: userId }, function(err, user){
      if(err){
        data = {data: 'BAD RESPONSE'}
        res.send(JSON.stringify(data))
      }
      user.expenses.forEach(elem => {
        console.log(elem)
        console.log(elem.id)
        console.log(expenseId)
        if(elem._id == expenseId){
          console.log('3')
        User.findOneAndUpdate({ 'expenses._id': expenseId }, { $set: {'expenses.$.attest': !elem.attest } }, function(err,success){
          if(err) {
            data = {data: 'BAD RESPONSE'}
            res.send(JSON.stringify(data))
          }
          res.send(JSON.stringify({data: 'OK'}))
        })
        } 
      })
    })
})

app.post('/updateexpense', jsonParser, function(req, res) {
  console.log('post, /updateexpense:', req.body)
  var data
  var userId = req.body.userId
  var expenseId = req.body.expenseId
  var expenseProps = req.body.expenseProps

  User.findOne({ _id: userId }, function(err, user){
    if(err){
      data = {data: 'BAD RESPONSE'}
      res.send(JSON.stringify(data))
    }
    user.expenses.forEach(elem => {
      if(elem._id == expenseId){
      User.findOneAndUpdate({ 'expenses._id': expenseId },{ $set: {'expenses.$.date': moment(expenseProps.date).add(1, 'd').local('sv').toDate(), 'expenses.$.car_type': expenseProps.carType, 
                              'expenses.$.km': expenseProps.km, 'expenses.$.route_descr': expenseProps.route_descr, 'expenses.$.client': expenseProps.client }} , function(err,success){ 

        if(err) {
          data = {data: 'BAD RESPONSE'}
          res.send(JSON.stringify(data))
        } else {
          res.send(JSON.stringify({data: 'OK'}))
        }
      })
      } 
    })
  })
})

app.post('/removeexpense', jsonParser, function(req, res) {
  // array of expense id:n with corresponding userIdn
  console.log('post, /removeexpense:', req.body)
  var data 
  var userId = req.body.userId
  var expenseId = req.body.expenseId
  
  User.findOneAndUpdate({ _id : userId}, { $pull: { expenses: { _id: expenseId }}}, function(error, resp) {
    if(error){
      data = {data: 'BAD RESPONSE'}
      res.send(JSON.stringify(data))
    } else{ 
      res.send(JSON.stringify({data: 'OK'}))
    }
  })
})

  app.post('/createaccount', jsonParser, function(req, res) {
    console.log('post, /createaccount:', req.body)
    var data
    var email = req.body.email
    var password = req.body.password
    var name
    if(email) {
      let matchResp = email.match(/([a-z]+)\.([a-z]+)/)
      let fn = matchResp[1]
      let ln = matchResp[2]
      if(matchResp.length > 2) {
        name = fn[0].toUpperCase() + fn.slice(1, fn.length) + ' ' + ln[0].toUpperCase() + ln.slice(1, ln.length)
      }
    }

    var auser = new User({
      _id: new db.Types.ObjectId(),
      name,
      email,
      admin: false,
      expenses: [],
      password
    })
    
    console.log('blev det något?:', auser)
    auser.save((error) => { 
      if (error) console.log('error:', error)})
    
    res.send(JSON.stringify({data: 'OK'}))
  })

  app.post('/addfavorite', jsonParser, function(req, res) {
    console.log('post, /addfavorite:', req.body)
    var data
    var favoriteProps = req.body.favoriteProps
    var userId = req.body.userId

    User.findOneAndUpdate({ '_id' : userId }, { $push: { favorites: favoriteProps } }, function (err, success) {
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

  app.post('/getfavorites', jsonParser, function(req, res){
    // console.log('post, /getfavorite:', req.body)
    var data 
    var userId = req.body.userId
    User.findOne({ '_id' : userId }, function(err, user) {
      if(err){
        data = {response: 'Error 1'}
        // console.log('apa:', user.favorites)
        res.send(JSON.stringify(data))
        } 
        // console.log('apa2:', user.favorites)
        let obj = user.toObject()
        data = { favorites: obj.favorites }
        res.send(JSON.stringify(data))
        // resp = Object.assign({}, user.toObject(), form)
        // console.log('resp:', resp)
      })
  })

  app.post('/removefavorite', jsonParser, function(req, res) {
    // array of expense id:n with corresponding userIdn
    console.log('post, /removeexpense:', req.body)
    var data 
    var userId = req.body.userId
    var favoriteId = req.body.favoriteId
    
    User.findOneAndUpdate({ _id : userId}, { $pull: { favorites: { _id: favoriteId }}}, function(error, resp) {
      if(error){
        data = {data: 'BAD RESPONSE'}
        res.send(JSON.stringify(data))
      } else{ 
        res.send(JSON.stringify({data: 'OK'}))
      }
    })
  })

  app.post('/updatecomment', jsonParser, function(req, res) {
    console.log('post, /updatecomment:', req.body)
    var data
    var userId = req.body.userId
    var expenseId = req.body.expenseId
    var comment = req.body.comment
  
    User.findOne({ _id: userId }, function(err, user){
      if(err){
        data = {data: 'BAD RESPONSE'}
        res.send(JSON.stringify(data))
      }
      user.expenses.forEach(elem => {
        if(elem._id == expenseId){
        User.findOneAndUpdate({ 'expenses._id': expenseId },{ $set: {'expenses.$.comment': comment }} , function(err,success){ 
          if(err) {
            data = {data: 'BAD RESPONSE'}
            res.send(JSON.stringify(data))
          } else {
            res.send(JSON.stringify({data: 'OK'}))
          }
        })
        } 
      })
    })
  })

  app.post('/createpdf', jsonParser, function(req, res) {
    console.log('post, /createpdf:', req.body)
    var data
    var date = {
      year: req.body.year,
      month: req.body.month
    }

    let matchedExpenses = []
    if (date) {
        User.find({}, function(err, user) {
          // console.log('user:', user)
          // var pdfc = new pdfcreator
          user.forEach(user => {
            // console.log('USER 1337:', user)
            let userExpenses = { user: user.name, expenses : []}
            user.expenses.forEach(expense => {
              let elementDate = {
                year: moment(expense.date).year(),
                month: moment(expense.date).month() + 1
              }

              if (elementDate.year == date.year && elementDate.month == date.month) {
                // console.log('match')
                userExpenses.expenses.push(expense)
              } 

            })
            matchedExpenses.push(userExpenses)
            // console.log('matchedExpenses:', matchedExpenses)
          })
          var pdfc = new pdfcreator(matchedExpenses, date)
          pdfc.generatePages()
          // <object width="400" height="400" data="helloworld.swf"></object>
        })
        data = {resp: 'OK'}
        res.send(JSON.stringify(data))
    } else {
      data = {resp: 'NOT OK', feedback: 'Datum-datan var felaktig'}
      res.send(JSON.stringify(data))
    }
  })
}

/**
 * sendmail({
            from: 'no-reply@yourdomain.com',
            to: 'micso796@live.com',
            subject: 'test sendmail',
            html: 'Mail of test sendmail ',
            attachments: {
              filename: '8-2018.pdf',
              path: '../8-2018'
            }
          }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        })
 */


function comparePasswords (text, user, data, res) {
  // test a matching password
  user.comparePassword(text, function(err, isMatch) {
    if (err) throw err
    // console.log('Password123:', isMatch) // -> Password123: true
    if (isMatch) {
      console.log('match!')
      res.send(JSON.stringify(data))
    } else {
      console.log('false match!')
      data.validEmail = false
      // data.validEmail
      res.send(JSON.stringify(data))
    }
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