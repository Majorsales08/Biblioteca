# pylint: disable=import-errror
from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3

app = Flask(__name__)
app.secret_key = "chave_secreta_123"

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login_aluno', methods=['POST'])
def login_aluno():
    nome = request.form['aluno-nome']
    senha = request.form['aluno-senha']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE nome = ? AND senha = ?', (nome, senha))
    aluno = cursor.fetchone()
    conn.close()
    
    if aluno:
        flash('Login bem-sucedido!', 'success')
        return redirect(url_for('aluno'))
    else:
        flash('Nome ou senha incorretos!', 'error')
        return redirect(url_for('index'))

@app.route('/cadastrar_aluno', methods=['POST'])
def cadastrar_aluno():
    nome = request.form['novo-aluno-nome']
    senha = request.form['novo-aluno-senha']
    serie = request.form['aluno-serie']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO usuarios (nome, senha, serie) VALUES (?, ?, ?)', 
                      (nome, senha, serie))
        conn.commit()
        flash('Cadastro realizado com sucesso!', 'success')
    except sqlite3.IntegrityError:
        flash('Erro: Nome já cadastrado!', 'error')
    conn.close()
    
    return redirect(url_for('index'))

@app.route('/login_bibliotecario', methods=['POST'])
def login_bibliotecario():
    usuario = request.form['bibliotecario-usuario']
    senha = request.form['bibliotecario-senha']
    
    if usuario == 'bibliotecario' and senha == 'autorizado1234':
        flash('Login bem-sucedido!', 'success')
        return redirect(url_for('bibliotecario'))
    else:
        flash('Usuário ou senha incorretos!', 'error')
        return redirect(url_for('index'))

@app.route('/aluno')
def aluno():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT livros.titulo, autores.nome AS autor, categorias.nome AS categoria, livros.ano_publicacao, livros.quantidade_disponivel FROM livros JOIN autores ON livros.id_autor = autores.id_autor JOIN categorias ON livros.id_categoria = categorias.id_categoria WHERE livros.quantidade_disponivel > 0')
    livros = cursor.fetchall()
    conn.close()
    return render_template('aluno.html', livros=livros)

@app.route('/bibliotecario')
def bibliotecario():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT livros.titulo, autores.nome AS autor, categorias.nome AS categoria, livros.ano_publicacao, livros.quantidade_total, livros.quantidade_disponivel FROM livros JOIN autores ON livros.id_autor = autores.id_autor JOIN categorias ON livros.id_categoria = categorias.id_categoria')
    livros = cursor.fetchall()
    conn.close()
    return render_template('bibliotecario.html', livros=livros)

if __name__ == '__main__':
    app.run(debug=True) 