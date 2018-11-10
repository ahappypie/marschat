const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {sequelize, Message, MessageRecipient} = require('./db.js');

app.use(bodyParser.json());

app.post('/message', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(3000, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('App ready on port 3000, DB synced')
    } catch (ex) {
        console.error(ex);
    }
});