//defino los valores que puede tener el campo rol
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'], //valores permitidos
    message: '{VALUE} no es un rol permitido' //mensaje si ingresa un valor que no esta permitido
}

var Usuario = {
    _id: number,
    nombre: string,
    email: string,
    password: string,
    rol: string,
    google: boolean,
    img: string
}

module.exports = Usuario;