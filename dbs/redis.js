const redis = require('ioredis');
const redisClient = redis.createClient({port: process.env.REDIS_PORT, host: process.env.REDIS_HOST}); 
const winston = require('../config/winston');
    

redisClient.on('connect', function (err, response) {

    console.log("");
    console.log("»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»");
    console.log("»»» Connected to Redis server: "+process.env.REDIS_HOST);
    console.log("»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»»");
    winston.logAppEvent("Connected to Redis database "+process.env.REDIS_HOST);
});

redisClient.on('error', (err) => {
  console.log("redis host: "+ process.env.REDIS_HOST);
  console.log('Redis error: ', err);
});


module.exports = redisClient;