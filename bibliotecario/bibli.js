let emprestimos = [];
let livros = [];

// Alternar seções
function mostrarSecao(secaoId) {
  document.querySelectorAll(".secao").forEach(sec => sec.style.display = "none");
  document.getElementById(secaoId).style.display = "block";

  if (secaoId === "livro") carregarLivros();
  if (secaoId === "controle") atualizarListaEmprestimos();
  if (secaoId === "sugestoes") carregarSugestoes();
}

// === CATALOGAR LIVRO (com imagem em base64) ===
document.getElementById("formCatalogar").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nomeLivro").value.trim();
  const autor = document.getElementById("autorLivro").value.trim();
  const sobre = document.getElementById("sobreLivro").value.trim();
  const categoria = document.getElementById("categoriaLivro").value.trim();
  const codigo = document.getElementById("codigoLivro").value.trim();
  const file = document.getElementById("imagemLivro").files[0];

  if (!file) {
    alert("Por favor, selecione uma imagem da capa!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const imagemBase64 = event.target.result;

    let livros = JSON.parse(localStorage.getItem("livrosCatalogados") || "[]");
    livros.push({ nome, autor, sobre, categoria, codigo, imagem: imagemBase64 });
    localStorage.setItem("livrosCatalogados", JSON.stringify(livros));

    alert("Livro catalogado com sucesso!");
    document.getElementById("formCatalogar").reset();
    carregarLivros();
  };
  reader.readAsDataURL(file);
});

// === LISTAR LIVROS COM BOTÃO DE EXCLUIR ===
function carregarLivros() {
  const lista = document.getElementById("livrosList");
  const livros = JSON.parse(localStorage.getItem("livrosCatalogados") || "[]");
  lista.innerHTML = "";

  if (livros.length === 0) {
    lista.innerHTML = "<p style='color:#666;'>Nenhum livro catalogado ainda.</p>";
    return;
  }

<<<<<<< HEAD
      livros.forEach(l => {
        const item = document.createElement("p");
        item.textContent = `  ${imagem} - ${l.nome} - ${l.sobre}`;
        lista.appendChild(item);
      });
    }
=======
  livros.forEach((livro, index) => {
    const div = document.createElement("div");
    div.style = "background:#f0f0f0; padding:15px; margin:10px 0; border-radius:10px; display:flex; justify-content:space-between; align-items:center; color:#0c1f4a;";
    
    div.innerHTML = `
      <div>
        <strong>${livro.nome}</strong> - ${livro.autor}<br>
        <small>Código: ${livro.codigo} | Categoria: ${livro.categoria}</small>
      </div>
      <button onclick="excluirLivro(${index})" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">
        Excluir
      </button>
    `;
    lista.appendChild(div);
  });
}
>>>>>>> ffd753b40f5c72c5a9c60ce3a1aec15b66e813f9

// === FUNÇÃO PARA EXCLUIR LIVRO ===
function excluirLivro(index) {
  if (!confirm("Tem certeza que deseja excluir este livro? Essa ação não pode ser desfeita.")) return;

  let livros = JSON.parse(localStorage.getItem("livrosCatalogados") || "[]");
  const livroExcluido = livros.splice(index, 1)[0]; // Remove o livro

  localStorage.setItem("livrosCatalogados", JSON.stringify(livros));
  alert(`Livro "${livroExcluido.nome}" excluído com sucesso!`);
  carregarLivros();
}

// === REGISTRAR EMPRÉSTIMO ===
document.getElementById("formEmprestimo").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nomeAluno").value.trim();
  const serie = document.getElementById("serieAluno").value.trim();
  const livro = document.getElementById("livroEmprestimo").value.trim();
  const dataEmprestimo = document.getElementById("dataEmprestimo").value;

  let emprestimos = JSON.parse(localStorage.getItem("emprestimos") || "[]");
  emprestimos.push({
    nome,
    serie,
    livro,
    dataEmprestimo,
    dataDevolucao: null,
    status: "emprestado"
  });

  localStorage.setItem("emprestimos", JSON.stringify(emprestimos));

  // Salva no histórico do aluno
  let historico = JSON.parse(localStorage.getItem("historicoAluno") || "[]");
  historico.push({ livro, status: "emprestado", data: dataEmprestimo });
  localStorage.setItem("historicoAluno", JSON.stringify(historico));

  alert(`Empréstimo registrado para ${nome}!`);
  this.reset();
  atualizarListaEmprestimos();
  mostrarSecao("controle");
});

// === LISTAR EMPRÉSTIMOS COM BOTÃO DE FINALIZAR ===
function atualizarListaEmprestimos() {
  const lista = document.getElementById("emprestimosList");
  const emprestimos = JSON.parse(localStorage.getItem("emprestimos") || "[]");
  lista.innerHTML = "";

  if (emprestimos.length === 0) {
    lista.innerHTML = "<p style='color:#666;'>Nenhum empréstimo registrado.</p>";
    return;
  }

  emprestimos.forEach((emp, index) => {
    const div = document.createElement("div");
    div.style = "background:#f0f0f0; padding:15px; margin:10px 0; border-radius:10px; color:#0c1f4a;";

    const dataEmp = new Date(emp.dataEmprestimo);
    const hoje = new Date();
    const diasDecorridos = Math.floor((hoje - dataEmp) / (1000 * 60 * 60 * 24));

    const statusCor = emp.status === "emprestado" ? "#e67e22" : "#27ae60";
    const statusTexto = emp.status === "emprestado" ? "Emprestado" : "Devolvido";

    div.innerHTML = `
      <div style="margin-bottom:10px;">
        <strong>${emp.nome}</strong> (${emp.serie})<br>
        Livro: <strong>"${emp.livro}"</strong><br>
        Emprestado em: ${dataEmp.toLocaleDateString()}<br>
        Há ${diasDecorridos} dia(s) | 
        <span style="color:${statusCor}; font-weight:bold;">${statusTexto}</span>
      </div>
      ${emp.status === "emprestado" ? `
      <button onclick="finalizarEmprestimo(${index})" style="background:#27ae60; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
        Finalizar Devolução
      </button>` : 
      `<span style="color:#27ae60; font-weight:bold;">✓ Devolvido</span>`}
    `;

    lista.appendChild(div);
  });
}

// === FINALIZAR EMPRÉSTIMO (DEVOLUÇÃO) ===
function finalizarEmprestimo(index) {
  if (!confirm("Confirmar devolução deste livro?")) return;

  let emprestimos = JSON.parse(localStorage.getItem("emprestimos") || "[]");
  if (emprestimos[index]) {
    emprestimos[index].status = "devolvido";
    emprestimos[index].dataDevolucao = new Date().toISOString().split("T")[0];
    
    localStorage.setItem("emprestimos", JSON.stringify(emprestimos));

    // Atualiza histórico do aluno
    let historico = JSON.parse(localStorage.getItem("historicoAluno") || "[]");
    const ultimo = historico.findLast(h => h.livro === emprestimos[index].livro && h.status === "emprestado");
    if (ultimo) ultimo.status = "devolvido";

    localStorage.setItem("historicoAluno", JSON.stringify(historico));

    alert("Devolução registrada com sucesso!");
    atualizarListaEmprestimos();
  }
}

// Carregar tudo ao iniciar
window.onload = function () {
  carregarLivros();
  atualizarListaEmprestimos();
};