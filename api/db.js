const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    define: {engine: 'ROCKSDB'},
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const Message = sequelize.define('message', {
    message_id: {type: Sequelize.STRING, primaryKey: true},
    text: Sequelize.TEXT,
    sender: Sequelize.INTEGER,
    timestamp: Sequelize.BIGINT,
    origin: Sequelize.ENUM('earth', 'mars'),
    replicated: {type: Sequelize.BOOLEAN, defaultValue: false}
});

const MessageRecipient = sequelize.define('message_recipient', {
    message_id: Sequelize.STRING,
    recipient: Sequelize.INTEGER
});

module.exports = {sequelize: sequelize, Message: Message, MessageRecipient: MessageRecipient};