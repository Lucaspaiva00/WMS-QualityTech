require('dotenv').config()
const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 3000
const routes = require('./src/routes')
const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

app.listen(PORT, ()=>{
    console.log("Servidor WMS respondendo com sucesso na porta: " + PORT);
    
})