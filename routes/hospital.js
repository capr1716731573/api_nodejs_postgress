var express = require('express');
var app = express();
var SEED = require('../config/config').SEED;
var rows = require('../config/config').ROWS_POR_PAG;
var mdAuthenticationJWT = require('../middlewares/authentication');

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Hospital = require('../models/hospital');

//Rutas
// ==========================================
// Obtener todos los hospitales
// ========================================== 
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    // Aqui solo envio los datos que quiero mostrar de la entidad o coleccion Hospital
    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        //numero de lineas que quiero que despliegue acorde al parametro "desde"
        .limit(rows)
        //como esta es una coleccion o entidad relacionada con la coleccion o entidad usuario
        // con populate digo que me envie toda la informacion del registro del objeto usuario
        //y al lado los campos de esa coleccion que quiero usar
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => { // <--- linea 17

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales, // < ----- si no da error retorno el usuarios de la linea #17
                        total_registros: total
                    });
                });




            });


});

// ==========================================
//  Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {

        var id = req.params.id;

        Hospital.findById(id)
            .populate('usuario', 'nombre img email')
            .exec((err, hospital) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar hospital',
                        errors: err
                    });
                }

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id ' + id + 'no existe ',
                        errors: {
                            message: 'No existe un hospital con ese ID '
                        }
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });

            })

    })
    // ==========================================
    // Crear un nuevo hospitales
    // ==========================================

app.post('/', mdAuthenticationJWT.verificarToken, (req, res) => {

    //Recibo los datos en el body y con el body parser me lo transforma a JSON
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });


});

// ==========================================
// Actualizar un hospital
// ==========================================

app.put('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //con req.params.PARAMETRO .. recibe el parametro que envio en la peticion PUT con el campo id (/:id) que es igual al nombre del modelo
    //
    var id = req.params.id;

    //aplico este metodo de moongose para saber si el usuario existe
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con es ID' }
            });
        }


        //si entro a encontrado el usuario sin ningun problema
        var body = req.body;

        //aqui solo voy a cambiar estos 3 datos la imagen ya la cambio despues
        //lo mismo el password
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });


});



// ==========================================
// Borrar un hospital
// ==========================================
app.delete('/:id', mdAuthenticationJWT.verificarToken, (req, res) => {
    //capturo el id
    var id = req.params.id;

    //metodo que elimino
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe Hospital con ese id',
                errors: { message: 'No existe Hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });


    });



});

module.exports = app;