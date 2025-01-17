const { Router } = require('express');
const {Technical_assistant} = require('../controllers/Technical_assistant')
const router = Router();

router.post('/technical', Technical_assistant)



module.exports = router;