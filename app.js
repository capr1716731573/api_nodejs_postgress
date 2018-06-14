//Configuracion 1 -> Requires : importacion de librerias de terceros o personalizadas que ocupamos para que funcione el servidor
//Cada libreira requiere que se instale desde consola el npm install
var express = require('express');
var moongose = require('mongoose');
var bodyParser = require('body-parser');

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//Inicializar variables 
var app = express();

//Configuracion Body-Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configuracion 3 --> Conexion a la Base de Datos
moongose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');

});


//Rutas
//se declara middleware: codigo que se ejecuta antes de que se resuelvan otras rutas
app.use('/usuario', usuarioRoutes); // en el POSTMAN yo pongo solo este ruta localhost:3000/usuario y lo unico que difirencia es POST GET PUT DELETE
app.use('/login', loginRoutes)
app.use('/', appRoutes);

//Configuracion 2 ->Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});