# 🏭 WMS-QualityTech — Sistema de Gestão de Armazém

![GitHub repo size](https://img.shields.io/github/repo-size/Lucaspaiva00/WMS-QualityTech?color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/Lucaspaiva00/WMS-QualityTech?color=red)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)
![Bootstrap](https://img.shields.io/badge/Bootstrap-4.6-purple?logo=bootstrap)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🧾 Descrição

O **WMS-QualityTech** é um sistema completo de **Gestão de Armazém** desenvolvido pela **Paiva Tech**, projetado para controlar **materiais, posições, clientes, embarques e minutas CTe**.  
A plataforma une **backend em Node.js/Prisma** e **frontend web responsivo**, garantindo fluidez, segurança e escalabilidade.

---

## 🚀 Tecnologias Utilizadas

### 🧩 **Backend**
- **Node.js + Express** — Servidor rápido e leve.  
- **Prisma ORM** — Integração com banco **PostgreSQL**.  
- **Dotenv + CORS + Helmet** — Segurança e padronização.  
- **API RESTful** estruturada por módulos.

### 💻 **Frontend**
- **HTML5, CSS3 e JavaScript**  
- **Bootstrap 4.6 + SB Admin 2** — Layout administrativo moderno.  
- **Fetch API** — Consumo direto da API.  
- **Font Awesome** — Ícones profissionais.  
- **Design responsivo** e intuitivo.

---

## 🧠 Estrutura do Projeto

WMS-QualityTech/
│
├── api/ # Backend (Node.js + Prisma)
│ ├── prisma/ # Schema e migrations
│ ├── controllers/ # Lógica de negócio
│ ├── routes/ # Rotas REST
│ ├── server.js # Inicialização
│ └── package.json
│
├── web/ # Interface administrativa
│ ├── css2/ # Estilos e temas
│ ├── js/ # Scripts (index, material, saída, etc.)
│ ├── vendor2/ # Dependências Bootstrap/jQuery
│ ├── img/ # Logos e ícones
│ ├── index.html # Dashboard principal
│ ├── material.html # Controle de materiais
│ ├── saida.html # Relatório de embarques
│ ├── cliente.html # Cadastro de clientes
│ ├── minuta.html # Emissão de minutas
│ └── posicao.html # Controle de posições


---

## 📊 Funcionalidades

### 📋 **Painel Geral (Dashboard)**
- Indicadores em tempo real:
  - ✅ Materiais cadastrados  
  - 🚚 Ordens de embarque  
  - 👥 Clientes ativos  
  - 📄 Minutas geradas  
  - ⚠️ Materiais a vencer (30 dias)  
  - ⏳ Carregamentos pendentes  
  - 📅 Saídas de hoje  
  - 👤 Último operador ativo  

### 📦 **Controle de Materiais**
- Cadastro com PN, lote, validade e posição.  
- Filtros e listagem completa.  
- Botões dinâmicos de **Editar** e **Saída**.

### 🚛 **Ordem de Embarque**
- Criação e atualização de ordens.  
- Status dinâmico (**Pendente**, **Em Andamento**, **Finalizado**).  
- Registro de operador e data.

### 🧾 **Minutas CTe**
- Geração de minuta de transporte com integração futura para CT-e.  
- Listagem e exclusão.

### 🧍 **Clientes**
- Cadastro de clientes vinculados às operações.  
- Visualização rápida no painel.

### 📍 **Posições**
- Controle de endereçamento de estoque (AB1, AB2, etc.).  
- Organização física do armazém.

---

## 🖼️ Preview

### **Dashboard Principal**
![Dashboard](https://github.com/Lucaspaiva00/WMS-QualityTech/assets/dashboard-preview.png)

### **Materiais Cadastrados**
![Materiais](https://github.com/Lucaspaiva00/WMS-QualityTech/assets/materiais-preview.png)

*(coloque suas imagens reais na pasta `web/img/` e substitua os links acima)*

---

## ⚙️ Como Executar Localmente

### ✅ Pré-requisitos
- Node.js (v18 ou superior)  
- PostgreSQL configurado  
- Git instalado  
- Editor recomendado: **VS Code**

### 📦 Passo a passo

```bash
# Clonar o repositório
git clone https://github.com/Lucaspaiva00/WMS-QualityTech.git

# Entrar na API
cd WMS-QualityTech/api

# Instalar dependências
npm install

# Criar e configurar o .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/wms_qualitytech"

# Rodar migrações do Prisma
npx prisma migrate dev

# Iniciar servidor
npm start
