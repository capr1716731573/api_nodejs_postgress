var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var mdAuthenticationJWT = require('../middlewares/authentication');

var app = express();

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Usuario = require('../models/usuario');

//Rutas
// ==========================================
// Obtener todos los usuarios
// ========================================== 
app.get('/', (req, res, next) => {

    // Aqui solo envio los datos que quiero mostrar de la entidad o coleccion usuario
    // en este caso no quise traer en la consulta el password
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => { // <--- linea 17

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios // < ----- si no da error retorno el usuarios de la linea #17
                });



            });
});

//OJO EL TOKEN SE ENVIA POR URL


// ==========================================
// Crear un nuevo usuario
// ==========================================

app.post('/', mdAuthenticationJWT.verificarToken, (req, res) => {

    //Recibo los datos en el body y con el body parser me lo transforma a JSON
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });


});

// ==========================================
// Actualizar un usuario
// ==========================================

app.put('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo
    //
    var id = req.params.id;

    //aplico este metodo de moongose para saber si el usuario existe
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con es ID' }
            });
        }


        //si entro a encontrado el usuario sin ningun problema
        var body = req.body;

        //aqui solo voy a cambiar estos 3 datos la imagen ya la cambio despues
        //lo mismo el password
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            //con este codigo me sobreescribe la contrasena pero solo para mostrar 
            // ya paso el save
            usuario.password = ":)";

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });

        });

    });


});



// ==========================================
// Borrar un usuario
// ==========================================
app.delete('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //capturo el id
    var id = req.params.id;

    //metodo que elimino
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: { message: 'No existe usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });


    });



});


module.exports = app;