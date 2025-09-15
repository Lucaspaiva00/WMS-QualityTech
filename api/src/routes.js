const express = require('express')
const routes = express.Router()

const material = require('./controller/ctrmaterial')
const posicao = require('./controller/ctrposicao')
const cliente = require('./controller/ctrcliente')
const produtos = require('./controller/ctrproduto')

routes.get('/', (req, res) =>{
    return res.json("Api WMS está funcionando corretamente")
})

routes.get('/material', material.read)
routes.post('/material', material.create)
routes.put('/material', material.update)
routes.delete('/material:id', material.del)

routes.get('/posicao', posicao.read)
routes.post('/posicao', posicao.create)
routes.put('/posicao', posicao.update)
routes.delete('/posicao/:id', posicao.del)

routes.get('/cliente', cliente.read)
routes.post('/cliente', cliente.create)
routes.put('/cliente', cliente.update)
routes.delete('/cliente/:cod_cliente', cliente.del)

routes.get('/produtos', produtos.read)
routes.post('/produtos', produtos.create)
routes.put('/produtos', produtos.update)
routes.delete('/produtos/:cod_produto', produtos.del)

module.exports = routes