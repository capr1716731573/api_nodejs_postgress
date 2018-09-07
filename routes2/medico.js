var express = require('express');
var app = express();
var SEED = require('../config/config').SEED;
var rows = require('../config/config').ROWS_POR_PAG;
var mdAuthenticationJWT = require('../middlewares/authentication');

//variable de conexion a postgres
const pool = require('../config/db');

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Medico = require('../models/medico');

//Rutas
// ==========================================
// Obtener todos los medicos
// ========================================== 
app.get('/', (req, res, next) => {
    //parametro que envio en el requeest para ver a partir de que fila empezar
    var desde = req.query.desde || 0;
    desde = Number(desde);
    total_registros = 0;

    consulta_total_rows = 'SELECT count(*) FROM medicos';
    pool.query(consulta_total_rows, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando cantidad medicos',
                errors: err
            });
        }

        total_registros = Number(response.rows[0].count);

        //valido que exista el parametro "desde"
        if (req.query.desde) {
            consulta = `SELECT * FROM medicos LIMIT ${ rows } OFFSET ${ desde }`;
        } else {
            consulta = `SELECT * FROM medicos`;
        }


        pool.query(consulta, (err, response) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            //res.json(response.rows);
            res.status(200).json({
                ok: true,
                medicos: response.rows, // < ----- si no da error retorno el usuarios de la linea #17
                total_registros: total_registros
            });

        })
    })

});


// ==========================================
// Obtener un medico po ID
// ========================================== 

app.get('/:id', (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo
    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM medicos WHERE _id= ${ id }`;

    //aplico este metodo de moongose para saber si el usuario existe
    pool.query(consulta, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (response.rowCount <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con es ID' }
            });
        }
        console.log(response);
        res.status(200).json({
            ok: true,
            medico: response.rows[0]
        });

    })
});

// ==========================================
// Crear un nuevo medicos
// ==========================================

app.post('/', mdAuthenticationJWT.verificarToken, (req, res) => {

    //Recibo los datos en el body y con el body parser me lo transforma a JSON
    var body = req.body;

    var medico = {
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital,
        img: body.img
    };

    consulta = "INSERT INTO medicos (nombre, usuario, hospital, img) VALUES ($1,$2,$3,$4) RETURNING json_build_object ('_id',_id,'nombre',nombre,'usuario',usuario,'hospital',hospital,'img',img)";

    pool.query(consulta, [medico.nombre, medico.usuario, medico.hospital, medico.img], (err, response) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            //SE UTILIZA EL json_build_object XQ ESTA OPCION VIENE DE POSTGRES 
            //LA TRA PARTE response.rows[0] ES DE pg de express en postgres y nodejs
            medico: response.rows[0].json_build_object
        });
    });



});

// ==========================================
// Actualizar un medico
// ==========================================

app.put('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo

    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM medicos WHERE _id= ${ id }`;

    //aplico este metodo de moongose para saber si el usuario existe
    pool.query(consulta, (err, response) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (response.rowCount <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con es ID' }
            });
        }


        //si entro a encontrado el usuario sin ningun problema
        var body = req.body;

        //aqui solo voy a cambiar estos 3 datos la imagen ya la cambio despues
        //lo mismo el password
        var medico = {};
        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.img = body.img;

        console.log(medico)
        consulta = `UPDATE medicos SET nombre=$1, hospital=$2, img=$3 WHERE _id=${id} RETURNING json_build_object ('_id',_id,'nombre',nombre,'usuario',usuario,'hospital',hospital,'img',img)`;

        pool.query(consulta, [medico.nombre, medico.hospital, medico.img], (err, response) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                medico: response.rows[0].json_build_object,
                usuarioToken: req.usuario
            });

        });

    });



});



// ==========================================
// Borrar un medico
// ==========================================
app.delete('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo

    var id = req.params.id;

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM medicos WHERE _id = ${ id }`;

    //aplico este metodo de moongose para saber si el usuario existe
    pool.query(consulta, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (response.rowCount <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un medico con es ID'
                }
            });
        }

        //consulta si existen un registro del existente
        consulta = `DELETE FROM medicos WHERE _id = ${ id }`;
        pool.query(consulta, (err, response) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al eliminar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'El medico con el ID *' + id + '*, ha sido eliminado',
                usuarioToken: req.usuario
            });

        });

    });


});

module.exports = app;