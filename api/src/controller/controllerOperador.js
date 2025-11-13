// src/controller/ctoperador.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Listar operadores
async function listarOperadores(req, res) {
    try {
        const operadores = await prisma.operador.findMany({
            orderBy: { id: 'asc' },
            select: {
                id: true,
                nome: true,
                usuario: true,
                criadoEm: true,
            },
        });
        res.json(operadores);
    } catch (error) {
        console.error('Erro ao listar operadores:', error);
        res.status(500).json({ error: 'Erro ao listar operadores' });
    }
}

// Criar operador
async function criarOperador(req, res) {
    try {
        const { nome, usuario, senha } = req.body;

        if (!nome || !usuario || !senha) {
            return res.status(400).json({ error: 'Informe nome, usuário e senha.' });
        }

        const jaExiste = await prisma.operador.findUnique({
            where: { usuario },
        });

        if (jaExiste) {
            return res
                .status(400)
                .json({ error: 'Já existe um operador com esse usuário.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novo = await prisma.operador.create({
            data: {
                nome,
                usuario,
                senha: senhaHash,
            },
            select: {
                id: true,
                nome: true,
                usuario: true,
                criadoEm: true,
            },
        });

        res.status(201).json(novo);
    } catch (error) {
        console.error('Erro ao criar operador:', error);
        res.status(500).json({ error: 'Erro ao criar operador' });
    }
}

// Login (sem JWT, retorna dados básicos)
async function loginOperador(req, res) {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({ error: 'Informe usuário e senha.' });
        }

        const operador = await prisma.operador.findUnique({
            where: { usuario },
        });

        if (!operador) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }

        const senhaOK = await bcrypt.compare(senha, operador.senha);
        if (!senhaOK) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }

        // Retorna apenas o necessário para o front
        return res.json({
            id: operador.id,
            nome: operador.nome,
            usuario: operador.usuario,
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
}

module.exports = {
    listarOperadores,
    criarOperador,
    loginOperador,
};
