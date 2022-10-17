const mongoose = require('mongoose');
const exc = mongoose.model('exchanges');
const hol = mongoose.model('holidays');

const winston = require('../config/winston');
const moment = require('moment');
const mtz = require('moment-timezone');

module.exports = {
    getAll: async function (req, res) {
        try {
            var q = req.query;
            var query = { deleteDate: null };
            var limit = q.limit ? Number(q.limit) : 20;
            var skip = q.skip ? Number(q.skip) : 0;

            if (q.country !== undefined) { query.countryISO = q.country };
            if (q.tz !== undefined) { query.tz = q.tz };
            if (q.exchange !== undefined) { query.name = new RegExp(q.exchange, "i") };
            if (q.uuid !== undefined) { query.uuid = q.uuid };
            if (q.is247 !== undefined) { query.is247 = Boolean(q.is247) };

            var totalrecs = await exc.find(query).countDocuments();
            var response = await exc.find(query).skip(skip).limit(limit).exec();
            var count = response.length;
            var recleft = totalrecs - skip - count;
            var next = skip + count;

            if (count <= limit && recleft == 0) { next = null }

            res.status(200).send({ status: 200, message: "Exchanges data", skipped: skip, recCount: count, nextSkip: next, totalRecCount: totalrecs, data: response });
        } catch (err) {
            winston.logError(err.stack);
            res.status(500).send({ status: 500, message: err });
        }
    },

    getStatus: async function (req, res) {
        try {
            var q = req.query;
            var query = { deleteDate: null };
            var limit = q.limit ? Number(q.limit) : 20;
            var skip = q.skip ? Number(q.skip) : 0;

            if (q.country !== undefined) { query.countryISO = q.country };
            if (q.tz !== undefined) { query.tz = q.tz };
            if (q.exchange !== undefined) { query.name = new RegExp(q.exchange, "i") };
            if (q.uuid !== undefined) { query.uuid = q.uuid };
            if (q.is247 !== undefined) { query.is247 = Boolean(q.is247) };


            var totalrecs = await exc.find(query).countDocuments();
            var tresponse = await exc.find(query).skip(skip).limit(limit).exec();
            var response = [];

            var uuids = [];
            for (let i = 0; i < tresponse.length; i++) {
                var x = tresponse[i];
                uuids.push(x.uuid);
            }
            var dateoverride = null;
            if (q.date !== undefined) {
                dateoverride = q.date;
            }
            var response = await module.exports.checkStatus(uuids, dateoverride);

            var count = response.length;
            var recleft = totalrecs - skip - count;
            var next = skip + count;

            if (count <= limit && recleft == 0) { next = null }
            res.status(200).send({ status: 200, message: "Exchanges status", skipped: skip, recCount: count, nextSkip: next, totalRecCount: totalrecs, data: response });
        } catch (err) {
            winston.logError(err.stack);
            res.status(500).send({ status: 500, message: err });
        }
    },

    checkStatus: function (uuids, dateoverride) {
        var promise = new Promise(async function (resolve, reject) {
            try {
                var data = [];
                var exdata = await exc.find({ uuid: { '$in': uuids } }).exec();
                if (exdata.length == 0) {
                    resolve('norec')
                } else {
                    for (var i = 0; i<exdata.length; i++){
                        var x = exdata[i];
                        if (x.is247) {
                            data.push({ exchange: x.name, status: 'open' })
                        } else {
                            
                            var now = new Date();
                            if (dateoverride != null) {
                                now = new Date(dateoverride);
                            }
                            console.log(now);
                            // check if the exchange is on holiday
                            var isHoliday = await module.exports.checkHoliday(now, x.uuid);
                            // console.log(isHoliday[0]);
                            if (isHoliday.length>0){
                                var exchangeName = x.name;
                                x = isHoliday[0];
                                x.holName = x.name;
                                x.name = exchangeName;
                            }
                            console.log(x);

                            var nowTS = moment(now).unix();

                            var xcday = moment.tz(now, x.tz).day();
                            var xdata = { exchange: x.name, status: 'closed' };

                            if (0 < xcday && xcday < 6) {
                                if (x.hasPreMarket) {
                                    var xPreOpenTS = moment.tz(now, x.tz).hour(x.preOhour).minute(x.preOmin).seconds(0).unix()
                                    var xPreCloseTS = moment.tz(now, x.tz).hour(x.preChour).minute(x.preCmin).seconds(0).unix()
                                    if (xPreOpenTS < nowTS && nowTS < xPreCloseTS) {
                                        xdata.status = "pre-market";
                                        xdata.until = xPreCloseTS;
                                    }
                                };

                                if (x.hasAfterMarket) {
                                    var xAftOpenTS = moment.tz(now, x.tz).hour(x.aftOhour).minute(x.aftOmin).seconds(0).unix()
                                    var xAftCloseTS = moment.tz(now, x.tz).hour(x.aftChour).minute(x.aftCmin).seconds(0).unix()
                                    if (xAftOpenTS < nowTS && nowTS < xAftCloseTS) {
                                        xdata.status = "post-market";
                                        xdata.until = xAftCloseTS;
                                    }
                                };

                                var xOpenTS = moment.tz(now, x.tz).hour(x.ohour).minute(x.omin).seconds(0).unix()
                                var xCloseTS = moment.tz(now, x.tz).hour(x.chour).minute(x.cmin).seconds(0).unix()

                                if (xOpenTS < nowTS && nowTS < xCloseTS) {
                                    xdata.status = "open";
                                    xdata.until = xCloseTS;
                                }
                            }
                            if (xdata.status == 'closed') {
                                var addDays = 0;
                                if (xcday == 5) {
                                    addDays = 3;
                                };
                                if (xcday == 6) {
                                    addDays = 2
                                };
                                if (0 < xcday && xcday < 5) {
                                    addDays = 1;
                                }
                                var nextOpen = moment(now).add(addDays, 'day').tz(x.tz).hour(x.ohour).minute(x.omin).second(0);
                                var nextOpenTS = nextOpen.unix();
                                if (x.hasPreMarket) {
                                    var nextPreOpen = moment(now).add(addDays, 'day').tz(x.tz).hour(x.preOhour).minute(x.preOmin).second(0);
                                    var nextPreOpenTS = nextPreOpen.unix();
                                }
                                xdata.nextOpen = nextOpenTS;
                                if (x.hasPreMarket) { xdata.nextPreOpen = nextPreOpenTS }

                            }
                            data.push(xdata);
                        }
                    };
                }
                resolve(data);
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
        return promise;
    },

    checkHoliday: function (now, uuid){
        var promise = new Promise(async function(resolve, reject){
            try {
                var year = now.getFullYear();
                var month = now.getMonth()+1;
                var day = now.getDate();

                month = month < 10? `0${month}` : month;
                day = day < 10? `0${day}` : day;
                var fulldate = `${year}-${month}-${day}`
                console.log(String(fulldate));

                var hols = await hol.find({date: String(fulldate), exchanges: uuid}).exec();
                console.log('something');
                console.log(hols);

                resolve(hols);
            } catch (err){
                console.log(err);
                reject(err);
            }
        });
        return promise;
    }
};





