const jwt = require('jsonwebtoken');
const {secretKey} = require('../config/index')

// Middleware para verificar el token

const verifyToken = (req, res, next) => { 
    const token = req.headers['x-access-token'];    
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido' });
        }
        // El token es válido
        req.userId = decoded.userId; 
        console.log(req.userId)
        next();
    });
}


module.exports = verifyToken;
