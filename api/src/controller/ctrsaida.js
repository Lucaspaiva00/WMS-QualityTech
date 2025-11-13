// controllerSaida.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar saídas
const read = async (req, res) => {
    try {
        const saidas = await prisma.saida.findMany({
            include: {
                material: true,
                operador: {
                    select: { id: true, nome: true, usuario: true }
                }
            }
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
        const operadorId = parseInt(data.operadorId);

        const material = await prisma.material.findUnique({
            where: { cod_material: data.cod_material }
        });

        if (!material) {
            return res.status(404).json({ error: "Material não encontrado" });
        }

        if (material.quantidade < data.quantidade) {
            return res.status(400).json({ error: "Estoque insuficiente" });
        }

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
                quantidade: data.quantidade,
                operadorId
            }
        });

        res.status(201).json(saida);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Erro ao registrar saída" });
    }
};

// Atualizar saída
const update = async (req, res) => {
    try {
        const { cod_saida } = req.params;
        const { quantidade, operadorId, ...resto } = req.body;

        const saidaAtual = await prisma.saida.findUnique({
            where: { cod_saida: parseInt(cod_saida) }
        });

        if (!saidaAtual) return res.status(404).json({ error: "Saída não encontrada" });

        // se mudou a quantidade → ajustar estoque
        const diff = quantidade - saidaAtual.quantidade;

        if (diff !== 0) {
            await prisma.material.update({
                where: { cod_material: saidaAtual.cod_material },
                data: { quantidade: { decrement: diff } }
            });
        }

        const saidaAtualizada = await prisma.saida.update({
            where: { cod_saida: parseInt(cod_saida) },
            data: {
                ...resto,
                quantidade,
                operadorId: parseInt(operadorId)
            }
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
        const { operadorId } = req.body;

        const saida = await prisma.saida.update({
            where: { cod_saida: parseInt(cod_saida) },
            data: {
                status: "baixado",
                operadorId: parseInt(operadorId)
            }
        });

        res.status(202).json(saida);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Erro ao dar baixa" });
    }
};

// Buscar saída por ID
const readOne = async (req, res) => {
    try {
        const { cod_saida } = req.params;
        const saida = await prisma.saida.findUnique({
            where: { cod_saida: parseInt(cod_saida) },
            include: {
                operador: { select: { id: true, nome: true } },
                material: true
            }
        });

        if (!saida) return res.status(404).json({ error: "Saída não encontrada" });

        res.json(saida);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Erro ao buscar saída" });
    }
};

module.exports = { read, create, update, baixa, readOne };
