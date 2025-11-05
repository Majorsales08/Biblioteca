import sqlite3
import datetime
import hashlib
import shutil
import os

# Database file name
DB_FILE = 'school_library.db'
BACKUP_DIR = 'backups'

# Function to create a connection to the database
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Function to initialize the database (create tables if they don't exist)
def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table for registration and login
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,  -- Stored as hashed value
            full_name TEXT NOT NULL,
            role TEXT NOT NULL  -- e.g., 'student', 'teacher', 'admin'
        )
    ''')
    
    # Books table for registered books
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            isbn TEXT UNIQUE,
            available INTEGER NOT NULL DEFAULT 1  -- Number of copies available
        )
    ''')
    
    # Loans table for book borrowing records
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            borrow_datetime DATETIME NOT NULL,
            return_datetime DATETIME,
            FOREIGN KEY (book_id) REFERENCES books (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Activity logs for tracking actions and generating reports
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            user_id INTEGER,
            timestamp DATETIME NOT NULL,
            details TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # nova tabela: sugestões
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            message TEXT,
            created_at DATETIME NOT NULL,
            handled INTEGER NOT NULL DEFAULT 0
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

# Function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# User registration
def register_user(username, password, full_name, role):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed_pw = hash_password(password)
    try:
        cursor.execute('''
            INSERT INTO users (username, password, full_name, role)
            VALUES (?, ?, ?, ?)
        ''', (username, hashed_pw, full_name, role))
        user_id = cursor.lastrowid
        log_activity('register', user_id, f"User {username} registered as {role}")
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # Username already exists
    finally:
        conn.close()

# User login
def login_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed_pw = hash_password(password)
    cursor.execute('''
        SELECT id, full_name FROM users WHERE username = ? AND password = ?
    ''', (username, hashed_pw))
    user = cursor.fetchone()
    conn.close()
    if user:
        log_activity('login', user['id'], f"User {username} logged in")
        return user['id'], user['full_name']
    return None, None

# Add a book
def add_book(title, author, isbn, available=1):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO books (title, author, isbn, available)
        VALUES (?, ?, ?, ?)
    ''', (title, author, isbn, available))
    book_id = cursor.lastrowid
    log_activity('add_book', None, f"Book '{title}' by {author} added")
    conn.commit()
    conn.close()
    return book_id

# Borrow a book
def borrow_book(book_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT available FROM books WHERE id = ?', (book_id,))
    book = cursor.fetchone()
    if book and book['available'] > 0:
        now = datetime.datetime.now()
        cursor.execute('''
            INSERT INTO loans (book_id, user_id, borrow_datetime)
            VALUES (?, ?, ?)
        ''', (book_id, user_id, now))
        cursor.execute('UPDATE books SET available = available - 1 WHERE id = ?', (book_id,))
        cursor.execute('SELECT full_name FROM users WHERE id = ?', (user_id,))
        user_name = cursor.fetchone()['full_name']
        log_activity('borrow', user_id, f"Book ID {book_id} borrowed by {user_name} at {now}")
        conn.commit()
        conn.close()
        return True
    conn.close()
    return False

# Return a book
def return_book(loan_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT book_id FROM loans WHERE id = ? AND user_id = ? AND return_datetime IS NULL', (loan_id, user_id))
    loan = cursor.fetchone()
    if loan:
        now = datetime.datetime.now()
        book_id = loan['book_id']
        cursor.execute('UPDATE loans SET return_datetime = ? WHERE id = ?', (now, loan_id))
        cursor.execute('UPDATE books SET available = available + 1 WHERE id = ?', (book_id,))
        cursor.execute('SELECT full_name FROM users WHERE id = ?', (user_id,))
        user_name = cursor.fetchone()['full_name']
        log_activity('return', user_id, f"Book ID {book_id} returned by {user_name} at {now}")
        conn.commit()
        conn.close()
        return True
    conn.close()
    return False

# Log activity
def log_activity(action, user_id, details):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now()
    cursor.execute('''
        INSERT INTO activity_logs (action, user_id, timestamp, details)
        VALUES (?, ?, ?, ?)
    ''', (action, user_id, now, details))
    conn.commit()
    conn.close()

# Generate daily report
def generate_daily_report(date=None):
    if date is None:
        date = datetime.date.today()
    start = datetime.datetime.combine(date, datetime.time.min)
    end = datetime.datetime.combine(date, datetime.time.max)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM activity_logs
        WHERE timestamp BETWEEN ? AND ?
        ORDER BY timestamp
    ''', (start, end))
    logs = cursor.fetchall()
    conn.close()
    
    if not logs:
        return "No activities recorded for this day."
    
    report = f"Daily Report for {date}:\n"
    for log in logs:
        user_name = "System" if log['user_id'] is None else get_user_name(log['user_id'])
        report += f"{log['timestamp']} - {log['action']} by {user_name}: {log['details']}\n"
    return report

# Helper to get user name
def get_user_name(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT full_name FROM users WHERE id = ?', (user_id,))
    name = cursor.fetchone()
    conn.close()
    return name['full_name'] if name else "Unknown"

# Backup database
def backup_database():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"library_backup_{now}.db")
    shutil.copy(DB_FILE, backup_file)
    print(f"Backup created: {backup_file}")
    return backup_file

# --- Sugestões ---
def add_suggestion(title, author, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now()
    cursor.execute('''
        INSERT INTO suggestions (title, author, message, created_at)
        VALUES (?, ?, ?, ?)
    ''', (title, author, message, now))
    conn.commit()
    conn.close()
    return True

def list_suggestions(only_unhandled=False):
    conn = get_db_connection()
    cursor = conn.cursor()
    if only_unhandled:
        cursor.execute('SELECT * FROM suggestions WHERE handled = 0 ORDER BY created_at DESC')
    else:
        cursor.execute('SELECT * FROM suggestions ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def mark_suggestion_handled(sug_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE suggestions SET handled = 1 WHERE id = ?', (sug_id,))
    conn.commit()
    conn.close()
    return True

def remove_suggestion(sug_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM suggestions WHERE id = ?', (sug_id,))
    conn.commit()
    conn.close()
    return True

# Example usage
if __name__ == "__main__":
    init_database()
    
    # Example registrations
    register_user("admin", "admin123", "Admin User", "admin")
    register_user("student1", "pass123", "João Silva", "student")
    
    # Example login
    user_id, name = login_user("student1", "pass123")
    if user_id:
        print(f"Logged in as {name}")
    
    # Add books
    add_book("Python Programming", "Guido van Rossum", "1234567890")
    add_book("Database Systems", "Elmasri", "0987654321")
    
    # Borrow
    borrow_book(1, user_id)
    
    # Return (assuming loan_id=1)
    return_book(1, user_id)
    
    # Generate report
    print(generate_daily_report())
    
    # Backup
    backup_database()