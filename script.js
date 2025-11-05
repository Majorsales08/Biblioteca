function mostrarCadastroAluno() {
    document.getElementById('login-aluno').style.display = 'none';
    document.getElementById('cadastro-aluno').style.display = 'block';
}

function loginAluno() {
    let nome = document.getElementById('aluno-nome').value;
    let senha = document.getElementById('aluno-senha').value;
    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    let aluno = alunos.find(a => a.nome === nome && a.senha === senha);

    if (aluno) {
        alert('Login bem-sucedido!');
        //  alert("teste")
        window.location.href = "aluno/aluno.html";
        //   document.write("<h1>teste de aluno</h1>")
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('area-aluno').style.display = 'block';

    } else {
        alert('Nome ou senha incorretos!');
    }
}

function cadastrarAluno() {
    let nome = document.getElementById('novo-aluno-nome').value;
    let senha = document.getElementById('novo-aluno-senha').value;
    let serie = document.getElementById('aluno-serie').value;
    let email = document.getElementById('aluno-email').value;
    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];

    alunos.push({ nome, senha, serie, email });
    
        localStorage.setItem('alunos', JSON.stringify(alunos));
        alert('Cadastro realizado com sucesso!');
        mostrarLogin('aluno');

        if (nome === '' || senha === '' || serie === '' || email === '') {
            alert('Por favor, preencha todos os campos antes de cadastrar.');
            return;

    }
}

    function loginBibliotecario() {
        let usuario = document.getElementById('bibliotecario-usuario').value;
        let senha = document.getElementById('bibliotecario-senha').value;

        if (usuario === 'bibliotecario' && senha === 'autorizado1234') {
            alert('Login bem-sucedido!');
            window.location.href = " bibliotecario/bibliotecario.html";
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('area-bibliotecario').style.display = 'block';
        } else {
            alert('Usuário ou senha incorretos, tente novamente!');
        }

    }

    function mostrarLogin(tipo) {
        // Oculta todos os formulários primeiro
        document.getElementById('login-aluno').style.display = 'none';
        document.getElementById('login-bibliotecario').style.display = 'none';
        document.getElementById('cadastro-aluno').style.display = 'none';

        // Mostra apenas o formulário correspondente ao tipo
        if (tipo === 'aluno') {
            document.getElementById('login-aluno').style.display = 'block';
        } else if (tipo === 'bibliotecario') {
            document.getElementById('login-bibliotecario').style.display = 'block';
        }
    }

    // Toggle do manual (seta)
    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('manualToggle');
        const manual = document.getElementById('manual');
        if (!toggle || !manual) return;

        function setOpen(open) {
            manual.style.display = open ? 'block' : 'none';
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
        }

        // clique e teclado (Enter / Espaço)
        toggle.addEventListener('click', () => setOpen(manual.style.display === 'none'));
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
        });

        // inicializa fechado (ou troque para true para abrir por padrão)
        setOpen(false);
    });

    // Ajuda / FAQ
    document.addEventListener('DOMContentLoaded', () => {
        const helpButton = document.getElementById('helpButton');
        const helpModal = document.getElementById('helpModal');
        const helpClose = document.getElementById('helpClose');
        const tabs = Array.from(document.querySelectorAll('.help-tabs .tab'));
        const panels = { ask: document.getElementById('tab-ask'), faq: document.getElementById('tab-faq'), minhas: document.getElementById('tab-minhas') };
        const faqList = document.getElementById('faqList');
        const form = document.getElementById('helpForm');
        const feedback = document.getElementById('helpFeedback');
        const minhasList = document.getElementById('minhasPerguntas');
        let feedbackTimeout; // <-- novo

        const defaultFaq = [
            { q: "Como faço para me cadastrar?", a: "Clique em Cadastre-se e preencha nome, senha e série." },
            { q: "Como pegar um livro emprestado?", a: "Somente o bibliotecário registra empréstimos. Peça para ele registrar." },
            { q: "Como sugerir um livro?", a: "Na área do aluno, use 'Sugerir Livro' para enviar sua sugestão." }
        ];

        function openHelp() { helpModal.style.display = 'flex'; helpModal.setAttribute('aria-hidden', 'false'); }
        function closeHelp() { helpModal.style.display = 'none'; helpModal.setAttribute('aria-hidden', 'true'); }

        helpButton && helpButton.addEventListener('click', openHelp);
        helpClose && helpClose.addEventListener('click', closeHelp);
        helpModal && helpModal.addEventListener('click', (e) => { if (e.target === helpModal) closeHelp(); });

        // Tabs
        tabs.forEach(t => t.addEventListener('click', () => {
            tabs.forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            Object.values(panels).forEach(p => p.style.display = 'none');
            panels[t.dataset.tab].style.display = 'block';
            if (t.dataset.tab === 'minhas') renderMinhas();
        }));

        // Render FAQ
        function renderFaq() {
            faqList.innerHTML = '';
            defaultFaq.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${item.q}</strong><div style="color:#444;margin-top:6px;">${item.a}</div>`;
                faqList.appendChild(li);
            });
        }
        renderFaq();

        // Perguntas enviadas (localStorage)
        function getPerguntas() { return JSON.parse(localStorage.getItem('perguntasAjuda') || '[]'); }
        function savePergunta(obj) {
            const arr = getPerguntas();
            arr.unshift(obj);
            localStorage.setItem('perguntasAjuda', JSON.stringify(arr));
        }
        function renderMinhas() {
            const arr = getPerguntas();
            minhasList.innerHTML = '';
            if (arr.length === 0) minhasList.innerHTML = '<li>Nenhuma pergunta enviada.</li>';
            arr.forEach(p => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${p.nome || 'Anônimo'}</strong><div style="color:#444;margin-top:6px;">${p.pergunta}</div><small style="color:#888">Enviado em ${new Date(p.data).toLocaleString()}</small>`;
                minhasList.appendChild(li);
            });
        }

        // Form submit
        form && form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          const nome = document.getElementById('helpName').value.trim();
          const pergunta = document.getElementById('helpQuestion').value.trim();
          if (!pergunta) {
              feedback.textContent = 'Escreva sua pergunta antes de enviar.';
              feedback.style.color = 'crimson';
              clearTimeout(feedbackTimeout);
              feedbackTimeout = setTimeout(() => { feedback.textContent = ''; }, 3000);
              return;
          }

          fetch('http://localhost:5000/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: null, author: nome || null, message: pergunta })
          })
          .then(r => r.json())
          .then(() => {
            feedback.style.color = 'green';
            feedback.textContent = 'Pergunta enviada. Verifique em "Minhas perguntas".';
            form.reset();
            // mantém limpeza da mensagem (3s)
            clearTimeout(feedbackTimeout);
            feedbackTimeout = setTimeout(() => { feedback.textContent = ''; }, 3000);
          })
          .catch(() => { feedback.textContent = 'Erro ao enviar, tente novamente.'; feedback.style.color='crimson'; });
        });

    });