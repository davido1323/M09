'use strict';
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//ApiJS para WebSocket
var apijs = require('./api.js');

//Configuracion principal del Servidor
const port = process.env.PORT || 3000;
const server = app.listen(port, () => 
    console.log("El servidor está inicializado en el puerto " + port
));

//WebSockets
const SocketIo = require('socket.io');
const io = SocketIo(server);
var { buyBillete } = require ('./api.js');

io.on('connection', (socket) =>{
    console.log('Nueva conexion de', socket.id);
  
  socket.on('check',(data)=>{ //Get
    var player = apijs.enviarJugadores(parseInt(data));
    if(player === false){
      socket.emit('noexist', false);
    }
    else{
      socket.emit('players', player);
    }
  })

  socket.on('create',(data)=>{ //Post
    var comprobar = apijs.search(data.alias);
    var error = apijs.comprobarDatos(data.alias, data.email, data.score, data.password);

    if(comprobar === true){
      if(error === true){
        apijs.createPlayer(data.alias, data.email, data.score, data.password);
        socket.emit('created', data)
      }else{
        console.log("Wrong parameters");
      }
    }else{
      console.log("Alias already in use"); 
    }
  });

  //Update jugador
  socket.on('update',(data)=>{
  data = apijs.actualisarJugador(data);
  socket.emit('update', data);
  });

  //Añadir billetes
  socket.on('billeteUpdate', (data)=> {
    var Quieras = buyBillete(data);
    if (Quieras != "error")
    {
      socket.emit("UpdatearBillete", Quieras);
    }
    else
    {
      console.log("Error");
    }
  });
  socket.on('disconnect', ()=>{
    console.log("Jugador desconectado, ID; " + socket.id);
  });

});

//Uso de ApiJS
app.use('/', apijs);
app.use(express.urlencoded({ extended: false }));

module.exports = app;