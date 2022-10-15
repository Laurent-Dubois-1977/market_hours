var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;


var userSchema = new Schema({	
	local			: {
		email		 : String,
		password 	 : String
	},
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    password_clear: String, /// for development only!!!!  
	userName: String,
    email: String,
	avatarImg: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
	createDate: Date,
	createBy: {type: Schema.Types.ObjectId, ref: 'users'},
	updateDate: Date,
	updateBy: {type: Schema.Types.ObjectId, ref: 'users'},
	deleteDate: Date, 
	deleteBy: {type: Schema.Types.ObjectId, ref: 'users'}	
});


//generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};




module.exports = mongoose.model('users', userSchema);


