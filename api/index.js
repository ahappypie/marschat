const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {sequelize, Message, MessageRecipient} = require('./db.js');

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const delayPackageDefinition = protoLoader.loadSync(
    '../protos/delay.proto',
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const delayProtoDescriptor = grpc.loadPackageDefinition(delayPackageDefinition);
const grpcDelayClient = new delayProtoDescriptor.LightDelay(process.env.GRPC_DELAY_URL, grpc.credentials.createInsecure());

const messagePackageDefinition = protoLoader.loadSync(
    '../protos/message.proto',
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const messageProtoDescriptor = grpc.loadPackageDefinition(messagePackageDefinition);
const grpcMessageClient = new messageProtoDescriptor.MessageDelay(process.env.GRPC_MESSAGE_URL, grpc.credentials.createInsecure());

const unicaPackageDefinition = protoLoader.loadSync(
    '../../unica/api/unica.proto',
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const unicaProtoDescriptor = grpc.loadPackageDefinition(unicaPackageDefinition);
const grpcUnicaClient = new unicaProtoDescriptor.unica.IdService(process.env.UNICA_URL, grpc.credentials.createInsecure());

app.use(bodyParser.json());

app.post('/message', async (req, res) => {
    console.log(req.body);

    let uid = await unica();

    const m = await Message.create({
        message_id: uid,
        text: req.body.text,
        sender: req.body.sender.id,
        timestamp: req.body.timestamp,
        origin: req.body.origin
    });
    console.log(m.get({plain:true}));

    grpcMessageClient.setMessageDelay({message_id: ''+m.get().message_id, timestamp: m.get().timestamp}, (err, response) => {
        if(!err) {
            response.message_id = m.get().message_id;
            res.send(response);
        } else {
            throw new Error(err);
        }
    });

    const mr = [];
    req.body.recipients.forEach(r => {
        mr.push({message_id: m.get().message_id, recipient: r.id});
    });
    MessageRecipient.bulkCreate(mr);
});

app.get('/delay', async(req, res) => {
    console.log(req.query);

    let rpc = {timestamp: req.query.ts};
    if(req.query.dest) {
        rpc.dest = req.query.dest.toUpperCase();
    }

    grpcDelayClient.getLightDelay(rpc, (err, response) => {
        if(!err) {
            res.send(response);
        } else {
            res.error(err);
        }
    });
});

app.listen(3000, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({force:true});
        console.log('DB synced');
    } catch (ex) {
        console.error(ex);
    }
});

const unica = async () => {
    return new Promise((resolve, reject) => {
        grpcUnicaClient.getId({}, (err, response) => {
            if (!err) {
                resolve(response.id);
            } else {
                reject();
            }
        });
    })
};