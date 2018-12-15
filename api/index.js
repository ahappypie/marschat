const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {sequelize, Message, MessageRecipient} = require('./db.js');
const NatsStreaming = require('./stan');
const stan = new NatsStreaming();

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

app.listen(3000, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({force:true});
        console.log('DB synced');
        await stan.connect();
        console.log('NATS connected');

        stan.subscribe('expire', 'api-expire-subscriber').on('message', (msg) => {
            const m = JSON.parse(msg.getData());
            console.log(m);
        })
    } catch (ex) {
        console.error(ex);
    }
});