// Alternar entre seções
function mostrarSecao(secaoId) {
  document.querySelectorAll(".secao").forEach(sec => {
    sec.style.display = "none";
  });
  document.getElementById(secaoId).style.display = "block";
}

// Carregar livros catalogados pelo bibliotecário
function carregarLivrosDisponiveis() {
  const livros = JSON.parse(localStorage.getItem("livrosCatalogados")) || [];
  const lista = document.getElementById("listaLivros");
  lista.innerHTML = "";

  if (livros.length === 0) {
    lista.innerHTML = "<p>Nenhum livro disponível.</p>";
    return;
  }

  livros.forEach(livro => {
    const item = document.createElement("p");
    item.textContent = ` ${livro.nome} - ${livro.autor}`;
    lista.appendChild(item);
  });
}

// Registrar sugestões de livros
document.getElementById("formSugestao").addEventListener("submit", function (e) {
  e.preventDefault();

  const sugestao = document.getElementById("sugestaoLivro").value;
  const lista = document.getElementById("sugestoesList");

  const item = document.createElement("p");
  item.textContent = ` ${sugestao}`;
  lista.appendChild(item);

  // Salvar sugestão no localStorage (bibliotecário também verá)
  const sugestoes = JSON.parse(localStorage.getItem("sugestoesLivros")) || [];
  sugestoes.push(sugestao);
  localStorage.setItem("sugestoesLivros", JSON.stringify(sugestoes));

  this.reset();
});

// Carregar histórico do aluno
function carregarHistorico() {
  const historico = JSON.parse(localStorage.getItem("historicoAluno")) || [];
  const lista = document.getElementById("historicoList");
  lista.innerHTML = "";

  if (historico.length === 0) {
    lista.innerHTML = "<p>Você ainda não pegou nenhum livro.</p>";
    return;
  }

  historico.forEach(emp => {
    const item = document.createElement("p");
    item.textContent = ` ${emp.livro} - ${emp.status}`;
    lista.appendChild(item);
  });
}

// Atualiza ao carregar página
window.onload = function () {
  carregarLivrosDisponiveis();
  carregarHistorico();
};
