const Redis = require('ioredis');
const redis = new Redis({host: process.env.REDIS_DELAY_HOST, port: process.env.REDIS_DELAY_PORT});

const NatsStreaming = require('node-nats-streaming');
const stan = NatsStreaming.connect(process.env.NATS_CLUSTER, process.env.NATS_CLIENT, process.env.NATS_URL);

redis.on('ready', () => {
    stan.on('connect', () => {
        redis.config('SET', 'notify-keyspace-events', 'Ex');
        redis.subscribe('__keyevent@0__:expired');
        redis.on('message', (channel, message) => {
            console.log(channel, message);
            stan.publish('expire', message, (err, guid) => {
                if (err) {
                    console.error('publish failed: ' + err);
                } else {
                    console.log('Message published: ' + guid);
                }
            })
        })
    });
});