const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const jsonParser = bodyParser.json();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const fs = require('fs'); //Escribir y guardar json

let existe = false; //Comprobante de si existe el player

var players = [
    { position: 1, alias: "jperez",score: 1000, password: "123", created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidad1: false, habilidad2: false},
    { position: 2, alias: "jsanz",score: 950, password: "123", created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidades: "?" },
    { position: 3, alias: "mgutierrez", score: 850, password: "123", created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidades: "?" },
    { position: 4, alias:"david",  score: 860, password: "123", created: "2021-01-28T09:45:25.155Z", coins:10, billetes :5, habilidades:"Ninguna"}
];
let response = {
    error: false,
    code: 200,
    message: ''
};
function savejson(){ //Guarda jugadores en el JSON
    const str = JSON.stringify(players);
    fs.writeFile('./src/player.json', str,'utf8', (err) => { 
        if (err) throw err; 
        //console.log('The file has been saved!'); 
    });
}
function getjson(){ //Carga los jugadores del JSON
    fs.readFile('./src/player.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        players = JSON.parse(jsonString);
    })
}
savejson();
getjson();
function UpdateRanking() { //Actualiza el ranking
    getjson();
    //Order the ranking
    players.sort((a, b) => (a.score <= b.score) ? 1 : -1);

    //Position Update
    for (var x = 0; x < players.length; x++) {
        players[x].position = x + 1;
    }
    savejson();
    getjson();
};

function Check (index)
{
    if (index >= 0)
    {
        existe = true;
    }
    else
    {
        existe = false;
    }
}

router.get('/', function (req, res) {
    //code funciona ok
    res.send("Servidor activado");
});


router.get('/players/ranking', function (req, res) {
    UpdateRanking();
    let rankingPlayers = [];
    var max = 0;
    if (players.length < 3)
    {
        max = players.length;
    }
    else
    {
        max = 3;
    }

    for (i = 0; i < max; i++)
    {
        rankingPlayers.push(
            {
                alias: players[i].alias,
                score: players[i].score
            });
    }
    response = rankingPlayers;
    res.send(response);
});


router.get('/players', function (req, res){
    getjson();
    res.send(players);
});
router.get('/players/:alias/:password', function (req, res) { //Mostrar jugador
    getjson();
    var paramAlias = req.params.alias || '';
    var paramPasswrd = req.params.password || '';
    var index = players.findIndex(j => j.alias === req.params.alias);
    Check(index);
    if (existe)
    {
        var alias = players[index]['alias'];
        var password = players[index]['password'];
        if (alias == paramAlias && password == paramPasswrd)
        {
            let cono = {
                position: players[index].position,
                alias: players[index].alias,
                password: players[index].password,
                score: players[index].score,
                coins: players[index].coins,
                billetes: players[index].billetes
            }
            response = cono;
        }
        else if (alias == paramAlias && password != paramPasswrd) {
            //Player exists
            response = "Erroneo";
        }
    }
    else
    {
        response = "Player doesn't exist"
    }
    res.send(response);
    UpdateRanking();
});
router.post('/players/:alias', jsonParser, function (req, res) { //Crear jugador
    getjson();
    var paramAlias = req.params.alias || '';
    var paramPasswrd = req.body.password || '';
    var respuesta;
    if (paramAlias === '' || paramPasswrd === '') {
        respuesta = "Parametro sin rellenar";
    } else {
        var index = players.findIndex(j => j.alias === req.params.alias);
        if (index == -1)
        {
            respuesta = createPlayer(paramAlias, paramPasswrd);
        }
        else
        {
            respuesta = "Player already exists";
        }
        
    }
    res.send(respuesta);
    UpdateRanking();
});

router.put('/players/:alias',jsonParser, function (req, res) { //Actualizar jugador
    var paramAlias = req.params.alias || '';

    if (paramAlias === '') {
        response = "Parametros sin rellenar"; //Paràmetres incomplerts
    } else {
        response = updatePlayer(paramAlias, paramScore);
    }
    res.send(response);
});

router.delete('/players/:alias', function(req,res){ //Eliminar player
    var paramAlias = req.params.alias || '';
    if (paramAlias === '') {
        response = "Parametro sin rellenar"; //Paràmetres incomplerts
    } 
    else{
        getjson();
        //Player search
        var index = players.findIndex(j => j.alias === paramAlias);
        if (index != -1) {
            console.log("The player "+ paramAlias+" has ben deleted");
            response = "Jugador eliminado";
            players.splice(index, 1);
            //Sort the ranking
            UpdateRanking();
        }
        else {
            response = "Player not found";
        }
    }
    res.send(response);
});

