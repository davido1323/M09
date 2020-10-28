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
    posicio: 1,
    alies: "jperez",
    nom: "Jose",
    congnom: "Perez",
    score: 850
},
{
    posicio: 2,
    alies: "jsanz",
    nom: "Juan",
    congnom: "Sanz",
    score: 500
},
{
    posicio: 3,
    alies: "mgutierrez",
    nom: "Maria",
    congnom: "Gutierrez",
    score: 69
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
///Jugadores///
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
        }jugadores.sort((a,b) => (a.score < b.score ? 1: -1));
        for (i = 0; i < jugadores.length; i++)
        {
            jugadores[i].posicio = i + 1;
        }   
    }
    res.send(respuesta);
});

app.get ("/hola", function (req, res){
    res.send('[GET]Saludos');
});

///Get ordenar
app.get ("/ranking", function (req, res){
    res.send(jugadores);
});
///Get por alias
app.get ("/ranking/:alias", function (req, res) {
    for(i = 0; i < jugadores.length; i++) {
        if (req.params.alias == jugadores[i].alies){
            res.send(jugadores[i]);
        }
    }
});
/// Post alias
app.post ("/gamer/:alias", function (req, res)
{
    var nick = req.params.alias || '';
    var nombre = req.body.nom || '';
    var apellido = req.body.cognom || '';
    var puntuacion = req.body.score || '';
    respuesta.error = false;

    if (nick == '' || nombre == '' || apellido == '' || parseInt(puntuacion) <= 0 ||
    puntuacion == '')
    {
        respuesta = {
            error: true,
            codigo: 502,
            mensaje: 'El campo alias, nombre, apellido y score son requeridos'
        };
    }
    else if (nick != req.params.alias) {
        respuesta = { 
            error: true,
            codigo: 506,
            mensaje: "Alies incorrecte"
        };
    }
    else
    {
        for (var i = 0; i < jugadores.length; i++)
        {
            if (jugadores[i].alies == nick)
            {
                respuesta = {
                    Codi: 503,
                    error: true,
                    mensaje: "El jugador ja existeix"
                };
            }
        }
        if(!respuesta.error)
        {
            jugadores.push(
                {
                    posicio: jugadores.length + 1,
                    alies: nick,
                    nom: nombre,
                    cognom: apellido,
                    score: puntuacion 
                }
            )

            respuesta = {
                codigo: 200,
                error: false,
                mensaje: 'Jugador creat',
                respuesta: jugadores[jugadores.length - 1]
            };
        }
    }
    res.send(respuesta);

});

//Put alias

app.put ("/gamer/:alias", function (req, res)
{
    var nombre = req.body.nom || null;
    var apellido = req.body.cognom || null;
    var puntuacion = req.body.score || null;
    var nick = req.params.alias || null;
    respuesta.error = false;

    if (nombre == null || apellido == null || 
    puntuacion == null || nick == null)
    {
        respuesta = {
            error: true,
            codigo: 502,
            mensaje: 'El campo alias, nombre, apellido y score son requeridos'
        };
    }
    else if (nick != req.params.alias) {
        respuesta = { 
            error: true,
            codigo: 504,
            mensaje: "Jugador no existeix"
        };
    }
    else
    {
        for (var i = 0; i < jugadores.length; i++)
        {
            if (jugadores[i].alies == nick)
            {
                jugadores[i] = {
                    alias: nick,
                    nom: nombre,
                    cognom: apellido,
                    score: puntuacion 
                };
                respuesta = {
                    erro: false, 
                    codigo: 505,
                    mensaje: 'Jugador actualitzat',
                    respuesta: jugadores[i]
                };
                respuesta.error = true;
            }
        }
        
        if(!respuesta.error)
        {
           respuesta = {
               error: true,
               codigo: 504,
               mensaje: 'El jugador no existeix'
           };
        }
    }
    res.send(respuesta);
    
});


app.listen(3000, () => {
    console.log('El servidor esta inicializado en el puerto 3000');
});