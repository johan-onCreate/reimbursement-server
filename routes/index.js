var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const appRoutes = function(app) {
  app.get('/', function (req, res) {
    //console.log('response', res)
    //console.log('request', req)
    console.log('get')
    res.send('hello world')
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