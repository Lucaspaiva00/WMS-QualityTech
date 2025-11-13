const express = require('express')
const routes = express.Router()

const material = require('./controller/ctrmaterial')
const posicao = require('./controller/ctrposicao')
const cliente = require('./controller/ctrcliente')
const produtos = require('./controller/ctrproduto')
const saida = require('./controller/ctrsaida');
const minuta = require('./controller/ctminuta');
const operador = require("./controller/controllerOperador");

routes.get('/', (req, res) => {
    return res.json("Api WMS está funcionando corretamente")
})

routes.get('/material', material.read)
routes.post('/material', material.create)
routes.put('/material/:cod_material', material.update)
routes.delete('/material/:cod_material', material.del)

routes.get('/posicao', posicao.read)
routes.get('/posicao/:id', posicao.readOne)
routes.post('/posicao', posicao.create)
routes.put('/posicao/:id', posicao.update)
routes.delete('/posicao/:id', posicao.del)

routes.get('/cliente', cliente.read)
routes.post('/cliente', cliente.create)
routes.put('/cliente/:cod_cliente', cliente.update)
routes.delete('/cliente/:cod_cliente', cliente.del)

routes.get('/produtos', produtos.read)
routes.post('/produtos', produtos.create)
routes.put('/produtos/:cod_produto', produtos.update);
routes.delete('/produtos/:cod_produto', produtos.del)

routes.get('/saida', saida.read);
routes.get('/saida/:cod_saida', saida.readOne);
routes.post('/saida', saida.create);
routes.put('/saida/:cod_saida', saida.update);
routes.put('/saida/baixa/:cod_saida', saida.baixa);

routes.post("/minuta", minuta.criarMinuta);
routes.get("/minuta", minuta.listarMinutas);
routes.delete("/minuta/:id", minuta.excluirMinuta);
routes.get("/minuta/gerarxml/:id", minuta.gerarXML);

routes.post("/operador", operador.criarOperador);
routes.post("/login", operador.login);


module.exports = routes