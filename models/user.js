var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Add metedata for most occured input for expenses properties.
var userSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  email: String,
  admin: Boolean,
  expenses: [{date: Date, car_type: String, km: Number, route_descr: String, attest: Boolean, client: String}]
})

const UserDb = mongoose.model('User', userSchema)

module.exports.user = UserDb