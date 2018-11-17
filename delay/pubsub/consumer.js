const NatsStreaming = require('node-nats-streaming');
const {DelayRpc} = require('./delayRpc');
const rpc = new DelayRpc('../protos/delay.proto');
const stan = NatsStreaming.connect(process.env.NATS_CLUSTER, process.env.NATS_CLIENT, process.env.NATS_URL);

stan.on('connect', () => {
    const opts = stan.subscriptionOptions();
    opts.setDurableName('delay-consumer');
    const delaySub = stan.subscribe('delay', opts);

    delaySub.on('message', (msg) => {
        console.log(msg.getData());

        rpc.getLightDelay(JSON.parse(msg.getData()).timestamp).then(res => {
            console.log(res);
        }).catch(ex => {
            console.error(ex);
        })

    });
});