//Configuracion 1 -> Requires : importacion de librerias de terceros o personalizadas que ocupamos para que funcione el servidor
//Cada libreira requiere que se instale desde consola el npm install
var express = require('express');
var moongose = require('mongoose');
var bodyParser = require('body-parser');

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes2/usuario');
var loginRoutes = require('./routes2/login');
var hospitalRoutes = require('./routes2/hospital');
var medicoRoutes = require('./routes2/medico');
var busquedaRoutes = require('./routes2/busquedatodo');
var uploadRoutes = require('./routes2/upload');
var desplegarImagenesuploadRoutes = require('./routes2/desplegar_imagenes');

//Inicializar variables 
var app = express();

//Habilitar CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTIONS", );
    next();
});

//Configuracion Body-Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configuracion 3 --> Conexion a la Base de Datos
/* moongose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');

}); */


//Rutas
//se declara middleware: codigo que se ejecuta antes de que se resuelvan otras rutas
app.use('/usuario', usuarioRoutes); // en el POSTMAN yo pongo solo este ruta localhost:3000/usuario y lo unico que difirencia es POST GET PUT DELETE
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', desplegarImagenesuploadRoutes);
app.use('/', appRoutes);

//Configuracion 2 ->Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});