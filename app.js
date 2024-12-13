const exp = require('constants')
const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const { title, emit } = require('process')
const {Server} = require('socket.io')
require('dotenv').config()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.json())

const users = {}
const rooms = []

// server side code
io.on('connection',(socket) => {
    console.log("A user connected", socket.id)
    // io.emit('new user connected',`New user ${socket.id} connected`)
    users[socket.id] = {role : 'user', room : null }

    socket.on('set mentor', () => {
        users[socket.id].role = 'mentor'
        socket.emit('message','You are now a mentor')
    })

    // create the room 
    socket.on('create room',(roomName) => {
        if(users[socket.id].role === 'mentor'){
            if(!rooms.some(room => room.name === roomName)){
                const newRoom = {
                    name : roomName,
                    creator : socket.id,
                    users : [socket.id]
                }
                rooms.push(newRoom)
                users[socket.id].room = roomName
                socket.join(roomName)
                io.emit('room created',roomName);
                console.log(`${socket.id} (mentor) created and joined room : ${roomName}`)
            }else{
                socket.emit('error','Room already exists.')
            }
        }else{
            socket.emit('error','only mentors can create rooms.')
        }
    })

    // join in the room
    socket.on('join room',(roomName) => {
        const room = rooms.find(room => room.name === roomName)
        if(room){
            socket.join(roomName)
            users[socket.id].room = roomName
            room.users.push(socket.id)
            io.to(roomName).emit('user joined',`${socket.id} joined ${roomName}`)
            console.log(`${socket.id} joined ${roomName}`)
        }else{
            socket.emit('error','Room does not exist.')
        }
    })
    // chat message handling
    socket.on('chat message',(msg) => {
        const userRoom = users[socket.id].room
        if(userRoom){
            io.to(userRoom).emit('chat message',msg)
            console.log(`message in ${userRoom} : ${msg}`)
        }else{
            socket.emit('error','You are not in room.')
        }
    })
    // handle the user disconnect
    socket.on('disconnect',() => {
        const userRoom = users[socket.id]?.room
        if(userRoom){
            io.to(userRoom).emit('message',`${socket.id} left ${userRoom}`)

        }
        delete users[socket.id]
        console.log('User disconnected:', socket.id)
    })
})

app.get('/',(req,res) => {
    res.render('index',{title : "Welcome to the chat app"})
})
const port = process.env.PORT
server.listen(port, () => {
    console.log(`Server is running on ${port}`)
})