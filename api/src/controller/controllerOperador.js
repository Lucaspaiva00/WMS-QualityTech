const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

// Criar operador
async function criarOperador(req, res) {
    try {
        const { nome, usuario, senha } = req.body;

        const hash = await bcrypt.hash(senha, 10);

        const novo = await prisma.operador.create({
            data: { nome, usuario, senha: hash }
        });

        res.json(novo);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar operador" });
    }
}

// Login simples
async function login(req, res) {
    try {
        const { usuario, senha } = req.body;

        const op = await prisma.operador.findUnique({
            where: { usuario }
        });

        if (!op) return res.status(401).json({ error: "Usuário não encontrado" });

        const match = await bcrypt.compare(senha, op.senha);
        if (!match) return res.status(401).json({ error: "Senha incorreta" });

        // NÃO usa JWT, salva localStorage no front
        res.json({
            message: "Logado com sucesso",
            operador: { id: op.id, nome: op.nome, usuario: op.usuario }
        });
    } catch {
        res.status(500).json({ error: "Erro ao realizar login" });
    }
}

module.exports = { criarOperador, login };
