const express = require ("express");
const bodyParser = require ('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

let gamer = {
    //posicio : '',
    //alias : '',
    nombre: '',
    apellido: '',
    score: ''
};

/**let jugadores = {
    posicio: '',
    alies: '',
    nom: '',
    congnom: '',
    score: ''
};**/

let jugadores = [{
    posicio: 3,
    alies: "jperez",
    nom: "Jose",
    congnom: "Perez",
    score: 1000
},
{
    posicio: 14,
    alies: "jsanz",
    nom: "Juan",
    congnom: "Sanz",
    score: 300
},
{
    posicio: 2,
    alies: "mgutierrez",
    nom: "Maria",
    congnom: "Gutierrez",
    score: 850
}
]

let respuesta = {
    error: false,
    codigo: 200,
    mensaje: ''
};

app.get('/', function (req, res){
    respuesta = {
    error: false,
    codigo: 200,
    mensaje: 'hola'
    }
    res.send(respuesta);
});

app.post('/gamer', function (req, res) {
    var nom = req.body.nombre || null;
    var cognom = req.body.apellido || null;
    var puntuacio = req.body.score || null;

    if (nom == null || cognom == null || puntuacio == null)
    {
        respuesta = {
            Codi: 502,
            Error: false,
            Missatge: 'Camps obligatoris camp nom, cognom o score'
        }
    }
    else 
    {
        if (gamer.nombre == nom && gamer.apellido == cognom)
        {
            respuesta = {
            Codi: 503,
            Error: true,
            Missatge: 'El jugador ya fue creado previamente'
            }
        }
        else
        {
            gamer = {
                nombre: nom,
                apellido: cognom,
                score: puntuacio
            };
            respuesta = {
                codigo: 200,
                error: false,
                mensaje: "Jugador creado",
                Cuerpo: gamer
            };
        }   
    }
    res.send(respuesta);
});

app.get ("/hola", function (req, res){
    res.send('[GET]Saludos');
});

app.get ("/ranking", function (req, res){
    jugadores.sort((a,b) => (a.score < b.score ? 1: -1));
    for (i = 0; i < jugadores.length; i++)
    {
        jugadores[i].posicio = i + 1;
    }
    res.send(jugadores);
});

app.listen(2999, () => {
    console.log('El servidor esta inicializado en el puerto 2999');
});