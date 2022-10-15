
const { exec } = require('child_process');
const fs = require('fs');
var rootdir = process.env.PWD;
const winston = require('../config/winston');
// const { actions } = require('../data/policies_assets');

module.exports = {

    scanEndpoints: function (mode) {
        try{
            process.stdout.write('Scanning api endpoints... ');
            var resources = [];
            fs.readdirSync(rootdir + '/api_routes').forEach(function (filename) {
                var endpoints = fs.readFileSync(rootdir + '/api_routes/' + filename).toString().match(/^.*\('\/api.*$/gm); // search file for all string containing "api" and stores it in an array
                if (endpoints) {
                    for (let i in endpoints) {
                        var endpoint = endpoints[i].match("('(.*)')");
                        // console.log(endpoint);
                        var httpWord = endpoints[i].match("app.(.*)\\('");
                        var urlstr = endpoint[0];
                        if (urlstr) {
                            let rn = urlstr.replace(/\//g, ":");
                            rn = rn.replace(/'/g, "");
                            rn = httpWord[1] + rn;
                            resources.push(rn);
                        }
                    }
                }
            });
            fs.writeFileSync("./data/actions.json", JSON.stringify(resources));
            process.stdout.write('Done\n');

        } catch (err){
            winston.logError(err.stack);
        }
    },

    urlToAction: function (url, method = "ALL") { // format url to resource name
        let rooturl = url.substring(0, url.indexOf("?"));   // removes the querystring if any
        let act = rooturl ? rooturl : url;
        act = act.replace(/\//g, ":");
        act = act.replace(/'/g, "");
        act = method.toLowerCase() + act;
        return act;
    },

    rnToEndpoint: function (rname) { // format resource name to match api endpoint
        // some code here
    },

    setOpField: function(req, type){  // sets update, delete or create fields
        try {
            req.body[`${type}Date`] = new Date().toISOString();
            req.body[`${type}By`] = req.user._id;
            // console.log(req.body);
            return req;
        } catch (err) {
            winston.logError(err.stack);
            return req;
        }
    },

    
    setUpdateFields: function(req){  
        /*
            Method to set only the fields sent in the request body when updating a document in mongo. 
            This returns the {$set : {...}} part of the query

        */
        try {
            var r = req.body;
            var set = {};
            set.$set = {};
            var keys = Object.keys(r);
            for (let i in keys){
                var key = keys[i];
                if (key != '_id' && key != '__v'){
                    set.$set[key] = r[key];
                }    
            }
            set.$set.updateBy = req.user._id;
            set.$set.updateDate = new Date().toISOString();
            return set;
        } catch (err) {
           winston.logError(err.stack);
           return req;
        }
    }
};





