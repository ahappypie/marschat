const Redis = require('ioredis');

const {sequelize, Message} = require('../../api/db.js');

async function main() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('DB synced');

        const redis = new Redis({host: process.env.REDIS_DELAY_HOST, port: process.env.REDIS_DELAY_PORT});

        redis.on('ready', () => {
            redis.config('SET', 'notify-keyspace-events', 'Ex');
            redis.subscribe('__keyevent@0__:expired');
            redis.on('message', (channel, message) => {
                console.log(channel, message);

                Message.update({replicated: true}, {where: {message_id: message}}).then((count) => {
                    console.log(`Replicated ${count[0]} messages`);
                }).then(() => {
                    return Message.findByPk(message);
                }).then((m) => {
                    console.log(m.dataValues);
                })

            })
        });
    } catch (ex) {
        console.error(ex);
    }
}

main();