var express = require('express');
var app = express();
var SEED = require('../config/config').SEED;
var rows = require('../config/config').ROWS_POR_PAG;
var mdAuthenticationJWT = require('../middlewares/authentication');

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
    // Aqui solo envio los datos que quiero mostrar de la entidad o coleccion Medico
    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        //numero de lineas que quiero que despliegue acorde al parametro "desde"
        .limit(rows)
        //como esta es una coleccion o entidad relacionada con la coleccion o entidad usuario
        // con populate digo que me envie toda la informacion del registro del objeto usuario
        //y al lado los campos de esa coleccion que quiero usar
        //el primero es igual al nombre de la propiedad medicoSchema
        .populate('usuario', 'nombre email')
        ////el primero es igual al nombre de la propiedad medicoSchema
        // lo mismo de arriba con el objeto hospital
        .populate('hospital', 'nombre')
        .exec(
            (err, medicos) => { // <--- linea 17

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos, // < ----- si no da error retorno el usuarios de la linea #17
                        total_registros: total
                    });
                });




            });


});


// ==========================================
// Crear un nuevo medicos
// ==========================================

app.post('/', mdAuthenticationJWT.verificarToken, (req, res) => {

    //Recibo los datos en el body y con el body parser me lo transforma a JSON
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });


});

// ==========================================
// Actualizar un medico
// ==========================================

app.put('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo
    //
    var id = req.params.id;

    //aplico este metodo de moongose para saber si el usuario existe
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
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
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });


});



// ==========================================
// Borrar un medico
// ==========================================
app.delete('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //capturo el id
    var id = req.params.id;

    //metodo que elimino
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe Medico con ese id',
                errors: { message: 'No existe Medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });


    });



});

module.exports = app;