const uri = "http://localhost:3000/saida";

window.addEventListener("DOMContentLoaded", () => {
    const tabelaSaida = document.querySelector("#tabela-saida tbody");

    // Função para carregar os dados da tabela
    async function carregarSaidas() {
        tabelaSaida.innerHTML = "";
        try {
            const res = await fetch(uri);
            const saidas = await res.json();

            saidas.forEach(e => {
                const tr = document.createElement("tr");
                tr.setAttribute("data-id", e.cod_saida);
                tr.innerHTML = `
                    <td>${e.pn_material}</td>
                    <td>${e.lote}</td>
                    <td>${e.data_validade}</td>
                    <td>${e.posicao}</td>
                    <td>${e.nf_entrada}</td>
                    <td>${e.observacao || ''}</td>
                    <td>${e.quantidade}</td>
                    <td>${e.status}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editarSaida(${e.cod_saida})">Editar</button>
                        <button class="btn btn-success btn-sm" onclick="darBaixa(${e.cod_saida})">Dar baixa</button>
                    </td>
                `;
                tabelaSaida.appendChild(tr);
            });

            // Inicializa ordenação
            ordenarTabela("tabela-saida");
        } catch (err) {
            console.error(err);
            alert("Erro ao carregar as saídas");
        }
    }

    carregarSaidas();
});

// Função para dar baixa
function darBaixa(cod_saida) {
    if (confirm("Confirma a baixa deste material?")) {
        fetch(`${uri}/baixa/${cod_saida}`, { method: "PUT" })
            .then(res => res.status)
            .then(status => {
                if (status === 202) window.location.reload();
                else alert("Erro ao dar baixa");
            });
    }
}

// Função para abrir modal e editar saída
function editarSaida(cod_saida) {
    fetch(`${uri}/${cod_saida}`)
        .then(res => {
            if (!res.ok) throw new Error("Saída não encontrada");
            return res.json();
        })
        .then(saida => {
            const modal = $('#modalEditarSaida');
            const form = document.querySelector("#formEditarSaida");

            form.pn_material.value = saida.pn_material;
            form.lote.value = saida.lote;
            form.data_validade.value = saida.data_validade;
            form.posicao.value = saida.posicao;
            form.nf_entrada.value = saida.nf_entrada;
            form.observacao.value = saida.observacao || '';
            form.quantidade.value = saida.quantidade;

            modal.modal('show');

            form.onsubmit = function(e) {
                e.preventDefault();
                const atualizado = {
                    pn_material: form.pn_material.value,
                    lote: form.lote.value,
                    data_validade: form.data_validade.value,
                    posicao: form.posicao.value,
                    nf_entrada: form.nf_entrada.value,
                    observacao: form.observacao.value,
                    quantidade: Number(form.quantidade.value)
                };

                fetch(`${uri}/${cod_saida}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(atualizado)
                })
                .then(res => res.status)
                .then(status => {
                    if (status === 202) {
                        alert("Saída atualizada!");
                        modal.modal('hide');
                        window.location.reload();
                    } else {
                        alert("Erro ao atualizar a saída");
                    }
                });
            };
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao carregar os dados da saída");
        });
}

// Função de ordenação clicando no cabeçalho
function ordenarTabela(tabelaId) {
    const tabela = document.querySelector(`#${tabelaId}`);
    const headers = tabela.querySelectorAll("th");
    let ordemAtual = {};

    headers.forEach((header, index) => {
        if (header.innerText === "AÇÕES") return; // Ignora coluna de ações
        header.style.cursor = "pointer";
        header.onclick = () => {
            const tbody = tabela.querySelector("tbody");
            const linhas = Array.from(tbody.querySelectorAll("tr"));
            const campoIndex = index;

            ordemAtual[index] = ordemAtual[index] === "asc" ? "desc" : "asc";

            linhas.sort((a, b) => {
                let valA = a.children[campoIndex].innerText;
                let valB = b.children[campoIndex].innerText;

                // Converter números
                if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
                    valA = Number(valA);
                    valB = Number(valB);
                }
                // Converter datas
                else if (Date.parse(valA) && Date.parse(valB)) {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }

                if (valA > valB) return ordemAtual[index] === "asc" ? 1 : -1;
                if (valA < valB) return ordemAtual[index] === "asc" ? -1 : 1;
                return 0;
            });

            linhas.forEach(linha => tbody.appendChild(linha));
        };
    });
}
