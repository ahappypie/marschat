const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const messagePackageDefinition = protoLoader.loadSync(
    '../protos/message.proto',
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const messageProtoDescriptor = grpc.loadPackageDefinition(messagePackageDefinition);

const {DelayRpc} = require('./delayRpc');

const Redis = require('ioredis');
const redis = new Redis({host: process.env.REDIS_DELAY_HOST, port: process.env.REDIS_DELAY_PORT});

const delayRpc = new DelayRpc('../protos/delay.proto');

redis.on('ready', () => {
    const grpcServer = new grpc.Server();
    grpcServer.addService(messageProtoDescriptor.MessageDelay.service, {setMessageDelay: setMessageDelay});
    grpcServer.bind(process.env.GRPC_MESSAGE_URL, grpc.ServerCredentials.createInsecure());
    grpcServer.start();
});

const setMessageDelay = async (call, callback) => {
    delayRpc.getLightDelay(call.request.timestamp).then(res => {
        redis.set(call.request.message_id, '','PX', res.delay);
        callback(null, {delay: res.delay});
    }).catch(ex => {
        console.error(ex);
        callback(ex);
    })
}