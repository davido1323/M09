'use strict';
const path = require('path');
const express = require("express");
var app = express()
//const bodyParser = require("body-parser");

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//ApiJS para WebSocket
var apijs = require('./api.js');
var { search } = require('./api.js');
var { createPlayer } = require('./api.js');
var { comprobarDatos } = require('./api.js');
var { enviarJugadores } = require('./api.js');
//Configuracion principal del Servidor
const port = process.env.PORT || 3000;
const server = app.listen(port, () => 
    console.log("El servidor está inicializado en el puerto " + port
));

//WebSockets
const SocketIo = require('socket.io');
const io = SocketIo(server);

io.on('connection', (socket) =>{
    console.log('Nueva conexion de', socket.id);
    //Escuchar evento
  ///PRUEBAS///

  
  socket.on('player:look',(data)=>{
    var player = apijs.enviarJugadores(parseInt(data));
    if(player === false){
      socket.emit('noexist', false);
    }
    else{
      socket.emit('players', player);
    }
  })

  socket.on('player:create',(data)=>{
    var comprobar = apijs.search(data.alias);
    var error = apijs.comprobarDatos(data.alias, data.name, data.surname, data.score);
    //Emitir a todos los usuarios
    if(comprobar === true){
      if(error === true){
        apijs.createPlayer(data.alias, data.name, data.surname, data.score);
        io.sockets.emit('server:playercreated', data)
      }else{
        console.log("Parametros incorrectos");
      }
    }else{
      console.log("Ya hay un usuario en con ese alias"); 
    }
  });
});

//Uso de ApiJS
app.use('/', apijs);
app.use(express.urlencoded({ extended: false }));
//HTML
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;