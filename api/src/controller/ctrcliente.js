const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) =>{
    const cliente = await prisma.cliente.findMany();
    return res.json(cliente)
}

const create = async (req, res) => {
    try {
        const cliente = await prisma.cliente.create({
            data: req.body
        })
        res.status(201).json(cliente).end()
    } catch (error) {
        console.log(error);
        res.status(400).end()
    }
}

const update = async (req, res) => {
    const data = req.body
    let cliente = await prisma.cliente.update({
        data: data,
        where: {
            cod_cliente: parseInt(req.body.cod_cliente)
        }
    })
    res.status(202).json(cliente).end()
}

const del = async (req, res) => {
    try {
        let cliente = await prisma.cliente.delete({
            where: {
                cod_cliente: parseInt(req.params.cod_cliente)
            }
        })
        res.status(200).json(cliente) // retorna o registro deletado
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
