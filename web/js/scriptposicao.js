const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/posicao";

caixaForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        posicao: caixaForm.posicao.value
    }
    fetch(`${uri}`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => res.status)
        .then(status => {
            if (status == 201) {
                window.location.reload()
            } else {
                alert("Erro ao inserir a posição")
            }
        })
    console.log(data);
})

fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            posicaoCards.innerHTML += `
            <div class="col-md-4">
            <div class="card shadow-sm mb-3">
                <div class="card-body">
                    <h5 class="card-title">${e.posicao}</h5>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-primary me-2" onclick="editaroperacao(${e.cod_posicao})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deletar(${e.cod_posicao})">Deletar</button>
                    </div>
                </div>
            </div>
        </div>
            `
        })
    })
function deletar(cod_posicao) { 
    if (confirm("Confirmar a deleção da posição?")) {
        fetch(`http://localhost:3000/posicao/${cod_posicao}`, {
            method: "DELETE"
        })
        .then(res => {
            if (res.status === 200 || res.status === 204) {
                window.location.reload()
            } else {
                alert("Erro ao deletar a posição")
            }
        })  
    }
}



// Função para abrir modal com os dados
function editaroperacao(cod_posicao) {
    fetch(`http://localhost:3000/posicao/${cod_posicao}`)
        .then(res => res.json())
        .then(dados => {
            // Preenche os campos do modal
            document.getElementById("editarId").value = cod_posicao;
            document.getElementById("editarPosicao").value = dados.posicao;

            // Abre o modal
            let modal = new bootstrap.Modal(document.getElementById('modalEditar'));
            modal.show();
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao buscar a posição.");
        });
}

// Captura o submit do formulário do modal
document.getElementById("formEditar").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const novaPosicao = document.getElementById("editarPosicao").value;

    fetch(`http://localhost:3000/posicao/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
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
