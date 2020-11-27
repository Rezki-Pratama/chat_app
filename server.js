//express instance
const express = require('express')
const socket = require('socket.io')
const postgre = require('./connection');


const app = express()
const server = app.listen(4000, ()=>{
    console.log('Listen to request on port 4000')
})

//static
app.use(express.static('public'))

//creating socket io instance
const io = socket(server)

//creating boyd parser
const bodyParser = require('body-parser')

//enable URL encoded for POST requests
app.use(bodyParser.urlencoded())

//enable header required for POST requests
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    next()
});

//create api to return all messages
app.post('/get_messages', (req, res) => {
    //get all messages from databases
    postgre.query('SELECT * FROM message WHERE (sender = $1 AND receiver = $2) OR (sender = $3 AND receiver = $4)',[
        req.body.sender,
        req.body.receiver,
        req.body.receiver,
        req.body.sender,
    ], (err, result) => {
        //response JSON
        console.log(result)
        res.end(JSON.stringify(result.rows))
    })
});

const users = []

io.on('connection', (socket) => {
    console.log('User connected', socket.id)

    //attach incoming listener for new user
    socket.on('user_connected', (username) => {
        //Save in array
        users[username] = socket.id;

        //socked id will be used to send message to individual person

        //notify all connected clients
        io.emit('user_connected', username)
    })

    //listen from clients
    socket.on('send_message', (data) => {
        console.log(data)
        let sockedId = users[data.receiver]

        io.to(sockedId).emit("new_message", data)

        //save in database
        postgre.query("INSERT INTO message (sender, receiver, message) VALUES ($1, $2, $3)", [
            data.sender,
            data.receiver,
            data.message
        ],(err,result)=> {
            if(err) {
                console.log(err)
            } else {
                console.log(result)
            }
        })
    })
})
