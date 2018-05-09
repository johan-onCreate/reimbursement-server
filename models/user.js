var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  email: String
})

const UserDb = mongoose.model('User', userSchema)
module.exports.user = UserDb