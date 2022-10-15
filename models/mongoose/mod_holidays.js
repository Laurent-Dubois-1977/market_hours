const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const holidaysSchema = new Schema({	
    date: Date,
    tz: String,
    name: String,
    description: String,
    uuid: String,
    exchanges: [String],
   
    isAllDay: Boolean,
    hasPreMarket: Boolean,
    hasAfterMarket: Boolean,
   
    // standard hours 
    ohour: String,
    chour: String,
    omin: String,
    cmin: String,
    // pre market hours
    preOhour:String,
    preOmin: String,
    preChour:String,
    preCmin: String,
    // after market hours 
    aftOhour: String,
    aftOmin: String,
    aftChour: String,
    aftCmin: String,

    createDate: Number,
    createBy: String,
    deleteDate: Number, 
    deleteBy: String,
    updateDate: Number,
    updateBy: String	
});

const holidays = mongoose.model('holidays', holidaysSchema);

holidays.newDay= function(req){
    var newh = new holidays(req.body);
    newh.createDate =  new Date().getTime();
    newh.save();
    return newh;
};
module.exports = holidays;