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
            return res.status(500).json({
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