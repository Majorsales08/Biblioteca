import sqlite3

def init_db():
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS autores (
            id_autor INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nacionalidade TEXT
        );

        CREATE TABLE IF NOT EXISTS categorias (
            id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS livros (
            id_livro INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            id_autor INTEGER,
            id_categoria INTEGER,
            ano_publicacao INTEGER,
            quantidade_total INTEGER DEFAULT 1,
            quantidade_disponivel INTEGER DEFAULT 1,
            FOREIGN KEY (id_autor) REFERENCES autores(id_autor),
            FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE,
            telefone TEXT,
            senha TEXT NOT NULL,
            serie TEXT
        );

        CREATE TABLE IF NOT EXISTS emprestimos (
            id_emprestimo INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER,
            id_livro INTEGER,
            data_emprestimo DATE NOT NULL,
            data_devolucao DATE,
            devolvido BOOLEAN DEFAULT 0,
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
            FOREIGN KEY (id_livro) REFERENCES livros(id_livro)
        );
    """)
    cursor.executescript("""
        INSERT OR IGNORE INTO autores (nome, nacionalidade) VALUES ('J.K. Rowling', 'Britânica');
        INSERT OR IGNORE INTO categorias (nome) VALUES ('Fantasia');
        INSERT OR IGNORE INTO livros (titulo, id_autor, id_categoria, ano_publicacao, quantidade_total, quantidade_disponivel) VALUES ('Harry Potter', 1, 1, 1997, 5, 5);
    """)
    db.commit()
    db.close()
    print("Banco de dados inicializado com sucesso!")

if __name__ == "__main__":
    init_db()