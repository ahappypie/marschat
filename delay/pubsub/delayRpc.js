const grpc = require('grpc');

class DelayRpc {
    constructor(protofile) {
        const protoDescriptor = grpc.load(protofile);
        this.client = new protoDescriptor.LightDelay(process.env.GRPC_URL, grpc.credentials.createInsecure());
    }

    async getLightDelay(timestamp) {
        return new Promise((resolve, reject) => {
            this.client.getLightDelay({timestamp: timestamp}, (err, response) => {
                if(!err) {
                    resolve(response);
                } else {
                    reject(err);
                }
            });
        });
    }
}

module.exports = {DelayRpc: DelayRpc};