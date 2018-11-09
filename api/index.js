const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/message', function (req, res) {
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(3000);