const request = require("request");
const { Promise } = require('q');
const GOOGLE_GEO_KEY = process.env.GOOGLE_GEO_KEY;
const GOOGLE_GEO_URL = process.env.GOOGLE_GEO_URL;


module.exports = {

    getGeoCoord: async function (address) {
        var promise = new Promise(async function(resolve, reject){
            try {
                var options = {
                    method: 'GET',
                    url: GOOGLE_GEO_URL,
                    qs:
                    {
                        key: GOOGLE_GEO_KEY,
                        address: address.line1 + '%20' + address.line2 + '%20' + address.line2 + '%20' + address.city + '%20' + address.country + '%20' + address.zip
                    },
                    headers:
                        { 'cache-control': 'no-cache' }
                };
    
                request(options, async function (error, response, body) {   // tries to get geolocation data from google, if google api fails we still save the address data in the catch section 
                    if (error) throw new Error(error);
                    var data = JSON.parse(body);
                    if (data.results.length > 0) {
                        address.location = {};
                        address.location.lat = data.results[0].geometry.location.lat;
                        address.location.lng = data.results[0].geometry.location.lng;
                        address.googleGeoData = data;
                    }
                    resolve(address);
                });
            } catch (err){
                reject(err);
            }
        });
        return promise;
    }

};