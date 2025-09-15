const caixaForm = document.querySelector("#caixaForms");
const uriProduto = "http://localhost:3000/produtos";
const uriCliente = "http://localhost:3000/cliente";
const clienteSelect = document.querySelector("#clienteSelect");
const entrada = document.querySelector("#entrada");

let clientesMap = {};

fetch(uriCliente)
    .then(resp => resp.json())
    .then(clientes => {
        clientes.forEach(c => {
            let option = document.createElement("option");
            option.value = c.cod_cliente;
            option.textContent = c.nome_cliente;
            clienteSelect.appendChild(option);

            clientesMap[c.cod_cliente] = c.nome_cliente;
        });

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
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => console.error("Erro:", err));
