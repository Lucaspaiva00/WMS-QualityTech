const uri = "http://localhost:3000";
const material = document.querySelector("#material");


fetch(`${uri}/material`)
    .then(resp => resp.json())
    .then(resp => {
        // quantidade de registros (cada item no array é um material)
        const quantidadeMateriais = resp.length;
        material.innerHTML = quantidadeMateriais;
        console.log("Quantidade de materiais:", quantidadeMateriais);
    })
    .catch(err => console.error("Erro ao buscar materiais:", err));
