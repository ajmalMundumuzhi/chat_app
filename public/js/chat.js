// client side code
const socket = io('http://localhost:3000')

socket.on('connect', () => {
    console.log('Connected to the server')
})

document.getElementById('setMentor').addEventListener('click', () => {
    socket.emit('set mentor')
})

// create room (mentor)
document.getElementById('createRoomForm').addEventListener('submit',(e) => {
    e.preventDefault();
    const roomName = document.getElementById('createRoomInput').value
    socket.emit('create room',roomName)
})

// join room (user)
document.getElementById('joinRoomForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const roomName = document.getElementById('joinRoomInput').value
    socket.emit('join room', roomName)
})

// litsen room events 
socket.on('room created', (roomName) => {
    const li = document.createElement('li')
    li.textContent = `Room created: ${roomName}`
    document.getElementById('roomMessages').appendChild(li) 
})

socket.on('user joined', (message) => {
    const li = document.createElement('li')
    li.textContent = message
    document.getElementById('roomMessages').appendChild(li)
})

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const input = document.getElementById('input')
    if(input.value){
        socket.emit('chat message', input.value)
        input.value = ''
    }
})

socket.on('chat message', (msg) => {
    const li = document.createElement('li')
    li.textContent = msg
    document.getElementById('messages').appendChild(li)
})

socket.on('message', (msg) => {
    alert(msg)
})

// disconnect 
const toggleButton = document.getElementById('toggle-btn')

toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    if(socket.connected){
        toggleButton.innerText = 'Connect'
        socket.disconnect();
    }else{
        toggleButton.innerText = 'Disconnect'
        socket.connect()
    }
})