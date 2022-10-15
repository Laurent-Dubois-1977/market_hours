const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exchangesSchema = new Schema({	
    name: String,
    description: String,
    uuid: String,
    countryISO: String,
    tz: String,
    is247: Boolean,
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

const exchanges = mongoose.model('exchanges', exchangesSchema);


module.exports = exchanges;