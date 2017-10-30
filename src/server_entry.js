const Crypto = require('./Crypto.js')
var net = require('net')
var admin = require('firebase-admin')

var serviceAccount = require("../resources/userinfo-7f8f9-firebase-adminsdk-ophcs-89dc3be3b4.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://userinfo-7f8f9.firebaseio.com"
})

var ref = admin.database().ref()

/* {
        action: 'GROUP',
        subaction: ['get', 'create', 'signup', 'signoff'],
        gid: [hash],
        uid: [from auth-server or token],
        ...: [depends on subaction]
    }
    {
        action: 'POST',
        subaction: ['upload', 'remove', 'reply', 'react'],
        gid: [hash],
        pid: [hash],
        uid: [from auth-server or token]
    }
*/
var server = net.createServer(socket => {
    socket.on('end', () => {
    })

    // uid is retrieved from auth-server
    // So, whenever it sends requests to db-server, it goes through auth-server first
    socket.on('data', data => {
        var json_data = JSON.parse(Crypto.decoder(data))

        if(json_data.action == 'GROUP') {
            handle_group_action(json_data.subaction, json_data.gid, json_data.uid, json_data.more, result => {
                socket.write(result)
            })
        } else if(json_data.action == 'POST') {
            handle_post_action(json_data.subaction, json_data.gid, json_data.uid, json_data.more, result => {
                socket.write(result)
            })
        } else if(json_data.action == 'USER') {
            handle_user_action(json_data.subaction, json_data.uid, json_data.more, result => {
                socket.write(result)    
            })
        }
    })

    socket.pipe(socket)
})

function handle_group_action(subaction, gid, uid, detail, callback) {
    if(subaction == 'CREATE') {
        ref.child('group').child(gid).set({
            name: detail.name,
            createdAt: new Date().getTime(),
            members: [uid],
            posts: [],
        }, err => {
            if(err) {
                var result = {
                    result: false,
                    category: 'group',
                    action: 'CREATE'
                }
                callback(JSON.stringify(result))
            } else {
                var result = {
                    result: true,
                    category: 'group',
                    action: 'CREATE',
                    detail: JSON.stringify({
                        gname: detail.name,
                        gid: gid
                    })
                }
                callback(JSON.stringify(result))
            }
        })
    } else if(subaction == 'GET') {
        ref.child('group').get(gid, err => {
            if(err) {
                var result = {
                    result: false,
                    category: 'group',
                    action: 'GET'
                }
                callback(JSON.stringify(result))
            } else {
                var result = {
                    result: true,
                    category: 'group',
                    action: 'GET',
                    detail: JSON.stringify({
                        gname: detail.name,
                        gid: gid,
                        members: detail.members,
                        posts: detail.posts
                    })
                }
            }
        })
    } else if(subaction == 'SIGNUP') {
        var groupInfo = ref.child('group').child(gid).get()
        groupInfo.members.add(uid)
        ref.child('group').child(gid).update(groupInfo, err => {

        })
    } else if(subaction == 'SIGNOFF') {
        var groupInfo = ref.child('group').child(gid).get()
        groupInfo.members.remove(uid)
        ref.child('group').child(gid).update(groupInfo, err => {

        })
    }
}

server.listen(1337, '127.0.0.1')