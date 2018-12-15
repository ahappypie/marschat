const NatsStreaming = require('node-nats-streaming');
const {DelayRpc} = require('./delayRpc');

const Redis = require('ioredis');
const redis = new Redis({host: process.env.REDIS_DELAY_HOST, port: process.env.REDIS_DELAY_PORT});

const rpc = new DelayRpc('../protos/delay.proto');
const stan = NatsStreaming.connect(process.env.NATS_CLUSTER, process.env.NATS_CLIENT, process.env.NATS_URL);

redis.on('ready', () => {
    stan.on('connect', () => {
        const opts = stan.subscriptionOptions();
        opts.setDurableName('delay-consumer');
        const delaySub = stan.subscribe('delay', opts);

        delaySub.on('message', (msg) => {
            const m = JSON.parse(msg.getData());
            console.log(m);

            rpc.getLightDelay(m.timestamp).then(res => {
                redis.set(m.message_id, '','PX', res.delay);
            }).catch(ex => {
                console.error(ex);
            })

        });
    })
});