const { response } = require('express'); 
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

//REGISTER
const crearUsuario = async (req, res = response ) => {

    const { email, password } = req.body;

    try {

        let usuario = await Usuario.findOne({ email });

        if( usuario ){
            res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe con ese email'
            })
        }
        
        usuario = new Usuario( req.body );

        const salt = bcrypt.genSaltSync();

        usuario.password = bcrypt.hashSync( password, salt );
    
        await usuario.save();

        //Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );
    
        res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }

}

//LOGIN
const loginUsuario = async (req, res = response ) => {

    const { email, password } = req.body;

    try {
        
        let usuario = await Usuario.findOne({ email });

        if( !usuario ){
            res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        }

        //confirmar la contraseña
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if( !validPassword ){
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        //Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );

        res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }

}

//RENEW TOKEN
const renewToken = async (req, res = response ) => {

    const { uid, name } = req;

    //Generar token
    const token = await generarJWT( uid, name );


    res.json({
        ok: true,
        uid,
        name,
        token
    })
}


module.exports = {
    crearUsuario,
    loginUsuario,
    renewToken
}

