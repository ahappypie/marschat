const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {sequelize, Message, MessageRecipient} = require('./db.js');
const NatsStreaming = require('./stan');
const stan = new NatsStreaming();

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

app.use(bodyParser.json());

app.post('/message', async (req, res) => {
    console.log(req.body);
    const m = await Message.create({
        text: req.body.text,
        sender: req.body.sender.id,
        timestamp: req.body.timestamp,
        origin: req.body.origin
    });
    console.log(m.get({plain:true}));
    const mr = [];
    req.body.recipients.forEach(r => {
        mr.push({message_id: m.get().message_id, recipient: r.id});
    });
    MessageRecipient.bulkCreate(mr);
    stan.publish('delay', {message_id: m.get().message_id, timestamp: m.get().timestamp}).then(res => {
        console.log(res);
    }).catch(ex => {
        console.error(ex);
    });
    res.send({message_id: m.get().message_id});
});

app.get('/delay', async(req, res) => {
   console.log(req.query);

    const packageDefinition = protoLoader.loadSync(
        '../delay/protos/delay.proto',
        {keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const grpcClient = new protoDescriptor.LightDelay(process.env.GRPC_URL, grpc.credentials.createInsecure());

    grpcClient.getLightDelay({timestamp: req.query.ts}, (err, response) => {
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
        await stan.connect();
        console.log('NATS connected');

        stan.subscribe('expire', 'api-expire-subscriber').on('message', (msg) => {
            const m = JSON.parse(msg.getData());
            Message.update({replicated: true}, {where: {message_id: m}}).then(rows => {
                console.log(`Replicated ${rows[0]} messages`);
            })
        })
    } catch (ex) {
        console.error(ex);
    }
});