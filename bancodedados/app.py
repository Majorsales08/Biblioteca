# app.py — VERSÃO COM CADASTRO + ENVIO DE EMAIL
from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
app.secret_key = "supersegredo2025"
app.config['UPLOAD_FOLDER'] = 'static/imagens_livros'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# === CONFIGURAÇÃO DO EMAIL (use seu Gmail) ===
EMAIL_REMETENTE = "seuemail@gmail.com"          # ← MUDE AQUI
SENHA_EMAIL = "suasenhaaqui"                    # ← MUDE AQUI (veja instrução abaixo)

def enviar_email(destinatario, nome_aluno, senha_gerada):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_REMETENTE
    msg['To'] = destinatario
    msg['Subject'] = "Bem-vindo à Biblioteca Escolar!"

    corpo = f"""
    <h2>Olá, {nome_aluno}!</h2>
    <p>Seu cadastro na biblioteca foi realizado com sucesso!</p>
    <p><strong>Seus dados de acesso:</strong></p>
    <ul>
        <li><strong>Email:</strong> {destinatario}</li>
        <li><strong>Senha:</strong> {senha_gerada}</li>
    </ul>
    <p>Acesse aqui: <a href="http://SEU-IP-AQUI:5000">http://SEU-IP-AQUI:5000</a></p>
    <p><em>Guarde bem essa senha!</em></p>
    <br>
    <p>Equipe da Biblioteca</p>
    """
    msg.attach(MIMEText(corpo, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_REMETENTE, SENHA_EMAIL)
        server.sendmail(EMAIL_REMETENTE, destinatario, msg.as_string())
        server.quit()
        print(f"Email enviado para {destinatario}")
    except Exception as e:
        print(f"Erro ao enviar email: {e}")

# === BANCO DE DADOS ===
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            serie TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS livros (...);  -- (mantém o resto igual)
        -- ... outras tabelas iguais ao anterior
    ''')
    # Bibliotecário padrão
    c.execute("INSERT OR IGNORE INTO alunos (nome, serie, email, senha) VALUES ('Bibliotecário', 'Admin', 'admin@biblioteca.com', 'admin123')")
    conn.commit()
    conn.close()

init_db()

# === ROTA DE CADASTRO ===
@app.route('/cadastrar', methods=['GET', 'POST'])
def cadastrar():
    if request.method == 'POST':
        nome = request.form['nome']
        serie = request.form['serie']
        email = request.form['email'].lower()

        # Gera senha automática (primeiras letras do nome + números)
        import random
        senha = nome.split()[0].lower()[:4] + str(random.randint(100, 999))

        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        try:
            c.execute("INSERT INTO alunos (nome, serie, email, senha) VALUES (?, ?, ?, ?)",
                      (nome, serie, email, senha))
            conn.commit()
            conn.close()

            # ENVIA EMAIL AUTOMÁTICO
            enviar_email(email, nome, senha)

            flash(f"Aluno cadastrado com sucesso! Senha enviada para o email.", "success")
        except sqlite3.IntegrityError:
            flash("Este email já está cadastrado!", "error")
            conn.close()

        return redirect(url_for('cadastrar'))

    return render_template('cadastrar.html')

# === Login, dashboard, etc (mantém o resto do código anterior) ===
# ... (cole aqui o resto do seu código anterior de login, dashboard, etc)