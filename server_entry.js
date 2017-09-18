var net = require('net')
var admin = require('firebase-admin')

var serviceAccount = require("userinfo-7f8f9-firebase-adminsdk-ophcs-89dc3be3b4.json")

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
        var json_data = JSON.parse(decoder(data))

        if(json_data.action == 'GROUP') {
            var rtn = handle_group_action(json_data.subaction, json_data.gid, json_data.uid, json_data.more)

            socket.write(rtn)
        } else if(json_data.action == 'POST') {
            var rtn = handle_post_action(json_data.subaction, json_data.gid, json_data.uid, json_data.more)

            socket.write(rtn)
        } else if(json_data.action == 'USER') {
            var rtn = handle_user_action(json_data.subaction, json_data.uid, json_data.more)

            socket.write(rtn)
        }
    })

    socket.pipe(socket)
})

function handle_group_action(subaction, gid, uid, detail) {
    if(subaction == 'CREATE') {
        ref.child('group').child(gid).set({
            name: detail.name,
            createdAt: new Date().getTime(),
            members: [uid],
            posts: [],
        }, err => {

        })
    } else if(subaction == 'GET') {
        return ref.child('group').get(gid)
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