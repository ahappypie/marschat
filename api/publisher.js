const NatsStreaming = require('node-nats-streaming');

class NatsStream {
    constructor() {
        this.cluster = process.env.NATS_CLUSTER;
        this.client = process.env.NATS_CLIENT;
        this.url = process.env.NATS_URL;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.stan = NatsStreaming.connect(this.cluster, this.client, {url: this.url});

            this.stan.on('connect', () => {
                resolve();
            });
        });
    }

    publish(channel, message) {
        return new Promise((resolve, reject) => {
            this.stan.publish(channel, JSON.stringify(message), (err, guid) => {
                if (err) {
                    reject('publish failed: ' + err);
                } else {
                    resolve('Message published: ' + guid);
                }
            })
        });
    }
}

module.exports = NatsStream;