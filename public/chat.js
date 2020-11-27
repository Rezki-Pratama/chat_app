//socket instance in frontend
const socket = io.connect('http://localhost:4000')

let receiver = ""
let sender = ""

function enterName() {
    //get name
    let name = document.getElementById('name').value
    //send it to server
    socket.emit('user_connected', name)

    //save my name in global variable
    sender = name;

    //prevent the form from submitting
    return false
}

//listen from user
socket.on('user_connected', (username) => {
    console.log(username)
    let html = ""
    html += "<li><button onclick='onUserSelected(this.innerHTML);'>"+username+"</button></li>"

    document.getElementById('users').innerHTML += html
});

function onUserSelected(username) {
    //save selected user in global variable
    receiver = username

    //call ajax
    $.ajax({
        url: "http://localhost:4000/get_messages",
        method: "POST",
        data: {
            sender: sender,
            receiver: receiver,
        },
        success: function (response) {
            console.log(response)
            let messages = JSON.parse(response)
            let html = "";

            for(let i = 0; i < messages.length; i++) {
                html += "<li>"+messages[i].sender + "says: "+ messages[i].message+"</li>"
            }

            //append in list
            document.getElementById('messages').innerHTML += html
        }
    })
}

function sendMessage() {
    //get message
    let message = document.getElementById('message').value

    //send message to server
    socket.emit('send_message', {
       sender: sender,
       receiver: receiver,
       message: message 
    })

    let html = "";
    html += "<li>"+ "You said: "+ message+"</li>"

    document.getElementById('messages').innerHTML += html

    //prevent the form from submitting
    return false
}

//listen from server
socket.on('new_message', (data) => {
    console.log(data)
    let html = "";
    html += "<li>"+data.sender + "says: "+ data.message+"</li>"

    document.getElementById('messages').innerHTML += html
})