const socket = io();

socket.on('connect', function() {
    console.log('Socket connection established.')
    console.log('joining room...')
    socket.emit('join-room', href)

})

socket.on('news', function(data) {
    console.log(data)
})

socket.on('create', function(data) {
    console.log('message from room!!')
})