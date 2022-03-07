const PROTO_PATH = __dirname + '/service.proto'

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
    log: ['query']
})

const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

const { marschat } = grpc.loadPackageDefinition(packageDefinition)

async function listChannels(call, callback) {
    const { user } = call.request
    const channels = await prisma.channel.findMany({
        where: {
            OR: [
                {private: false},
                {members: {some: {memberId: user}}}
            ]
        },
        select: {
            id:true, name:true
        }
    })

    callback(null, {channels: channels})
}

async function listMessages(call, callback) {
    const { channel, origin } = call.request
    const query = await prisma.message.findMany({
        where: {
            channelId: channel,
            replication: {some: {bodyId: origin}}
        },
        select: {
            text:true, senderId:true,
            replication: {
                select: {bodyId: true}
            }
        }
    })

    const messages = query.map(m => {
        return {text: m.text, sender: m.senderId, replication: m.replication.flatMap(Object.values)}
    })

    callback(null, {messages: messages})
}

async function createChannel(call, callback) {
    const name = call.request.name
    const owner = call.request.owner
    const priv = call.request.private || false
    try {
        const channel = await prisma.channel.create({
            data: {
                name: name, private: priv,
                members: {
                    create: {memberId: owner, owner: true}
                }
            }
        })

        callback(null, {id: channel.id, name: channel.name})
    } catch (e) {
        callback(e, null)
    }
}

async function createMessage(call, callback) {
    const sender = call.request.sender
    const text = call.request.text
    const channel = call.request.channel
    const origin = call.request.origin
    try {
        const message = await prisma.message.create({
            data: {
                text: text, senderId: sender, channelId: channel,
                replication: {
                    create: {bodyId: origin}
                }
            }
        })

        callback(null, {id: message.id, text: message.text, sender: message.senderId})
        //TODO publish message.id, origin to Kafka topic delay-message
        //TODO publish message.id to Kafka topic messages-$ORIGIN
    } catch (e) {
        callback(e, null)
    }
}

async function replicateMessage(call, callback) {
    const messageId = call.request.messageId
    const destination = call.request.destination

    try {
        const query = await prisma.messageReplication.create({
            data: {
                messageId: messageId,
                bodyId: destination
            },
            select: {
                message: {
                    select: {
                        text: true, senderId: true,
                        replication: {
                            select: {
                                bodyId: true
                            }
                        }
                    }
                }
            }
        })

        const message = {
            text: query.message.text, sender: query.message.senderId,
            replication: query.message.replication.flatMap(Object.values)
        }

        callback(null, message)
    } catch (e) {
        callback(e, null)
    }
}

const server = new grpc.Server()
server.addService(marschat.DataAccessLayer.service, {
    listChannels,
    listMessages,
    createChannel,
    createMessage,
    replicateMessage
})
server.bind('0.0.0.0:10000', grpc.ServerCredentials.createInsecure())

const message = `
The gRPC server is being started on 0.0.0.0:10000
`
console.log(message)
server.start()