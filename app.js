// Requires : importacion de librerias de terceros o personalizadas que ocupamos para que funcione el servidor
var express = require('express');
var moongose = require('mongoose');


//Inicializar variables
var app = express();

//Conexion a la Base de Datos
moongose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');

});


//Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petici[on realizada correctamente'
    })
})


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});