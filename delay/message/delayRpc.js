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

    async getLightDelay(request) {
        return new Promise((resolve, reject) => {
            let rpc = {timestamp: request.timestamp};
            if(request.dest) {
                rpc.dest = request.dest.toUpperCase();
            }
            this.client.getLightDelay(rpc, (err, response) => {
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