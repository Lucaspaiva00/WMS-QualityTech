const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) =>{
    const produtos = await prisma.produtos.findMany();
    return res.json(produtos)
}

const create = async (req, res) => {
    try {
        const produtos = await prisma.produtos.create({
            data: req.body
        })
        res.status(201).json(produtos).end()
    } catch (error) {
        console.log(error);
        res.status(400).end()
    }
}

const update = async (req, res) => {
    const data = req.body
    let produtos = await prisma.cliprodutosente.update({
        data: data,
        where: {
            cod_produto: parseInt(req.body.cod_produto)
        }
    })
    res.status(202).json(produtos).end()
}

const del = async (req, res) => {
    try {
        let produtos = await prisma.produtos.delete({
            where: {
                cod_produto: parseInt(req.params.cod_produto)
            }
        })
        res.status(200).json(produtos) // retorna o registro deletado
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Erro ao deletar posição" })
    }
}


module.exports = {
    read,
    create,
    update,
    del
}
