var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var UserModel  = require('./models/user')
var User = UserModel.user

const appRoutes = function(app) {
  app.get('/getusers', function (req, res) {
    User.findOne
    res.send()
  })

  app.post('/authenticate', jsonParser, function(req, res) {
    console.log('post, /authenticate, body:', req.body)
    var email = req.body.email
    if(email.match('@sylog.se$')){
      var data = {status: 200, validEmail: true}
    } else {
      var data = {status: 200, validEmail: false}
    }
    res.send(JSON.stringify(data))  
  })
}


module.exports = appRoutes