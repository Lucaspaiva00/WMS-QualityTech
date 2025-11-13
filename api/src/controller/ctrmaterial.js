// controllerMaterial.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar materiais (inclui operador)
const read = async (req, res) => {
    try {
        const materiais = await prisma.material.findMany({
            include: {
                operador: {
                    select: { id: true, nome: true, usuario: true }
                }
            }
        });
        return res.status(200).json(materiais);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao listar materiais" });
    }
};

// Criar material
const create = async (req, res) => {
    try {
        const {
            pn_material,
            lote,
            data_validade,
            posicao,
            quantidade,
            nf_entrada,
            observacao,
            operadorId
        } = req.body;

        const material = await prisma.material.create({
            data: {
                pn_material,
                lote,
                data_validade,
                posicao,
                quantidade: Number(quantidade),
                nf_entrada,
                observacao,
                operadorId: parseInt(operadorId)
            }
        });

        return res.status(201).json(material);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Erro ao criar material" });
    }
};

// Atualizar material
const update = async (req, res) => {
    try {
        const { cod_material } = req.params;

        const camposPermitidos = [
            "pn_material",
            "lote",
            "data_validade",
            "posicao",
            "quantidade",
            "nf_entrada",
            "observacao"
        ];

        const data = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                data[campo] = campo === "quantidade"
                    ? Number(req.body[campo])
                    : req.body[campo];
            }
        }

        const material = await prisma.material.update({
            where: { cod_material: parseInt(cod_material) },
            data
        });

        return res.status(202).json(material);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Erro ao atualizar material" });
    }
};

// Excluir material
const del = async (req, res) => {
    try {
        const cod_material = parseInt(req.params.cod_material);
        await prisma.material.delete({
            where: { cod_material }
        });
        return res.status(204).end();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Erro ao excluir material" });
    }
};

module.exports = { read, create, update, del };
