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
    let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    
    alunos.push({ nome, senha, serie });
    localStorage.setItem('alunos', JSON.stringify(alunos));
    alert('Cadastro realizado com sucesso!');
    mostrarLogin('aluno');
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
        alert('Usuário ou senha incorretos!');
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

  function setOpen(open){
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