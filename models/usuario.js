//Configuracion 1 --> Importo mongoose y creo el squema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//plugin de moongose que valida y genera mensaje de validacion de todos los campos unique
var uniqueValidator = require('mongoose-unique-validator');

//defino los valores que puede tener el campo rol
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'], //valores permitidos
    message: '{VALUE} no es un rol permitido' //mensaje si ingresa un valor que no esta permitido
}

//Configuracion 2 --> esto es como una interfas o persiatencia de mongodb a nodejs
var usuarioSchema = new Schema({
    //aqui le digo a mongoose el tipo de dato, si es requerido etc
    nombre: { type: String, required: [true, "El nombre es necesario"] },
    email: { type: String, unique: true, required: [true, "El correo es necesario"] },
    password: { type: String, required: [true, 'La contrasena es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

//enlazo el plugin al schema para validar los unique
usuarioSchema.plugin(uniqueValidator, { message: ' {PATH} debe ser unico..' });

//para poder utilizar este archivo o variable en otras archivos ejm. app.js
//aqui se relaciona el nombre de la coleccion en mongo con el schema del modelo creado
module.exports = mongoose.model('usuarios', usuarioSchema);