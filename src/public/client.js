const socket = io();

let alias = document.getElementById('alias');
let name = document.getElementById('name');
let surname = document.getElementById('surname');
let score = document.getElementById('score');

var btn = document.getElementById('send');

//Enviar datos al servidor


btn.addEventListener('click', function(){
    socket.emit('player:create',{
        alias: alias.value,
        name: name.value,
        surname: surname.value,
        score: parseInt(score.value)
    });
});

socket.on('server:playercreated', (data) =>
    console.log("A new player has been created ",data)
);
