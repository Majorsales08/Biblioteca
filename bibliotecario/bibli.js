let emprestimos = [];
    let livros = [];

    // Alternar seções
    function mostrarSecao(secaoId) {
      document.querySelectorAll(".secao").forEach(sec => sec.style.display = "none");
      document.getElementById(secaoId).style.display = "block";

      // atualizar listas ao abrir cada seção
      if (secaoId === "livro") carregarLivros();
      if (secaoId === "controle") atualizarListaEmprestimos();
      if (secaoId === "sugestoes") carregarSugestoes();
    }

    // --- Catalogar livros ---
    document.getElementById("formCatalogar").addEventListener("submit", function (e) {
      e.preventDefault();

      const nome = document.getElementById("nomeLivro").value;
      const sobre = document.getElementById("sobreLivro").value;
      const  imagem = document.getElementById("imagemLivro").value;

      livros = JSON.parse(localStorage.getItem("livrosCatalogados")) || [];
      livros.push({ nome, sobre, imagem });
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

      emprestimos.forEach((emp, idx) => {
        const item = document.createElement("div");
        item.innerHTML = `
          <span>${emp.nome} (${emp.serie}) está com "${emp.livro}" há ${emp.dias} dias. Status: ${emp.status}</span>
          <button onclick="finalizarEmprestimo(${idx})">Finalizar Empréstimo</button>
        `;
        lista.appendChild(item);
      });
    }

    // Função para finalizar empréstimo
    function finalizarEmprestimo(idx) {
      emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];
      if (emprestimos[idx]) {
        emprestimos[idx].status = "finalizado";
        localStorage.setItem("emprestimos", JSON.stringify(emprestimos));
        atualizarListaEmprestimos();
      }
    }

    // --- Sugestões dos alunos ---
    function carregarSugestoes() {
      const lista = document.getElementById("sugestoesBibliList");
      if (!lista) return;
      lista.innerHTML = 'Carregando...';
      fetch('http://localhost:5000/api/suggestions')
        .then(r => r.json())
        .then(suggestions => {
          if (!suggestions.length) { lista.innerHTML = '<p>Nenhuma sugestão recebida.</p>'; return; }
          lista.innerHTML = '';
          suggestions.forEach(s => {
            const cont = document.createElement('div');
            cont.className = 'sugestao-item';
            cont.innerHTML = `
              <div class="card-sug">
                <strong>${s.title || 'Pergunta'}</strong>
                <div>Autor: ${s.author || 'Anônimo'}</div>
                <div>${s.message || ''}</div>
                <div class="meta">Enviado: ${new Date(s.created_at).toLocaleString()}</div>
                <div class="actions">
                  <button onclick="fetch('http://localhost:5000/api/suggestions/${s.id}/handle', {method:'POST'}).then(()=>carregarSugestoes())" class="btn-marcar">Marcar como lida</button>
                  <button onclick="fetch('http://localhost:5000/api/suggestions', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:${s.id}})}).then(()=>carregarSugestoes())" class="btn-remover">Remover</button>
                </div>
              </div>
            `;
            lista.appendChild(cont);
          });
        }).catch(() => { lista.innerHTML = '<p>Erro ao buscar sugestões.</p>'; });
    }

    function gerarRelatorio() {
      const emprestimosArr = JSON.parse(localStorage.getItem("emprestimos")) || [];
      let totalEmprestimos = emprestimosArr.length;
      let emprestimosAtivos = emprestimosArr.filter(e => e.status === "emprestado").length;
      let emprestimosFinalizados = emprestimosArr.filter(e => e.status === "finalizado").length;

      // resumo texto exibido (mantém alerta breve)
      const resumo = `Relatório de Empréstimos:\n\nTotal: ${totalEmprestimos}\nAtivos: ${emprestimosAtivos}\nFinalizados: ${emprestimosFinalizados}`;
      if (!confirm(resumo + "\n\nDeseja baixar este relatório em PDF?")) return;

      // cria linhas para o PDF (título + resumo + lista)
      const lines = [];
      lines.push("Relatório de Empréstimos");
      lines.push(`Gerado em: ${new Date().toLocaleString()}`);
      lines.push("");
      lines.push(`Total de Empréstimos: ${totalEmprestimos}`);
      lines.push(`Empréstimos Ativos: ${emprestimosAtivos}`);
      lines.push(`Empréstimos Finalizados: ${emprestimosFinalizados}`);
      lines.push("");
      lines.push("Detalhes:");
      if (emprestimosArr.length === 0) {
        lines.push("Nenhum empréstimo registrado.");
      } else {
        emprestimosArr.forEach((e, i) => {
          lines.push(`${i + 1}. ${e.nome} (${e.serie}) — "${e.livro}" — ${e.dias} dias — ${e.status}`);
        });
      }

      // carregador dinâmico do jsPDF (CDN)
      function loadJsPdf() {
        return new Promise((resolve, reject) => {
          if (window.jspdf || window.jsPDF) return resolve();
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Falha ao carregar jsPDF"));
          document.head.appendChild(s);
        });
      }

      // gera e salva o PDF
      loadJsPdf().then(() => {
        // obtém construtor jsPDF
        const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (!jsPDFConstructor) {
          alert("Erro: biblioteca jsPDF não disponível.");
          return;
        }

        const doc = new jsPDFConstructor();
        const marginLeft = 15;
        let y = 18;
        const lineHeight = 7;
        doc.setFontSize(12);

        lines.forEach((text) => {
          
          const split = doc.splitTextToSize(text, 180);
          split.forEach((t) => {
            if (y > 280) { doc.addPage(); y = 18; }
            doc.text(t, marginLeft, y);
            y += lineHeight;
          });
        });

        const filename = `relatorio_emprestimos_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.pdf`;
        doc.save(filename);
      }).catch(() => {
        alert("Não foi possível carregar a biblioteca para gerar o PDF.");
      });
    }


    window.onload = function () {
      carregarLivros();
      atualizarListaEmprestimos();
      carregarSugestoes();
    }