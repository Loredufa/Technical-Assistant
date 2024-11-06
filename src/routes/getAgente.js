const { Router } = require('express');
const {addTickets} = require('../controllers/Beta')
const router = Router();

router.post('/beta', addTickets)



module.exports = router;