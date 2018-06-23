var express = require('express');

var app = express();

//DECLARACION DE VARIABLES DE MODELS O SCHEMAS QUE DESEO QUE SE INCLUYAN EN LA BUSQUEDA
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==============================
// Busqueda general
// ==============================
app.get('/todo/:parametrobusqueda', (req, res, next) => {
    var busqueda = req.params.parametrobusqueda;
    //creo una expresion regular para que la palabra que mando a buscar en las tabla se busque en minusculas o mayusculas
    var expresionregular = new RegExp(busqueda, 'i');

    //Promise. all es una funcion de javascript que ejecuta varias promesas en paralelo como un arreglo
    Promise.all([
            buscarHospitales(busqueda, expresionregular),
            buscarMedicos(busqueda, expresionregular),
            buscarUsuarios(busqueda, expresionregular)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0], //en la posicion 0 esta el arreglo de hospitales
                medicos: respuestas[1], //en la posicion 1 esta el arreglo de medicos
                usuarios: respuestas[2] //en la posicion 2 esta el arreglo de usuarios
            });
        })


});

// ==========================================
// Busqueda por coleccion o tabla especifica
// ==========================================
app.get('/coleccion/:tabla/:palabra', (req, res, next) => {
    var busqueda = req.params.palabra;
    var tabla = req.params.tabla;
    var expresionregular = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, expresionregular);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, expresionregular);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, expresionregular);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda en la tabla son solo : usuarios, medicos, hospitales',
                error: { mensaje: 'Tipo de tabla/coleccion no valido' }
            });

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            //aqui asigno dinamicamente el nombre del campo del json acorde al valor del parametro
            [tabla]: data
        });
    });

});

//CREO PROMESAS POR SEPARADO PARA BUSCAR EL RESULTADO DE LA TABLA USUARIOS HOSPITALES MEDICOS
function buscarHospitales(palabrabusqueda, expresionregular) {
    return new Promise((resolve, reject) => { // Retorno una promesa de la funcion
        Hospital.find({ nombre: expresionregular }) //El campo nombre de la coleccion o tabla Medicos es donde se va a comparar el parametro de busqueda
            //Como va relacionado la tabla Medico con Usuario, quiero que en ves de que solo me salga el id del usuario, me salga los campos nombre email
            .populate('usuario', 'nombre email')
            .exec((err, hospitales_arreglo) => {
                if (err) {
                    reject('Error al cargar datos de Hospitales', err);
                } else {
                    //retorno un arreglo de hospitales_arreglo
                    resolve(hospitales_arreglo)
                }
            });
    });
}

function buscarMedicos(palabrabusqueda, expresionregular) {
    return new Promise((resolve, reject) => { // Retorno una promesa de la funcion
        Medico.find({ nombre: expresionregular }) //El campo nombre de la coleccion o tabla Medicos es donde se va a comparar el parametro de busqueda
            //Como va relacionado la tabla Medico con Usuario, quiero que en ves de que solo me salga el id del usuario, me salga los campos nombre email
            .populate('usuario', 'nombre email')
            //aqui cargo todos los campos de la tabla hospital
            .populate('hospital')
            .exec((err, medicos_arreglo) => {
                if (err) {
                    reject('Error al cargar datos de medicos', err);
                } else {
                    //retorno un arreglo de medicos
                    resolve(medicos_arreglo)
                }
            });
    });
}

function buscarUsuarios(palabrabusqueda, expresionregular) {
    return new Promise((resolve, reject) => { // Retorno una promesa de la funcion
        Usuario.find({}, 'nombre email role') //Aqui solo quiero que me despliegue de usuarios el nombre email role
            .or([{ 'nombre': expresionregular }, { 'email': expresionregular }]) //aqui la pablabra para buscar va a buscar por nombr e email
            .exec((err, usuarios_arreglo) => {
                if (err) {
                    reject('Error al cargar datos de Usuarios', err);
                } else {
                    //retorno un arreglo de usuarios_arreglo
                    resolve(usuarios_arreglo)
                }
            });
    });
}

module.exports = app;