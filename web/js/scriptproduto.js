const caixaForm = document.querySelector("#caixaForms");
const uriProduto = "http://localhost:3000/produtos";
const uriCliente = "http://localhost:3000/cliente";
const clienteSelect = document.querySelector("#clienteSelect");
const entrada = document.querySelector("#entrada");

// 1. Carregar clientes no select
let clientesMap = {};

const carregarClientes = async () => {
    try {
        const resp = await fetch(uriCliente);
        const clientes = await resp.json();

        clientes.forEach(c => {
            const option = document.createElement("option");
            option.value = c.cod_cliente;
            option.textContent = c.nome_cliente;
            clienteSelect.appendChild(option);

            clientesMap[c.cod_cliente] = c.nome_cliente;
        });
    } catch (err) {
        console.error("Erro ao carregar clientes:", err);
    }
};

// 2. Carregar produtos na tabela
const carregarProdutos = async () => {
    try {
        const resp = await fetch(uriProduto);
        const produtos = await resp.json();

        entrada.innerHTML = "";
        produtos.forEach(p => {
            entrada.innerHTML += `
                <tr data-id="${p.cod_produto}">
                    <td>${clientesMap[p.cliente_cod_cliente] || "Sem cliente"}</td>
                    <td>${p.nome_produto}</td>
                    <td>${p.codigo}</td>
                    <td>${p.peso_uni}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onClick="editar(${p.cod_produto})">Editar</button>
                        <button class="btn btn-danger btn-sm" onClick="deletar(${p.cod_produto})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
};

// 3. Cadastrar novo produto
caixaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        cliente_cod_cliente: parseInt(caixaForm.cliente_cod_cliente.value),
        nome_produto: caixaForm.nome_produto.value,
        codigo: caixaForm.codigo.value,
        peso_uni: caixaForm.peso_uni.value
    };

    try {
        const res = await fetch(uriProduto, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.status === 201) {
            alert("Produto cadastrado com sucesso!");
            caixaForm.reset();
            carregarProdutos();
        } else {
            alert("Erro ao cadastrar produto");
        }
    } catch (err) {
        console.error("Erro no cadastro:", err);
    }
});

// 4. Deletar produto
window.deletar = async (cod_produto) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    try {
        const res = await fetch(`${uriProduto}/${cod_produto}`, { method: "DELETE" });
        if (res.status === 200) {
            alert("Produto deletado!");
            carregarProdutos();
        } else {
            alert("Erro ao deletar produto");
        }
    } catch (err) {
        console.error("Erro ao deletar:", err);
    }
};

// 5. Editar produto com modal
window.editar = async (cod_produto) => {
    const produto = await fetch(`${uriProduto}`)
        .then(res => res.json())
        .then(list => list.find(p => p.cod_produto === cod_produto));

    if (!produto) return alert("Produto não encontrado");

    // Criar modal se não existir
    if (!document.querySelector("#modalEditarProduto")) {
        const modalHTML = `
        <div class="modal fade" id="modalEditarProduto" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Editar Produto</h5>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
              </div>
              <div class="modal-body">
                <form id="formEditarProduto">
                  <select name="cliente_cod_cliente" class="form-control mb-2" required></select>
                  <input type="text" name="nome_produto" class="form-control mb-2" placeholder="Nome do Produto" required>
                  <input type="text" name="codigo" class="form-control mb-2" placeholder="Código" required>
                  <input type="text" name="peso_uni" class="form-control mb-2" placeholder="Peso Und" required>
                  <button type="submit" class="btn btn-success">Salvar</button>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    const modal = $('#modalEditarProduto');
    const form = document.querySelector("#formEditarProduto");
    const selectModalCliente = form.querySelector("select[name='cliente_cod_cliente']");

    // Preencher select de clientes
    selectModalCliente.innerHTML = "";
    for (const id in clientesMap) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = clientesMap[id];
        if (parseInt(id) === produto.cliente_cod_cliente) option.selected = true;
        selectModalCliente.appendChild(option);
    }

    // Preencher campos
    form.nome_produto.value = produto.nome_produto;
    form.codigo.value = produto.codigo;
    form.peso_uni.value = produto.peso_uni;

    modal.modal('show');

    form.onsubmit = async (e) => {
        e.preventDefault();

        const atualizado = {
            cliente_cod_cliente: parseInt(selectModalCliente.value),
            nome_produto: form.nome_produto.value,
            codigo: form.codigo.value,
            peso_uni: form.peso_uni.value
        };

        try {
            const res = await fetch(`${uriProduto}/${cod_produto}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(atualizado)
            });

            if (res.status === 202) {
                alert("Produto atualizado!");
                modal.modal('hide');
                carregarProdutos();
            } else {
                alert("Erro ao atualizar produto");
            }
        } catch (err) {
            console.error("Erro ao atualizar:", err);
        }
    };
};

// Inicialização
(async () => {
    await carregarClientes();
    await carregarProdutos();
})();
