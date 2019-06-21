const socket = io();
const chat = document.querySelector('#newchat');
const input = document.querySelector('#input')
const button = document.querySelector('#sendbutton')
let currentName = "";

socket.on('connect', function() {
    console.log('Socket connection established.')
    socket.emit('join-room', href)
    console.log('room ' + href + ' joined.')

})

socket.on('all-messages', function (msg) {
    const messages = msg.data;    

    // clear chat 
    chat.innerHTML = "";

    // fill chat
    messages.forEach(message => {
        chat.innerHTML += generateMessageHTML(message);
    })

    // update scroll value
    updateScroll();
 });    

 socket.on('new-message', function(msg) {
     console.log('recieved new message from server! = ')
     console.log(msg);
    
     // create variables
     let message = {
         content: msg.data.createMessage.content,
         date: msg.data.createMessage.date,
         time: msg.data.createMessage.time,
         user: {
             _id: msg.data.createMessage.user._id,
             name: msg.data.createMessage.user.name
         }
     }

     // add new message to chat
     chat.innerHTML += generateMessageHTML(message);
     updateScroll();

 })

 button.addEventListener('click', function() {
     if(input.value.trim() !== "") {
        sendMessageToServer(input.value.trim())
        input.value = "";
     } else {
         // input field empty, do nothing
     }
 })

 function sendMessageToServer(msg) {
     console.log('sending new message to server...' + msg)
     socket.emit('new-client-message', { data: msg })
 }

 function generateMessageHTML(message) {
    let htmlclass;
    let name = message.user.name;
    
    if(message.user._id == "5d0b99a3ac92ed4ab0f64fdb") {
        htmlclass = "adminmsg";
    } else {
        htmlclass = "userMessage";
    }

    return `
    <div class=${htmlclass}>
        <h5>${name}</h5>
        <h4>${message.content}</h4>
    </div>
    `
 }

 function updateScroll() {
    const chat = document.querySelector(".newchat")
    chat.scrollTop = chat.scrollHeight
 }

