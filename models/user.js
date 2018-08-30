var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')

// Add metedata for most occured input for expenses properties.
var userSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  email: String,
  admin: Boolean,
  expenses: [{date: Date, car_type: String, km: Number, route_descr: String, attest: Boolean, client: String, userId: String, name: String, comment: String}],
  password: String,
  favorites: [{car_type: String, km: Number, route_descr: String, nick: String, client: String }]
})

userSchema.pre('save', function(next) {
  var user = this
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next()
  // generate a salt
  bcrypt.genSalt(function(err, salt) {
    if (err) return next(err)
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err)
      // override the cleartext password with the hashed one
      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err)
      cb(null, isMatch)
  })
}

const UserDb = mongoose.model('User', userSchema)

module.exports.user = UserDb