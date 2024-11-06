const express = require('express');
const morgan =require('morgan')
const routes = require('./src/routes/index')
const app = express();
const cors = require('cors')
const errorHandler = require('./src/utils/middlewares/errorHandler')
const setHeader = require('./src/utils/middlewares/setHeader')
const {PORT} = require('./src/utils/config/index')
const expressJson = express.json(); 
const bodyParser  = express.urlencoded({extended: true});
require("dotenv").config();
const fileUpload = require('express-fileupload')

//Headers
app.use(cors())
app.use(express.urlencoded({extended:true, limit: "50mb"}));
app.use(express.json());
app.use(morgan('dev'))
app.use(setHeader)

app.use([expressJson, bodyParser])


//control de errores
app.use(errorHandler)

app.use(fileUpload({
  tempFileDir: '/temp'
}))


//Rutas
app.use('/', routes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});