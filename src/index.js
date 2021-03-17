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
var { getBillete } = require ('./api.js');
var { getScore } = require ('./api.js');
var { buyCoin } = require ('./api.js');

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
    var Quieras = getBillete(data);
    if (Quieras != "error")
    {
      socket.emit("UpdatearBillete", Quieras);
    }
    else
    {
      console.log("Error");
    }
  });

  //Ganar score
  socket.on('scoreUpdate', (data)=> {
    var Quieras = getScore(data);
    if (Quieras != "error")
    {
      socket.emit("UpdatearScore", Quieras);
    }
    else
    {
      console.log("Error");
    }
  });

  //Añadir monedas
  socket.on('coinUpdate', (data)=> {
    var purchase = buyCoin(data);console.log("Usado");
    if (purchase != "error")
    {
      socket.emit("UpdatearMoneda", purchase);
      console.log("Usado");
    }
    else
    {
      console.log("Error");
    }
  });

  //Ranking
  socket.on('NewRanking', (data)=> {
    console.log("Hola");
    var comprobar = apijs.UpdatePuntuacion(data);
    if (!comprobar)
    {
      socket.emit('error', "Error al agregar puntuacion nueva");
    }
    else
    {
      
      var topGamers = apijs.RankingGame();
      io.emit('Ranking0', topGamers[0]);
      io.emit('Ranking1', topGamers[1]);
      io.emit('Ranking2', topGamers[2]);
      io.emit('Ranking3', topGamers[3]);
      io.emit('Ranking4', topGamers[4]);

      socket.emit('NuevaPuntuacion', comprobar)
    }
  })

  
  socket.on('disconnect', ()=>{
    console.log("Jugador desconectado, ID; " + socket.id);
  });

});

//Uso de ApiJS
app.use('/', apijs);
app.use(express.urlencoded({ extended: false }));

module.exports = app;