var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre	es necesario'] },
    img: { type: String, required: false },
    //con esto tengo que mandar el id del usuario que grabo
    //usuario: { type: Schema.Types.ObjectId, ref: '<nombre con el que se asigna el schema en la linea mongoose.model('nombre', hospitalSchema); >' }
    //TODA ESTA CONFIGURACION ES A NIVEL DE MOONGOSE NO DE MONGODB
    usuario: { type: Schema.Types.ObjectId, ref: 'usuarios' }
    //--> Aqui digo que en el caso de no crear la coleccion o entidad, esta se crea al ingresar el primer registro
    //entonces con la sentencia "collection: 'hospitales'" le digo que se cree con ese nombre 'hospitales'
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);