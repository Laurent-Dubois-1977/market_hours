var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagsSchema = new Schema({	
    tag: {type: String, required: true},
    tagLowerCase: {type: String, required: true},
    tagType: { type: String, default: 'undefined'},
	createDate: Date,
	createBy: String,
	deleteDate: Date, 
	deleteBy: String	
});

const tags = mongoose.model('tags', tagsSchema);

tags.createTag = async function(req, tag, tagtype){
    let taglc = tag.toLowerCase();
    var extag = await tags.find({tagLowerCase: taglc, tagType: tagtype}).lean().exec();
    if(extag.length > 0){
        return false;
    } else {
        var newtag = new tags();
        newtag.tag = tag;
        newtag.tagLowerCase = taglc;
        newtag.tagType = tagtype? tagtype : "undefined";
        newtag.createDate = new Date().toISOString();
        newtag.createBy = req.user._id;
        newtag.save();
        return newtag;
    }
};

module.exports = tags;


