const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usergroupsSchema = new Schema({	
    name: String,
    description: String,
    cuuid: String,  // uuid of the clients if usergroup is client specific
    users: [{type: Schema.Types.ObjectId, ref: 'users'}],
    apiKeys: [{key: String, scope: String}],  // usegroup level api keys

    createDate: Date,
    createBy: {type: Schema.Types.ObjectId, ref: 'users'},
    deleteDate: Date, 
    deleteBy: {type: Schema.Types.ObjectId, ref: 'users'},
    updateDate: String,
    updateBy: {type: Schema.Types.ObjectId, ref: 'users'}	
});

const usergroups = mongoose.model('usergroups', usergroupsSchema);

usergroups.newGroup= function(req){
    var newusergroup = new usergroups(req.body);
   
    // newusergroups.save();
    return newusergroup;
};
module.exports = usergroups;