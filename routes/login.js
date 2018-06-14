var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    //1.- verificamos si existe un usuario con ese correo electronico
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        //error al buscar usuario en la DB o en el servidor
        if (err) {
            return res.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario - Server',
                errors: err
            });
        }

        //Controla sino encuentra el usuario en la Base de Datos
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mesaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        //verificaos contrasena - compara un string con otro que ya utilizo el bcrypt
        if (!bcryptjs.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mesaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //creo el token
        //1.-Instalamos jsonwebtoken --->  npm install jsonwebtoken --save
        //var token = jwt.sign({ PAYLOD o cuerpo del token }, 'SEMILLA O PARABRA QUE SE ENCIPTA PARA GENERAL EL TOKEN', { expiresIn: FECHA DE EXPIRACION DEL TOKEN })
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token, // con este valor vamos a la pagina del jsonwebtoken y nos muestra lo que dice todo es codigo del jsonwebtoken y si es valido o no
            id: usuarioDB.id
        });
    });



});



//tengo que exportar para usar este archivo en otro lugar
module.exports = app;