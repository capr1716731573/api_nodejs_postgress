var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==========================================
// Verificar token
// verifica que el token JWT de login sea valido y no haya expirado, si es asi me deja ejecutar el PUT, DELETE , CREATE 
////OJO EL TOKEN SE ENVIA POR URL
// ==========================================
exports.verificarToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token Incorrecto',
                errors: err
            });
        }

        req.usuario = decode.usuario;

        //este si esta bien el token me permite avanzar a la siguiente fase del codigo
        next();

    });

};

//VERIFICA SI EL USUARIO LOGUEADO ES ADMINISTRADOR ADMIN_ROLE
exports.verificarADMIN_ROLE = function(req, res, next) {
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token Incorrecto - No es administrador',
            errors: { message: "No es administrador, no puede realizar esa accion" }
        });
    }

};

//VERIFICA SI EL USUARIO LOGUEADO ES ADMINISTRADOR ADMIN_ROLE
exports.verificarADMIN_o_MISMO_USUARIO = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token Incorrecto - No es administrador, ni el mismo usuario',
            errors: { message: "No es administrador, no puede realizar esa accion" }
        });
    }

};