var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
//GOOGLE CLIENTE ID
var CLIENT_ID_GOOGLE = require('../config/config').CLIENT_ID_GOOGLE;
var SECRET_ID_CLIENTE_GOOGLE = require('../config/config').SECRET_ID_CLIENTE_GOOGLE;

var app = express();

//Configuracion1 --> importo el modelo de usuario en la carpeta models 
var Usuario = require('../models/usuario');

//Google
const { OAuth2Client } = require('google-auth-library');
const cloAuth2Clientient = new OAuth2Client(CLIENT_ID_GOOGLE);

//Importo Middlewar
var mdAutenticacion = require('../middlewares/authentication');

//=====================================================
//Renovar Token
//=====================================================
app.get('/renovartoken', mdAutenticacion.verificarToken, (req, res) => {
    //Vuelvo a generar token
    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 })
    res.status(200).json({
        ok: true,
        token: token
    });

})

//=====================================================
//Auntenticacion de Google
//=====================================================
//Async --> Funcion que retorna una promesa 
async function verify(token_google) {

    const ticket = await cloAuth2Clientient.verifyIdToken({
        idToken: token_google,
        audience: CLIENT_ID_GOOGLE
    });

    const informacion_user_google = ticket.getPayload();


    return {

        nombre: informacion_user_google.name,
        email: informacion_user_google.email,
        img: informacion_user_google.picture,
        google: true,
        user: informacion_user_google
    }
}


app.post('/google', async(req, res) => {
    var token_google = req.body.token_google || '';


    //await me dice que espere a que esa funcion retorne la respues y esa respuesta sea asignada a googleUser
    //CASO CONTRARIO RETORNO EL ERROR
    var googleUser;
    try {
        googleUser = await verify(token_google);
    } catch (error) {
        return res.status(403).send({
            ok: false,
            mensaje: 'Token no válida',
            error: error.message
        });
    }


    //Verificar si el correo de ese usuario de google ya existe en la base de datos
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario - Server'
                });
            }
        }

        if (usuarioDB) {
            //si no es un usuario de google mando un mensaje que se autentico normalmente
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal '
                });
            } else {
                //si es un usuario de google genero token
                //creo el token
                //1.-Instalamos jsonwebtoken --->  npm install jsonwebtoken --save
                //var token = jwt.sign({ PAYLOD o cuerpo del token }, 'SEMILLA O PARABRA QUE SE ENCIPTA PARA GENERAL EL TOKEN', { expiresIn: FECHA DE EXPIRACION DEL TOKEN })
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token, // con este valor vamos a la pagina del jsonwebtoken y nos muestra lo que dice todo es codigo del jsonwebtoken y si es valido o no
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            //el usuario no existe y hay que crearlo....
            var usuario_nuevo = new Usuario();
            usuario_nuevo.nombre = googleUser.nombre;
            usuario_nuevo.email = googleUser.email;
            usuario_nuevo.img = googleUser.img;
            usuario_nuevo.google = true;
            usuario_nuevo.password = ':)';

            usuario_nuevo.save((err, usuarioDB) => {
                //creo el token
                //1.-Instalamos jsonwebtoken --->  npm install jsonwebtoken --save
                //var token = jwt.sign({ PAYLOD o cuerpo del token }, 'SEMILLA O PARABRA QUE SE ENCIPTA PARA GENERAL EL TOKEN', { expiresIn: FECHA DE EXPIRACION DEL TOKEN })
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token, // con este valor vamos a la pagina del jsonwebtoken y nos muestra lo que dice todo es codigo del jsonwebtoken y si es valido o no
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            });

        }

    });


});


//=====================================================
//Auntenticacion Normal
//=====================================================
app.post('/', (req, res) => {
    var body = req.body;

    //1.- verificamos si existe un usuario con ese correo electronico
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        //error al buscar usuario en la DB o en el servidor
        if (err) {
            return res.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario - Server',
                errors: err
            });
        }

        //Controla sino encuentra el usuario en la Base de Datos
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        //verificaos contrasena - compara un string con otro que ya utilizo el bcrypt
        if (!bcryptjs.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //creo el token
        //1.-Instalamos jsonwebtoken --->  npm install jsonwebtoken --save
        //var token = jwt.sign({ PAYLOD o cuerpo del token }, 'SEMILLA O PARABRA QUE SE ENCIPTA PARA GENERAL EL TOKEN', { expiresIn: FECHA DE EXPIRACION DEL TOKEN })
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token, // con este valor vamos a la pagina del jsonwebtoken y nos muestra lo que dice todo es codigo del jsonwebtoken y si es valido o no
            id: usuarioDB.id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });



});

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',

            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rsjx', url: '/rsjx' }
            ]

        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //{ titulo: 'Usuarios', url: '/usuarios' }, solo se muestra si es ADMIN_ROLE
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ]
        }

    ];

    //aqui valido si es admin o user role
    if (ROLE === 'ADMIN_ROLE') {
        //unshift lo pone al elemento del objeto json al principio de la linea
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}

//tengo que exportar para usar este archivo en otro lugar
module.exports = app;