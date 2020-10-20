const express = require ("express");
const bodyParser = require ('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

let gamer = {
    nombre: '',
    apellido: '',
    score: ''
};

let respuesta = {
    error: false,
    codigo: 200,
    mensaje: ''
};

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

app.listen(3000, () => {
    console.log('El servidor esta inicializado en el puerto 3000');
});