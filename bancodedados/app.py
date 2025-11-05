from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import banco  # usa as funções do banco.py
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)

# inicializa DB (uma vez)
banco.init_database()

# Authentication (simples)
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json or {}
    ok = banco.register_user(data.get('username'), data.get('password'), data.get('full_name'), data.get('role', 'student'))
    return jsonify({'success': bool(ok)})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json or {}
    user_id, name = banco.login_user(data.get('username'), data.get('password'))
    if user_id:
        return jsonify({'user_id': user_id, 'full_name': name})
    return jsonify({'error': 'invalid_credentials'}), 401

# Books
@app.route('/api/books', methods=['GET', 'POST'])
def api_books():
    if request.method == 'GET':
        conn = banco.get_db_connection()
        rows = conn.execute('SELECT * FROM books').fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])
    else:
        data = request.json or {}
        book_id = banco.add_book(data.get('title'), data.get('author'), data.get('isbn'), data.get('available',1))
        return jsonify({'book_id': book_id})

# Loans
@app.route('/api/loans', methods=['GET', 'POST'])
def api_loans():
    if request.method == 'GET':
        conn = banco.get_db_connection()
        rows = conn.execute('''
            SELECT l.id, l.book_id, l.user_id, l.borrow_datetime, l.return_datetime,
                   b.title as book_title, u.full_name as user_name
            FROM loans l
            LEFT JOIN books b ON l.book_id = b.id
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.borrow_datetime DESC
        ''').fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])
    else:
        data = request.json or {}
        ok = banco.borrow_book(data.get('book_id'), data.get('user_id'))
        return jsonify({'success': bool(ok)})

@app.route('/api/loans/<int:loan_id>/return', methods=['POST'])
def api_return(loan_id):
    data = request.json or {}
    user_id = data.get('user_id')
    ok = banco.return_book(loan_id, user_id)
    return jsonify({'success': bool(ok)})

# Suggestions
@app.route('/api/suggestions', methods=['GET', 'POST', 'DELETE'])
def api_suggestions():
    if request.method == 'GET':
        only_unhandled = request.args.get('unhandled') == '1'
        rows = banco.list_suggestions(only_unhandled)
        return jsonify(rows)
    if request.method == 'POST':
        data = request.json or {}
        banco.add_suggestion(data.get('title'), data.get('author'), data.get('message'))
        return jsonify({'success': True})
    # DELETE expects JSON { "id": <id> }
    data = request.json or {}
    if 'id' in data:
        banco.remove_suggestion(data['id'])
        return jsonify({'success': True})
    return jsonify({'error': 'missing_id'}), 400

# optional: mark handled
@app.route('/api/suggestions/<int:sug_id>/handle', methods=['POST'])
def api_handle_suggestion(sug_id):
    banco.mark_suggestion_handled(sug_id)
    return jsonify({'success': True})

# Report (text)
@app.route('/api/report', methods=['GET'])
def api_report():
    text = banco.generate_daily_report()
    # return plain text; frontend may convert to PDF client-side or download .txt
    return jsonify({'report': text, 'generated_at': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True)