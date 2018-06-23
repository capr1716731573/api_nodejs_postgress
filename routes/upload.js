var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

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
        Usuario.findById(id, (err, usuario_respuesta) => {
            //valido que el usuario exista 
            //valido si el usuario existe segun el id enviado
            if (!usuario_respuesta) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id ' + id + ' no existe',
                    errors: { message: 'No existe un usuario con es ID' }
                });
            }


            //verifico el path viejo de la imagen
            var pathViejo = './uploads/usuarios/' + usuario_respuesta.img;
            //si existe borro esa imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); //borro la imagen anterior
            }

            usuario_respuesta.img = nombreArchivo;
            usuario_respuesta.save((err, usuarioActualizado) => {

                //encontro un error al momento de hacer la actualziacion
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }
                //actualiza correctamente 
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizado',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital_respuesta) => {
            //valido que el usuario exista 
            //valido si el usuario existe segun el id enviado
            if (!hospital_respuesta) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con es ID' }
                });
            }

            //verifico el path viejo de la imagen
            var pathViejo = './uploads/hospitales/' + hospital_respuesta.img;
            //si existe borro esa imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); //borro la imagen anterior
            }

            hospital_respuesta.img = nombreArchivo;

            //actualizo el registro
            hospital_respuesta.save((err, hospitalActualizado) => {
                //encontro un error al momento de hacer la actualziacion
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Hospital Actualziada',
                    hospital: hospitalActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico_respuesta) => {
            //valido que el usuario exista 
            //valido si el usuario existe segun el id enviado
            if (!medico_respuesta) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con es ID' }
                });
            }


            //verifico el path viejo de la imagen
            var pathViejo = './uploads/medicos/' + medico_respuesta.img;
            //si existe borro esa imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); //borro la imagen anterior
            }

            medico_respuesta.img = nombreArchivo;

            //actualizo el registro
            medico_respuesta.save((err, medicoActualizado) => {
                //encontro un error al momento de hacer la actualziacion
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Medico Actualziada',
                    medico: medicoActualizado
                });
            });

        });
    }
}

module.exports = app;