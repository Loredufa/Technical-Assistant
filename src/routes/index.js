const { Router } = require('express');
const router = Router();
const verifyToken = require('../utils/middlewares/verifyToken');


const agenteRoute = require('./getAgente');


router.use('/assistant', verifyToken, agenteRoute)





module.exports = router;