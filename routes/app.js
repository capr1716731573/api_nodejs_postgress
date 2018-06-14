//Configuracion 1 --> Defina la ruta principal de todas las rutas
// todas las rutas van a estar en la carpeta "routes"
var express = require('express');

var app = express();

//Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petici[on realizada correctamente, desde archivo app.js en carpeta routes'
    })
})

module.exports = app;