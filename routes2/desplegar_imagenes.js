var express = require('express');

var app = express();
//libreria para crear el path de  manera mas facil
const path = require('path');
const fs = require('fs');

//Rutas
app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo; //puede ser hospital , usuario o medicos
    var img = req.params.img; //id del registro en mongo DB

    var pathFile = `./uploads/${tipo}/${img}`;

    //compruebo si existe ese archivo
    if (!fs.existsSync(pathFile)) {
        pathFile = './assets/no-img.jpg';
    }
    res.sendFile(path.resolve(pathFile));



})

module.exports = app;