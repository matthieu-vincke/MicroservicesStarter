var mongoose = require('mongoose');

var DressPackage = mongoose.Schema({
	name: { type : String, unique : true, required : false, trim: true},
  userName: { type : String , unique : false, required : true},
  components : [{id:Number,imgPath:String,linkURL:String,type:String}],
  packages : [[{weatherCondition:String,componentIds:[Number]}]]
});

DressPackage.statics.findByName = function (name, cb) {
  return this.find({ name: name }, cb);
}

DressPackage.statics.findByUsername = function (userName, cb) {
  return this.find({ userName: userName }, cb);
}

DressPackage.virtual('user.full').get(function () {
  return 'Package: ' + this.name + ' From: ' + this.userName;
});

var DressPackage = module.exports = mongoose.model('DressPackage', DressPackage);
