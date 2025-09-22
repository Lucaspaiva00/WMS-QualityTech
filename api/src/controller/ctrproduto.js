const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const produtos = await prisma.produtos.findMany();
    return res.json(produtos);
};

const create = async (req, res) => {
    try {
        const produtos = await prisma.produtos.create({
            data: req.body
        });
        res.status(201).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao criar produto" });
    }
};

const update = async (req, res) => {
    try {
        const cod_produto = parseInt(req.params.cod_produto);
        const atualizado = await prisma.produtos.update({
            where: { cod_produto },
            data: req.body
        });
        res.status(202).json(atualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar produto" });
    }
};

const del = async (req, res) => {
    try {
        const cod_produto = parseInt(req.params.cod_produto);
        const deletado = await prisma.produtos.delete({
            where: { cod_produto }
        });
        res.status(200).json(deletado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar produto" });
    }
};

module.exports = {
    read,
    create,
    update,
    del
};
