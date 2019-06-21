const socket = io();
const chat = document.querySelector('#messages');
const input = document.querySelector('#input')
const button = document.querySelector('#sendbutton')

socket.on('connect', function() {
    console.log('Socket connection established.')
    console.log('joining room: ' + href)

    socket.emit('join-room', href)
    
    console.log('room joined.')

})

socket.on('all-messages', function (msg) {
    const messages = msg.data;
    console.log(messages);
    
    chat.innerHTML = "";

    messages.forEach(message => {
        chat.innerHTML += generateMessageHTML(message);
    })
    updateScroll();
 });    

 socket.on('new-message', function(msg) {
     console.log('recieved new message from server!')
     console.log(msg);

     let message = {
         content: msg.data.createMessage.content,
         date: msg.data.createMessage.date,
         time: msg.data.createMessage.time,
         user: {
             _id: msg.data.createMessage.user._id,
             name: msg.data.createMessage.user.name
         }
     }

     chat.innerHTML += generateMessageHTML(message);
     updateScroll();

 })

 button.addEventListener('click', function() {
     if(input.value.trim() !== "") {
        sendMessage(input.value.trim())
        input.value = "";
     } else {
         // input field empty, do nothing
     }
 })

 function sendMessage(msg) {
     console.log('sending new message')

     socket.emit('new-client-message', { data: msg })
 }

 function generateMessageHTML(message) {
    console.log(message);

    let htmlclass;
    let name = message.user.name;

    if(message.user._id == "5d0b99a3ac92ed4ab0f64fdb") {
        htmlclass = "dashboard";
    } else {
        htmlclass = "client";
    }

    return `<li class="${htmlclass}">${name}: ${message.content}</li>`
 }

 function updateScroll() {
    const chat = document.querySelector(".chat")
    chat.scrollTop = chat.scrollHeight
 }
