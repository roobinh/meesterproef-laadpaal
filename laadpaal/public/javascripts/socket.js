const socket = io();
const chat = document.querySelector('#messages');

socket.on('connect', function() {
    console.log('Socket connection established.')
    console.log('joining room: ' + href)
    socket.emit('join-room', href)
    console.log('room joined.')

})

socket.on('news', function(data) {
    console.log(data)
})

socket.on('create', function(data) {
    console.log('message from room!!')
})

socket.on('msg-for-room', function (msg) {
    const messages = msg.data;
    console.log(messages);
        
    messages.forEach(message => {
        let htmlclass;
        let name = message.user.name;

        if(message.user._id == "5d0b99a3ac92ed4ab0f64fdb") {
            htmlclass = "dashboard";
            
        } else {
            htmlclass = "client";
        }

        let html = `<li class="${htmlclass}">${name}: ${message.content}</li>`

        chat.innerHTML += html;

    })


 });

