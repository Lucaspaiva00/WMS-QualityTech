const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/posicao";
const posicaoCards = document.querySelector("#posicaoCards");

// ===== CADASTRAR POSIÇÃO =====
caixaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = { posicao: caixaForm.posicao.value };

    fetch(uri, {
        method: "POST",
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.status)
        .then(status => {
            if (status === 201) {
                window.location.reload();
            } else {
                alert("Erro ao inserir a posição");
            }
        });
});

// ===== LISTAR POSIÇÕES =====
fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        posicaoCards.innerHTML = "";
        resp.forEach(e => {
            posicaoCards.innerHTML += `
        <div class="col-md-4 col-lg-3">
          <div class="card text-center shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title text-primary font-weight-bold">${e.posicao}</h5>
              <div class="d-flex justify-content-center mt-3">
                <button class="btn btn-sm btn-primary mr-2" onclick="editaroperacao(${e.cod_posicao})">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletar(${e.cod_posicao})">
                  <i class="fas fa-trash"></i> Deletar
                </button>
              </div>
            </div>
          </div>
        </div>`;
        });
    });

// ===== DELETAR POSIÇÃO =====
function deletar(cod_posicao) {
    if (confirm("Confirmar a exclusão da posição?")) {
        fetch(`${uri}/${cod_posicao}`, { method: "DELETE" })
            .then(res => {
                if (res.status === 200 || res.status === 204) {
                    window.location.reload();
                } else {
                    alert("Erro ao deletar a posição");
                }
            });
    }
}

// ===== EDITAR POSIÇÃO =====
function editaroperacao(cod_posicao) {
    fetch(`${uri}/${cod_posicao}`)
        .then(res => res.json())
        .then(dados => {
            document.getElementById("editarId").value = cod_posicao;
            document.getElementById("editarPosicao").value = dados.posicao;
            const modal = $("#modalEditar");
            modal.modal("show");
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao buscar a posição.");
        });
}

// ===== SALVAR ALTERAÇÃO DO MODAL =====
document.getElementById("formEditar").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const novaPosicao = document.getElementById("editarPosicao").value;

    fetch(`${uri}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posicao: novaPosicao })
    })
        .then(res => {
            if (res.status === 200) {
                alert("Posição atualizada com sucesso!");
                window.location.reload();
            } else {
                alert("Erro ao atualizar a posição.");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erro na comunicação com o servidor.");
        });
});
