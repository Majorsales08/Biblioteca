function RegistrarLivro() {
  const nome = document.getElementById("nomeLivro").value;
  const autor = document.getElementById("autor").value;
  const sobre = document.getElementById("sobreLivro").value;
  const categoria = document.getElementById("categoria").value;
  const codigo = document.getElementById("codigo").value;

  if (nome === "" || autor === "" || codigo === "") {
    alert("Preencha os campos obrigatórios: Nome, Autor e Código!");
    return;
  }

  const lista = document.getElementById("listaLivros");

  const card = document.createElement("div");
  card.className = "livroCard";
  card.innerHTML = `
    <p><strong>${nome}</strong> (${categoria})</p>
    <p><em>${autor}</em></p>
    <p>${sobre}</p>
    <p>Código: ${codigo}</p>
  `;

  lista.appendChild(card);

  // limpar os campos
  document.getElementById("nomeLivro").value = "";
  document.getElementById("autor").value = "";
  document.getElementById("sobreLivro").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("codigo").value = "";
  document.getElementById("imagemLivro").value = "";
}


function mostrarImagem(event) {
  const preview = document.getElementById("preview");
  preview.src = URL.createObjectURL(event.target.files[0]);
  preview.style.display = "block";
}

