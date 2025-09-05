const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    const material = await prisma.material.findMany();
    return res.json(material)
}

const create = async (req, res) => {
    try {
        const material = await prisma.material.create({
            data: req.body
        })

        res.status(201).json(material).end()
    } catch (error) {
        console.log(error);

        res.status(400).end()
    }

}

const update = async (req, res) => {
    const data = req.body
    let material = await prisma.material.update({
        data: data,
        where: {
            id: parseInt(req.body.id)
        }
    })
    res.status(202).json(material).end()
}

const del = async (req, res) => {
    let material = await prisma.material.delete({
        where: {
            id: parseInt(req.params.id)
        }
    })
    res.status(204).json(material).end()
}

module.exports = {
    read,
    create,
    update,
    del
}