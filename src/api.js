const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const jsonParser = bodyParser.json();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const fs = require('fs'); //Escribir y guardar json

let code100 = { code: 100, error: false, message: '2-DAMVI Server Up' };
let code200 = { code: 200, error: false, message: 'Player Exists' };
let code201 = { code: 201, error: false, message: 'Player Correctly Created' };
let code202 = { code: 202, error: false, message: 'Player Correctly Updated' };
let code203 = { code: 203, error: false, message: 'Player Correctly Deleted' };
//Mensajes de error
let codeError502 = { code: 502, error: true, message: 'Campo mandatorio' };
let codeError504 = { code: 504, error: true, message: 'Error: Player not found' };

let existe = false;

var players = [
    { position: "1", alias: "jperez", email: "Jose",  score: 1000, created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidad1: false, habilidad2: false},
    { position: "2", alias: "jsanz", email: "Juan", score: 950, created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidades: "?" },
    { position: "3", alias: "mgutierrez", email: "Maria", score: 850, created: "2020-11-03T15:20:21.377Z", coins: 0, billetes: 0, habilidades: "?" }
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
        console.log('The file has been saved!'); 
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
getjson();
savejson();
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
    res.send(code100);
});
router.get('/ranking', function (req, res) {
    UpdateRanking();
    let ranking = { players: players };
    res.send(ranking);
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
            response = "Bienvenido";
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
    var paramEmail = req.body.email || '';
    var paramPasswrd = req.body.password || '';
    if (paramAlias === '' || paramEmail === '' || paramPasswrd === '') {
        response = "Parametro sin rellenar";
    } else {
        var index = players.findIndex(j => j.alias === req.params.alias);
        if (index == -1)
        {
        response = createPlayer(paramAlias, paramEmail, paramPasswrd);
        }
        else
        {
            response = "Player already exists";
        }
        
    }
    res.send(response);
    UpdateRanking();
});

router.put('/players/:alias',jsonParser, function (req, res) { //Actualizar jugador
    var paramAlias = req.params.alias || '';
    var paramEmail = req.body.email || '';

    if (paramAlias === '' || paramEmail === '' ) {
        response = codeError502; //Paràmetres incomplerts
    } else {
        response = updatePlayer(paramAlias, paramEmail, paramScore);
    }
    res.send(response);
});

router.delete('/players/:alias/:password', function(req,res){ //Eliminar player
    var paramAlias = req.params.alias || '';
    var paramPasswrd = req.params.password || '';
    if (paramAlias === '' || paramPasswrd === '') {
        response = "Parametro sin rellenar"; //Paràmetres incomplerts
    } 
    else{
        getjson();
        //Player search
        var index = players.findIndex(j => j.alias === paramAlias);
        if (index != -1) {
            console.log("The player "+ paramAlias+" has ben deleted");
            response = code203;
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
        }
    }
    res.send(response);
});

function createPlayer(paramAlias, paramEmail, paramPasswrd){
    getjson();
    //Add Player
    players.push({ 
        position: '', 
        alias: paramAlias, 
        email: paramEmail, 
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
    //Response return
    response = code201;
    response.player = players[index];
    savejson();
    return response;
}
function updatePlayer(paramAlias, paramEmail, paramScore){
    getjson();
    if (paramAlias === '' || paramEmail === '' || parseInt(paramScore) <= 0 || paramScore === '' || paramPasswrd === ''){
        response = codeError502
    }else{
    //Player search
    var index = players.findIndex(j => j.alias === paramAlias)

    if (index != -1) {
        //Update Player
        players[index] = { 
            position: '', 
            alias: paramAlias, 
            email: paramEmail, 
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
        response = code202;
        response.jugador = players[index];
    } else {
        response = codeError504;
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
function comprobarDatos(paramAlias, paramEmail, paramScore, paramPasswrd){
    getjson();
    var hey = false;
    if (paramAlias === '' || paramEmail === '' || parseInt(paramScore) <= 0 || paramScore === '' || isNaN(paramScore) || paramScore === null || paramPasswrd === ''){
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
module.exports = router;
module.exports.search = search;
module.exports.createPlayer = createPlayer;
module.exports.comprobarDatos = comprobarDatos;
module.exports.enviarJugadores = enviarJugadores;
module.exports.actualisarJugador = actualisarJugador;