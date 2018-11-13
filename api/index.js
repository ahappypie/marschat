const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {sequelize, Message, MessageRecipient} = require('./db.js');

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
    res.send({message_id: m.get().message_id});
});

app.listen(3000, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({force:true});
        console.log('App ready on port 3000, DB synced')
    } catch (ex) {
        console.error(ex);
    }
});