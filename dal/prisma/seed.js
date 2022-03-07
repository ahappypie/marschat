const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const USERS = [
    {id: 1, email: "test@email.com", name: "tester", origin: 3}
]

const BODIES = [
    {id: 1, name: "Mercury"},
    {id: 2, name: "Venus"},
    {id: 3, name: "Earth"},
    {id: 4, name: "Mars"},
    {id: 5, name: "Jupiter"},
    {id: 6, name: "Saturn"},
    {id: 7, name: "Uranus"},
    {id: 8, name: "Neptune"}
]

const CHANNELS = [
    {id: 0, name: "public", private: false}
]

async function main() {
    for await (const b of BODIES) {
        await prisma.body.upsert({
            where: { id: b.id },
            update: {},
            create: {
                id: b.id,
                name: b.name,
            },
        })
    }
    console.log('Completed seeding Bodies')

    for await (const u of USERS) {
        await prisma.user.upsert({
            where: { id: u.id },
            update: {},
            create: {
                id: u.id,
                email: u.email,
                name: u.name,
                originId: u.origin
            },
        })
    }
    console.log('Completed seeding Users')

    for await (const c of CHANNELS) {
        await prisma.channel.upsert({
            where: {id: c.id},
            update: {},
            create: {
                id: c.id,
                name: c.name,
                private: c.private
            }
        })
    }
    console.log('Completed seeding Channels')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })