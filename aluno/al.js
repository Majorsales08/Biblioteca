function exibirLivros() {
    let livros = JSON.parse(localStorage.getItem('livros')) || [];
    let lista = document.getElementById('lista-livros');
    lista.innerHTML = '';
    livros.forEach(livro => {
        let item = document.createElement('div');
        item.textContent = `${livro.titulo} - ${livro.autor}`;
        lista.appendChild(item);
    });
}

function enviarSugestao() {
    let sugestao = document.getElementById('sugestao-livro').value;
    let sugestoes = JSON.parse(localStorage.getItem('sugestoes')) || [];
    sugestoes.push(sugestao);
    localStorage.setItem('sugestoes', JSON.stringify(sugestoes));
    alert('Sugestão enviada!');
} 