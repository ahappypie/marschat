const Redis = require('ioredis');
const redis = new Redis({host: process.env.REDIS_DELAY_HOST, port: process.env.REDIS_DELAY_PORT});

redis.on('ready', () => {

});