const Crypto = require('./Crypto.js')
const net = require('net')
const md5 = require('md5')

var client = new net.Socket()
client.connect(1337, '127.0.0.1', () => {
    // {
    //     action: 'GROUP',
    //     subaction: ['get', 'create', 'signup', 'signoff'],
    //     gid: [hash],
    //     uid: [from auth-server or token],
    //     ...: [depends on subaction]
    // }

    const jsonData = {
        action: 'GROUP',
        subaction: 'CREATE',
        gid: 'something gid',
        uid: 'something uid',
        more: {
            name: 'group1'
        }
    }

    client.write(JSON.stringify(jsonData))
})

client.on('data', data => {
    console.log('data', JSON.parse(data))
})

client.on('close', () => {
    console.log('Connection closed')
})