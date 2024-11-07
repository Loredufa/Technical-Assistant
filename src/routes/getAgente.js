const { Router } = require('express');
const {addTickets} = require('../controllers/Beta')
const {Technical_assistant} = require('../controllers/Technical_assistant')
const router = Router();

router.post('/beta', addTickets)
router.post('/technical', Technical_assistant)



module.exports = router;