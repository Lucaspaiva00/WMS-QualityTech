const caixaForm = document.querySelector("#caixaForms");
const uriProduto = "http://localhost:3000/produtos";
const uriCliente = "http://localhost:3000/cliente";
const clienteSelect = document.querySelector("#clienteSelect");
const entrada = document.querySelector("#entrada");


caixaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
        cliente_cod_cliente: parseInt(caixaForm.cliente_cod_cliente.value),
        nome_produto: caixaForm.nome_produto.value,
        codigo: caixaForm.codigo.value,
        peso_uni: caixaForm.peso_uni.value
    };

    fetch(uriProduto, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.status)
        .then(status => {
            if (status == 201) {
                alert("Produto cadastrado com sucesso!");
                window.location.reload();
            } else {
                alert("Erro ao cadastrar produto.");
            }
        })
        .catch(err => console.error("Erro no cadastro:", err));
});

// Criar um mapa de clientes
let clientesMap = {};

// 1. Buscar clientes e preencher select
fetch(uriCliente)
    .then(resp => resp.json())
    .then(clientes => {
        clientes.forEach(c => {
            let option = document.createElement("option");
            option.value = c.cod_cliente;
            option.textContent = c.nome_cliente;
            clienteSelect.appendChild(option);

            // Guardar no mapa (id -> nome)
            clientesMap[c.cod_cliente] = c.nome_cliente;
        });

        // Depois que clientes carregaram, buscar produtos
        return fetch(uriProduto);
    })
    .then(resp => resp.json())
    .then(produtos => {
        produtos.forEach(p => {
            entrada.innerHTML += `
                <tr>
                    <td>${clientesMap[p.cliente_cod_cliente] || "Sem cliente"}</td>
                    <td>${p.nome_produto}</td>
                    <td>${p.codigo}</td>
                    <td>${p.peso_uni}</td>
                    <td>
                        <button class="btn btn-primary" onClick="editar(${p.cod_produto})">Editar</button>
                        <button class="btn btn-primary" onClick="excluir(${p.cod_produto})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => console.error("Erro:", err));

