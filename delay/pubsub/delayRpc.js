const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

class DelayRpc {
    constructor(protofile) {
        const packageDefinition = protoLoader.loadSync(
            protofile,
            {keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
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