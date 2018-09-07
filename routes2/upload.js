var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

//variable de conexion a postgres
const pool = require('../config/db');

//Declaracion de Modelos
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

var extensionesPermitidas = require('../config/config').EXTENSIONES_PERMITIDAS;

//Middleware fileUpload
app.use(fileUpload());

app.put('/:tipo/:id', function(req, res) {
    //que tipo de imagen quiero subir si es de Medico, Hospital, Usuario
    var tipo = req.params.tipo;
    var id = req.params.id;

    //error si non hay archivo para subir
    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //obtener nombre del archivo333333
    var archivo = req.files.imagen_postman;
    //extraer extendion de archivo
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Valido que el archivo tenga la extension valida acorde a la variable de configuraciones
    if (extensionesPermitidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no Valida',
            errors: { message: 'Las extensiones validas son ' + extensionesPermitidas.join(', ') }
        });
    }

    //Nombre del Archivo <nombre>-<#ramdom>.<extension>
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    //Mover el Archivo a un path o carpeta del server
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            })
        }
    })

    //funcion para subir y actualizar registro en la tabla o coleection de Usuario, Hospitales, Medicos
    subirArchivoPorTipo(tipo, id, nombreArchivo, res);

    /* res.status(200).json({
        ok: true,
        mensaje: 'Archivo Movido',
        extensionArchivo: extensionArchivo
    }); */

});

//Funcion para actualizar la imagen en hospital , medicos o usuarios
function subirArchivoPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        //consulta si existen un registro del existente
        consulta = `SELECT * FROM usuarios WHERE _id= ${ id }`;
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

            var usuario_respuesta = {};
            usuario_respuesta = response.rows[0];
            //verifico el path viejo de la imagen
            var pathViejo = './uploads/usuarios/' + usuario_respuesta.img;
            //si existe borro esa imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); //borro la imagen anterior
            }

            consulta = "UPDATE usuarios SET img=$1 WHERE _id=" + id + " RETURNING json_build_object ('_id',_id,'nombre',nombre,'email',email,'password',password,'google',google,'img',img,'role',role)";

            pool.query(consulta, [nombreArchivo], (err, response) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: response.rows[0].json_build_object
                });

            });

        })

    } else

    if (tipo === 'hospitales') {
        //consulta si existen un registro del existente
        consulta = `SELECT * FROM hospitales WHERE _id= ${ id }`;
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

            var hospital_respuesta = {};
            hospital_respuesta = response.rows[0];
            //verifico el path viejo de la imagen
            var pathViejo = './uploads/hospitales/' + hospital_respuesta.img;
            //si existe borro esa imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); //borro la imagen anterior
            }

            consulta = `UPDATE hospitales SET img=$1 WHERE _id=${id} RETURNING json_build_object ('_id',_id,'nombre',nombre,'usuario',usuario,'img',img)`;

            pool.query(consulta, [nombreArchivo], (err, response) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: response.rows[0].json_build_object
                });

            });

        })
    } else

    if (tipo === 'medicos') {
        //consulta si existen un registro del existente
        consulta = `SELECT * FROM medicos WHERE _id= ${ id }`;
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

            var medico_respuesta = {};
            medico_respuesta = response.rows[0];
            //verifico el path viejo de la imagen
            var pathViejo = './uploads/medicos/' + medico_respuesta.img;
            //si existe borro esa imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); //borro la imagen anterior
            }

            consulta = `UPDATE medicos SET img=$1 WHERE _id=${id} RETURNING json_build_object ('_id',_id,'nombre',nombre,'usuario',usuario,'hospital',hospital,'img',img)`;

            pool.query(consulta, [nombreArchivo], (err, response) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: response.rows[0].json_build_object
                });

            });

        })
    }
}

module.exports = app;