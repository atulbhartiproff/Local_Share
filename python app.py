from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow CORS for all domains
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Route to list all files in the upload directory
@app.route('/api/files', methods=['GET'])
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify(files)  # Return just the filenames, not full URLs


# Route to handle file uploads
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    try:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        file_url = f'http://{request.host}/api/download/{file.filename}'
        return jsonify({'message': 'File uploaded successfully', 'file_url': file_url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to handle file downloads
@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        # Ensure the file exists
        if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
        else:
            abort(404, description=f"File '{filename}' not found")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ensure upload directory exists and run the app
if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
