function mostrarSecao(secaoId) {
  document.querySelectorAll(".secao").forEach(sec => sec.style.display = "none");
  document.getElementById(secaoId).style.display = "block";

  if (secaoId === "disponiveis") carregarLivrosDisponiveis();
  if (secaoId === "historico") carregarHistorico();
}

function carregarLivrosDisponiveis() {
  const lista = document.getElementById("listaLivros");
  const livros = JSON.parse(localStorage.getItem("livrosCatalogados") || "[]");

  lista.innerHTML = "";

  if (livros.length === 0) {
    lista.innerHTML = "<p style='text-align:center; color:#666;'>Nenhum livro catalogado ainda.</p>";
    return;
  }

  livros.forEach(livro => {

    const item = document.createElement("p");
    item.textContent = ` ${livro.imagem} - ${livro.nome} - ${livro.sobre} - `;
    lista.appendChild(item);

    const card = document.createElement("div");
    card.className = "livro-card";
    card.innerHTML = `
      <img src="${livro.imagem}" alt="${livro.nome}">
      <div class="livro-info">
        <h3>${livro.nome}</h3>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Sobre:</strong> ${livro.sobre.substring(0, 120)}...</p>
        <p class="codigo">Código: ${livro.codigo}</p>
      </div>
    `;
    lista.appendChild(card);

  });
}

function carregarHistorico() {
  const lista = document.getElementById("historicoList");
  lista.innerHTML = "<p>Histórico ainda não implementado completamente.</p>";
}

// Atualiza ao carregar e ao trocar de aba
window.onload = () => carregarLivrosDisponiveis();