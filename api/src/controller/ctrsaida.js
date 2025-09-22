const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar todas saídas
const read = async (req, res) => {
    try {
        const saidas = await prisma.saida.findMany({
            include: { material: true }
        });
        res.status(200).json(saidas);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Erro ao listar saídas" });
    }
};

// Registrar saída
const create = async (req, res) => {
    try {
        const data = req.body;

        // Atualiza estoque
        await prisma.material.update({
            where: { cod_material: data.cod_material },
            data: { quantidade: { decrement: data.quantidade } }
        });

        // Cria registro de saída
        const saida = await prisma.saida.create({
            data: {
                cod_material: data.cod_material,
                pn_material: data.pn_material,
                lote: data.lote,
                data_validade: data.data_validade,
                posicao: data.posicao,
                nf_entrada: data.nf_entrada,
                observacao: data.observacao,
                quantidade: data.quantidade
            }
        });

        res.status(201).json(saida);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Erro ao registrar saída" });
    }
};

// Editar saída
const update = async (req, res) => {
    try {
        const { cod_saida } = req.params;
        const data = req.body;

        const saidaAtual = await prisma.saida.findUnique({
            where: { cod_saida: parseInt(cod_saida) }
        });

        // Ajusta estoque se quantidade mudou
        const diferenca = data.quantidade - saidaAtual.quantidade;
        if (diferenca !== 0) {
            await prisma.material.update({
                where: { cod_material: saidaAtual.cod_material },
                data: { quantidade: { decrement: -diferenca } }
            });
        }

        const saidaAtualizada = await prisma.saida.update({
            where: { cod_saida: parseInt(cod_saida) },
            data
        });

        res.status(202).json(saidaAtualizada);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Erro ao atualizar saída" });
    }
};

// Dar baixa
const baixa = async (req, res) => {
    try {
        const { cod_saida } = req.params;
        const saida = await prisma.saida.update({
            where: { cod_saida: parseInt(cod_saida) },
            data: { status: "baixado" }
        });
        res.status(202).json(saida);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Erro ao dar baixa" });
    }
};

const readOne = async (req, res) => {
    try {
        const { cod_saida } = req.params;
        const saida = await prisma.saida.findUnique({
            where: { cod_saida: parseInt(cod_saida) }
        });

        if (!saida) return res.status(404).json({ error: "Saída não encontrada" });
        res.json(saida);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Erro ao buscar saída" });
    }
};


module.exports = { read, create, update, baixa, readOne };
