const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const posicao = await prisma.posicao.findMany();
    return res.json(posicao)
}

const create = async (req, res) => {
    try {
        const posicao = await prisma.posicao.create({
            data: req.body
        })
        res.status(201).json(posicao).end()
    } catch (error) {
        console.log(error);
        res.status(400).end()
    }
}

const update = async (req, res) => {
    const data = req.body
    let posicao = await prisma.posicao.update({
        data: data,
        where: {
            id: parseInt(req.body.id)
        }
    })
    res.status(202).json(posicao).end()
}

const del = async (req, res) => {
    try {
        let posicao = await prisma.posicao.delete({
            where: {
                cod_posicao: parseInt(req.params.id)
            }
        })
        res.status(200).json(posicao) // retorna o registro deletado
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
