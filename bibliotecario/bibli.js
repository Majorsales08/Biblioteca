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

    // --- Catalogar livros ---
    document.getElementById("formCatalogar").addEventListener("submit", function (e) {
      e.preventDefault();

      const nome = document.getElementById("nomeLivro").value;
      const autor = document.getElementById("autorLivro").value;

      livros = JSON.parse(localStorage.getItem("livrosCatalogados")) || [];
      livros.push({ nome, autor });
      localStorage.setItem("livrosCatalogados", JSON.stringify(livros));

      this.reset();
      carregarLivros();
      mostrarSecao("livro");
    });

    function carregarLivros() {
      const lista = document.getElementById("livrosList");
      livros = JSON.parse(localStorage.getItem("livrosCatalogados")) || [];
      lista.innerHTML = "";

      if (livros.length === 0) {
        lista.innerHTML = "<p>Nenhum livro registrado.</p>";
        return;
      }

      livros.forEach(l => {
        const item = document.createElement("p");
        item.textContent = `📖 ${l.nome} - ${l.autor}`;
        lista.appendChild(item);
      });
    }

    // --- Registrar empréstimos ---
    document.getElementById("formEmprestimo").addEventListener("submit", function (e) {
      e.preventDefault();

      const nome = document.getElementById("nomeAluno").value;
      const serie = document.getElementById("serieAluno").value;
      const livro = document.getElementById("livroEmprestimo").value;
      const dataEmprestimo = new Date(document.getElementById("dataEmprestimo").value);

      const hoje = new Date();
      const dias = Math.floor((hoje - dataEmprestimo) / (1000 * 60 * 60 * 24));

      emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
      emprestimos.push({ nome, serie, livro, dias, status: "emprestado" });
      localStorage.setItem("emprestimos", JSON.stringify(emprestimos));

      // também salva no histórico do aluno
      let historico = JSON.parse(localStorage.getItem("historicoAluno")) || [];
      historico.push({ livro, status: "emprestado" });
      localStorage.setItem("historicoAluno", JSON.stringify(historico));

      this.reset();
      atualizarListaEmprestimos();
      mostrarSecao("controle");
    });

    function atualizarListaEmprestimos() {
      const lista = document.getElementById("emprestimosList");
      emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
      lista.innerHTML = "";

      if (emprestimos.length === 0) {
        lista.innerHTML = "<p>Nenhum empréstimo registrado.</p>";
        return;
      }

      emprestimos.forEach(emp => {
        const item = document.createElement("p");
        item.textContent = `${emp.nome} (${emp.serie}) está com "${emp.livro}" há ${emp.dias} dias. Status: ${emp.status}`;
        lista.appendChild(item);
      });
    }

    // --- Sugestões dos alunos ---
    function carregarSugestoes() {
      const lista = document.getElementById("sugestoesList");
      const sugestoes = JSON.parse(localStorage.getItem("sugestoesLivros")) || [];
      lista.innerHTML = "";

      if (sugestoes.length === 0) {
        lista.innerHTML = "<p>Nenhuma sugestão recebida.</p>";
        return;
      }

      sugestoes.forEach(s => {
        const item = document.createElement("p");
        item.textContent = `📦 ${s}`;
        lista.appendChild(item);
      });
    }

    // Carregar listas ao abrir página
    window.onload = function () {
      carregarLivros();
      atualizarListaEmprestimos();
      carregarSugestoes();
    }