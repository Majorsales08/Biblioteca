function catalogarLivros() {

    window.location.href = "catalogar\catalogar.html";
}

function registrarEmprestimo() {
    let nome = document.getElementById('aluno-nome-emprestimo').value;
    let serie = document.getElementById('aluno-serie-emprestimo').value;
    let livro = document.getElementById('livro-emprestado').value;
    let dataEmprestimo = new Date();
    let dataDevolucao = new Date();
    dataDevolucao.setDate(dataEmprestimo.getDate() + 10);
    
    let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];
    emprestimos.push({ nome, serie, livro, dataEmprestimo, dataDevolucao });
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    alert('Empréstimo registrado!');
}