//Comprar monedas con billetes
router.get('/buycoins/:alias', function(req,res){
    var paramAlias = req.params.alias || '';
    var parambilletes = req.body.billetes || '';
    if (paramAlias === '' || parambilletes === '') {
        response = codeErrorBuy402;
    }
    else{
        getjson();
        var index = players.findIndex(j => j.alias === paramAlias)
        //Supongamos xk no tengo ni idea, que con 1 billetes se pilla 5 monedas. pos eso
        if(players[index].billetes < 1){
            response = codeErrorBuy403;
        }
        else{
            var precio = 1;
            var ganancia = 5;
            players[index].billetes -= precio;
            players[index].coins += ganancia;
            response = codeBuy401;
            response.jugador = players[index];
            console.log("El juagdor "+ players[index].alias+" ha comprado " + ganancia +" coins");
        }
    }
    res.send(response);
});

function createPlayer(paramAlias, paramPasswrd){
    getjson();
    //Add Player
    players.push({ 
        position: '', 
        alias: paramAlias, 
        score: 0 ,
        password: paramPasswrd,
        created: new Date(),
        coins: 10,
        billetes: 5,
        habilidades: "Ninguna"
    });
    //Sort the ranking
    UpdateRanking();
    //search Player Again
    index = players.findIndex(j => j.alias === paramAlias);
    console.log(players[index]);
    //Response return
    response.player = players[index];
    savejson();
    return response;
}
function updatePlayer(paramAlias, paramScore){
    getjson();
    if (paramAlias === '' || parseInt(paramScore) <= 0 || paramScore === '' || paramPasswrd === ''){
        response = "Parametros sin rellenar"
    }else{
    //Player search
    var index = players.findIndex(j => j.alias === paramAlias)

    if (index != -1) {
        //Update Player
        players[index] = { 
            position: '', 
            alias: paramAlias, 
            score: paramScore,
            password: paramPasswrd,
            created:  players[index].created,
            updated: new Date(),
            coins: 10,
            billetes: 5,
            habilidades: "Ninguna"
        };
        //Sort the ranking
        UpdateRanking();
        //search Player Again
        index = players.findIndex(j => j.alias === paramAlias);
        //Response return
        response = "Jugador actualizado";
        response.jugador = players[index];
    } else {
        response = "Player not found";
    }
}
    return response;
}

 function search(data) {
    getjson();
    var index = players.findIndex(j => j.alias === data.alias)
    var ok = false;
    //Si lo encuentra es false sino true
    if (index != -1) {
        ok = index;
        console.log("El jugador "+ data.alias +" existe")
    }else{
        ok = false;
        console.log("El jugador "+ data.alias +" no existe")
    }
    console.log(data)
    return ok;
}
function comprobarDatos(paramAlias, paramScore, paramPasswrd){
    getjson();
    var hey = false;
    if (paramAlias === '' || parseInt(paramScore) <= 0 || paramScore === '' || isNaN(paramScore) || paramScore === null || paramPasswrd === ''){
        hey = false;
    }else{
        hey = true;
    }
    return hey;
}
function enviarJugadores(data){
    if(data < 0 || data > players.length){
        data = false;
        return data;
    }else{
    return players[data];
    }
}
function actualisarJugador(data)
{
    
    if (search(data) != false)
    {
        var index = search(data);
        players[index].name = data.name;
        players[index].coin = data.coin;
        return players[index];
    }
    else
    {
        console.log("Jugador no existe");
    }
}

function getCoin(data)
{
    getjson();
    var index = players.findIndex(y => y.alias == data)
    if(index != -1)
    {
        players[index].coins += 1
        response = players[index];
        console.log("El juagdor "+ players[index].alias+" consigue 1 moneda");
        savejson();
    }
    else
    {
        response = false;
    }
    return response;
}

function buyBillete(data)
{
    getjson();
    var index = players.findIndex(y => y.alias == data)
    if(index != -1)
    {
        players[index].billetes += 100
        response = players[index];
        console.log("El juagdor "+ players[index].alias+" ha comprado 100 billetes");
        savejson();
    }
    else
    {
        response = false;
    }
    return response;
}

function UpdatePuntuacion(data)
{
    var search = players.findIndex(j => j.alias === data.alias);
    if (search != -1)
    {
        players[search].score = parseInt(data.score);
        response = players[search];
        UpdateRanking();
    }
    else
    {
        response = error;
    }

    return response;
}

function RankingGame(data)
{
    getjson();
    allPlayers = [];
    var maxPlayers = 0;
    if (players.length < 5)
    {
        maxPlayers = players.length
    }
    else
    {
        maxPlayers = 5;
    }

    for(i = 0; i < maxPlayers; i++)
    {
        allPlayers.push(
            {
                alias: players[i].alias,
                score: players[i].score,
            });
    }
    response = allPlayers;
    return response;
}


module.exports = router;
module.exports.search = search;
module.exports.createPlayer = createPlayer;
module.exports.comprobarDatos = comprobarDatos;
module.exports.enviarJugadores = enviarJugadores;
module.exports.actualisarJugador = actualisarJugador;
module.exports.buyBillete = buyBillete;
module.exports.getCoin = getCoin;
module.exports.UpdatePuntuacion = UpdatePuntuacion;
module.exports.RankingGame = RankingGame;