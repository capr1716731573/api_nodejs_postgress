var express = require('express');

var app = express();

//variable de conexion a postgres
const pool = require('../config/db');

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
        consulta = `SELECT * FROM hospitales WHERE nombre LIKE '%${palabrabusqueda}%'`;
        pool.query(consulta, (err, response) => {
            if (err) {
                reject('Error al cargar datos de hospitales', err);
            } else {
                resolve(response.rows)
            }

        })

    });
}

function buscarMedicos(palabrabusqueda, expresionregular) {
    return new Promise((resolve, reject) => { // Retorno una promesa de la funcion
        consulta = `SELECT * FROM medicos WHERE nombre LIKE '%${palabrabusqueda}%'`;
        pool.query(consulta, (err, response) => {
            if (err) {
                reject('Error al cargar datos de medicos', err);
            } else {
                resolve(response.rows)
            }

        })

    });
}

function buscarUsuarios(palabrabusqueda, expresionregular) {
    return new Promise((resolve, reject) => { // Retorno una promesa de la funcion
        consulta = `SELECT * FROM usuarios WHERE nombre LIKE '%${palabrabusqueda}%' OR email LIKE '%${palabrabusqueda}%'`;
        pool.query(consulta, (err, response) => {
            if (err) {
                reject('Error al cargar datos de Usuarios', err);
            } else {
                resolve(response.rows)
            }

        })

    });
}

module.exports = app;