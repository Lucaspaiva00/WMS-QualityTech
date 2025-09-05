const express = require('express')
const routes = express.Router()

const material = require('./controller/ctrmaterial')

routes.get('/', (req, res) =>{
    return res.json("Api WMS está funcionando corretamente")
})

routes.get('/material', material.read)
routes.post('/material', material.create)
routes.put('/material', material.update)
routes.delete('/material:id', material.del)

module.exports = routes