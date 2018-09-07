var express = require('express');
var app = express();
var SEED = require('../config/config').SEED;
var rows = require('../config/config').ROWS_POR_PAG;
var mdAuthenticationJWT = require('../middlewares/authentication');
//variable de conexion a postgres
const pool = require('../config/db');

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Hospital = require('../models/hospital');

//Rutas
// ==========================================
// Obtener todos los hospitales
// ========================================== 
app.get('/', (req, res, next) => {
    //parametro que envio en el requeest para ver a partir de que fila empezar
    var desde = req.query.desde || 0;
    desde = Number(desde);
    total_registros = 0;
    consulta_total_rows = 'SELECT count(*) FROM hospitales';
    pool.query(consulta_total_rows, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando cantidad hospitales',
                errors: err
            });
        }

        total_registros = Number(response.rows[0].count);

        //valido que exista el parametro "desde"
        if (req.query.desde) {
            consulta = `SELECT * FROM hospitales LIMIT ${ rows } OFFSET ${ desde }`;
        } else {
            consulta = `SELECT * FROM hospitales`;
        }

        pool.query(consulta, (err, response) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            //res.json(response.rows);
            res.status(200).json({
                ok: true,
                hospitales: response.rows, // < ----- si no da error retorno el usuarios de la linea #17
                total_registros: total_registros
            });

        })
    })



});

// ==========================================
//  Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
        //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo
        var id = req.params.id;

        //consulta si existen un registro del existente
        consulta = `SELECT * FROM hospitales WHERE _id= ${ id }`;

        //aplico este metodo de moongose para saber si el usuario existe
        pool.query(consulta, (err, response) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (response.rowCount <= 0) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con es ID' }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: response.rows[0]
            });

        })

    })
    // ==========================================
    // Crear un nuevo hospitales
    // ==========================================

app.post('/', mdAuthenticationJWT.verificarToken, (req, res) => {

    ///Recibo los datos en el body y con el body parser me lo transforma a JSON
    var body = req.body;

    var hospital = {
        nombre: body.nombre,
        usuario: req.usuario._id,
        img: body.img
    };

    consulta = "INSERT INTO hospitales (nombre,usuario, img) VALUES ($1,$2,$3) RETURNING json_build_object ('id',_id,'nombre',nombre,'usuario',usuario,'img',img)";

    pool.query(consulta, [hospital.nombre, hospital.usuario, hospital.img], (err, response) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: response.rows[0].json_build_object
        });
    });


});

// ==========================================
// Actualizar un hospital
// ==========================================

app.put('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo

    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM hospitales WHERE _id= ${ id }`;

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
        var hospital = {};
        hospital.nombre = body.nombre;
        hospital.img = body.img;

        consulta = `UPDATE hospitales SET nombre=$1, img=$2 WHERE _id=${id} RETURNING json_build_object ('id',_id,'nombre',nombre,'usuario',usuario,'img',img)`;

        pool.query(consulta, [hospital.nombre, hospital.img], (err, response) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                hospital: response.rows[0].json_build_object,
                usuarioToken: req.usuario
            });

        });

    });
});



// ==========================================
// Borrar un hospital
// ==========================================
app.delete('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {

    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo

    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM hospitales WHERE _id= ${ id }`;

    //aplico este metodo de moongose para saber si el usuario existe
    pool.query(consulta, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (response.rowCount <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un hospital con es ID'
                }
            });
        }

        //consulta si existen un registro del existente
        consulta = `DELETE FROM hospitales WHERE _id= ${ id }`;
        pool.query(consulta, (err, response) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al eliminar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'El hospital con el ID *' + id + '*, ha sido eliminado',
                usuarioToken: req.usuario
            });

        });

    });


});

module.exports = app;