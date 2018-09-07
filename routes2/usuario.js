var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var rows = require('../config/config').ROWS_POR_PAG;

var mdAuthenticationJWT = require('../middlewares/authentication');

var app = express();

//variable de conexion a postgres
const pool = require('../config/db');

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Usuario = require('../models/usuario');

//Rutas
// ==========================================
// Obtener todos los usuarios
// ========================================== 
app.get('/', (req, res, next) => {
    //parametro que envio en el requeest para ver a partir de que fila empezar
    var desde = req.query.desde || 0;
    desde = Number(desde);
    total_registros = 0;

    consulta_total_rows = 'SELECT count(*) FROM usuarios';
    pool.query(consulta_total_rows, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando cantidad usuarios',
                errors: err
            });
        }

        total_registros = Number(response.rows[0].count);

        //valido que exista el parametro "desde"
        if (req.query.desde) {
            consulta = `SELECT * FROM usuarios LIMIT ${ rows } OFFSET ${ desde }`;
        } else {
            consulta = `SELECT * FROM usuarios`;
        }

        pool.query(consulta, (err, response) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            //res.json(response.rows);
            res.status(200).json({
                ok: true,
                usuarios: response.rows, // < ----- si no da error retorno el usuarios de la linea #17
                total_registros: total_registros
            });

        })
    })
});

//OJO EL TOKEN SE ENVIA POR URL


// ==========================================
// Crear un nuevo usuario
// ==========================================
//app.post('/', mdAuthenticationJWT.verificarToken
app.post('/', (req, res) => {

    //Recibo los datos en el body y con el body parser me lo transforma a JSON
    var body = req.body;

    var usuario = {
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        google: body.google,
        img: body.img,
        role: body.role
    };

    consulta = "INSERT INTO usuarios (nombre, email, password, google, img, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING json_build_object ('_id',_id,'nombre',nombre,'email',email,'password',password,'google',google,'img',img,'role',role)";

    pool.query(consulta, [
        usuario.nombre,
        usuario.email,
        usuario.password,
        usuario.google,
        usuario.img,
        usuario.role
    ], (err, response) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: response.rows[0].json_build_object
        });
    });

});

// ==========================================
// Actualizar un usuario
// ==========================================

//[mdAuthenticationJWT.verificarToken, mdAuthenticationJWT.verificarADMIN_ROLE/]
//son middlewares de validaciones, donde si dan true realiza las acciones caso contrario no 

app.put('/:id', [mdAuthenticationJWT.verificarToken, mdAuthenticationJWT.verificarADMIN_o_MISMO_USUARIO], (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo

    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM usuarios WHERE _id= ${ id }`;

    //aplico este metodo de moongose para saber si el usuario existe
    pool.query(consulta, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (response.rowCount <= 0) {
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
        var usuario = {};
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        consulta = "UPDATE usuarios SET nombre=$1, email=$2, role=$3 WHERE _id=$4 RETURNING json_build_object ('_id',_id,'nombre',nombre,'email',email,'password',password,'google',google,'img',img,'role',role)";

        pool.query(consulta, [usuario.nombre, usuario.email, usuario.role, id], (err, response) => {

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
            console.log(response);
            res.status(200).json({
                ok: true,
                usuario: response.rows[0].json_build_object,
                usuarioToken: req.usuario
            });

        });

    });


});



// ==========================================
// Borrar un usuario
// ==========================================
app.delete('/:id', [mdAuthenticationJWT.verificarToken, mdAuthenticationJWT.verificarADMIN_o_MISMO_USUARIO], (req, res) => {

    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo

    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM usuarios WHERE _id= ${ id }`;

    //aplico este metodo de moongose para saber si el usuario existe
    pool.query(consulta, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (response.rowCount <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con es ID' }
            });
        }

        //consulta si existen un registro del existente
        consulta = `DELETE FROM usuarios WHERE _id= ${ id }`;
        pool.query(consulta, (err, response) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al eliminar usuario',
                    errors: err
                });
            }


            console.log(response);
            res.status(200).json({
                ok: true,
                mensaje: 'El usuario con el ID *' + id + '*, ha sido eliminado',
                usuarioToken: req.usuario
            });

        });

    });

});

module.exports = app;