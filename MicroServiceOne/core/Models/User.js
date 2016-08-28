var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	name: { type : String, unique : true, required : false, trim: true},
  password: { type : String , unique : false, required : true},
  email : { type : String , unique : true, required : true, lowercase: true, trim: true}
});

UserSchema.statics.findByName = function (name, cb) {
  return this.find({ name: name }, cb);
}

UserSchema.statics.findByEmail = function (email, cb) {
  return this.find({ email: email }, cb);
}

UserSchema.statics.passwordCheck = function (username, password, cb) {
  var self = this;
  function isPassOk(userData,cb){
    return cb(null,userData.password === password);
  }

  self.find({ name: username },function(err,res){
    if(res && res.length){
      // We found a match
      return isPassOk(res[0],cb);
    } else { // allow to use the email as id
      self.find({ email: username },function(err,res){
        if(err || !res.length) return cb(null,false);
        return isPassOk(res[0],cb);
      });
    }
  });
}

UserSchema.virtual('user.full').get(function () {
  return 'Name: ' + this.name + ' Email: ' + this.email;
});

var User = module.exports = mongoose.model('User', UserSchema);
