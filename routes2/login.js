var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
//GOOGLE CLIENTE ID
var CLIENT_ID_GOOGLE = require('../config/config').CLIENT_ID_GOOGLE;
var SECRET_ID_CLIENTE_GOOGLE = require('../config/config').SECRET_ID_CLIENTE_GOOGLE;

var app = express();

//variable de conexion a postgres
const pool = require('../config/db');

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



    //consulta si existen un registro del existente
    consulta = `SELECT * FROM usuarios WHERE email= $1`

    //1.- verificamos si existe un usuario con ese correo electronico

    pool.query(consulta, [googleUser.email], (err, response) => {
        console.log(JSON.stringify(response));
        //error al buscar usuario en la DB o en el servidor
        if (err) {
            return res.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario - Server',
                errors: err
            });
        }

        //Controla sino encuentra el usuario en la Base de Datos
        if (response.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });


            //Si hay valores escojo el primero, ya que si busco uno es xq debe serv unico
            var usuarioDB = response.rows[0];

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
            var usuario = {
                email: googleUser.email,
                password: googleUser.password,
                img: googleUser.img,
                google: true,
                nombre: googleUser.nombre,
                role: "USER_ROLE"
            };

            consulta = 'INSERT INTO usuarios (nombre, email, password, google, img, role) VALUES ($1,$2,$3,$4,$5,$6)';

            pool.query(consulta, [
                usuario.nombre,
                usuario.email,
                usuario.password,
                usuario.google,
                usuario.img,
                usuario.role
            ], (err, response) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }

                res.status(201).json({
                    ok: true,
                    mensaje: "El usuario " + usuario.nombre + ", se ingreso con exito!!"
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

    var usuario = {
        email: body.email,
        password: body.password
    };

    //consulta si existen un registro del existente
    consulta = `SELECT * FROM usuarios WHERE email= $1`

    //1.- verificamos si existe un usuario con ese correo electronico

    pool.query(consulta, [usuario.email], (err, response) => {

        //error al buscar usuario en la DB o en el servidor
        if (err) {
            return res.status(500).json({
                ok: false,
                mesaje: 'Error al buscar usuario - Server',
                errors: err
            });
        }

        //Controla sino encuentra el usuario en la Base de Datos
        if (response.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        console.log(response);
        //Si hay valores escojo el primero, ya que si busco uno es xq debe serv unico
        var usuarioDB = response.rows[0];


        //var pass = response.rows[0].password;
        //verificaos contrasena - compara un string con otro que ya utilizo el bcrypt
        if (!bcryptjs.compareSync(usuario.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        console.log('Son iguales');

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