
const neo4j = require('neo4j-driver');
const n4j = neo4j.driver(process.env.NEO4J_PROTOCOL+"://"+process.env.NEO4J_HOST+":"+process.env.NEO4J_PORT, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));
// const neosession = n4j.session();
const neoops = {};

const winston = require('../config/winston');

const uuid = require('uuid');


// neoops.genId = function(){
//     return uuid.v1({msec: new Date().getTime()});
// };

// neoops.formatLabel = function(text){
//     return text.trim().replace(/ /g,'_').replace('-','_').toLocaleUpperCase();
// };

neoops.getRecordProperties = function(data){
    try {
        let res = [];
        for (let i=0; i<data[0].get(0).length; i++){
            let z = data[0].get(0)[i].properties;
            res.push(z); 
        }
        var total;
        try {
            total = data[0].get(1)[0].low;
        } catch (err){
            total = 0;
        }    
        return {items: res, total: total } ;
    } catch (err){
        console.log(err);
        throw err;
    }
};   

neoops.getNewRecordProperties = function(data){
    try {
        let res = data[0].get(0).properties;
        return res;
    } catch (err){
        throw err;
    }
};   


neoops.cypherWrite = async function(cypherquery, params){
    const session = n4j.session();
    try {
        let data;
        // console.time("cypherWrite query latency");
        const response = await session.writeTransaction(tx => tx.run(cypherquery, params));
        // await neoops.close();
        // console.timeEnd("cypherWrite query latency");
        try {
            data = neoops.getNewRecordProperties(response.records);
        } catch (err) {
            data = "transaction sucessful";
        }    
        return data;
    } catch (err) {
        console.log(err);
        winston.logError(err.stack);
        throw err;
    }  finally {
        await session.close();
    }
};

neoops.cypherRead = async function(cypherquery, params){
    const session = n4j.session();
    try {
        console.time("cypherRead query latency");
        const response = await session.readTransaction(tx => tx.run(cypherquery, params));
        console.timeEnd("cypherRead query latency");

        let data = neoops.getRecordProperties(response.records);
        return data;
    } catch (err) {
        console.log(err);
        winston.logError(err.stack);
        throw err;
    } finally {
        await session.close();
    }
};

module.exports = neoops;





