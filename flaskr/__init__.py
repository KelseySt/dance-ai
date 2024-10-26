import os
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename

from . import gemini_conn
def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )
    CORS(app)
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi'}  # Add allowed video extensions

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Home route to render the index.html template
    @app.route('/')
    def home():
        return render_template('index.html')

    # Data endpoint
    @app.route('/api/data')
    def get_data():
        data = {'message': 'Hello from Flask!'}
        return jsonify(data)

    from flask import request, jsonify
    
    @app.route('/api/data', methods=['POST'])
    def handle_file_upload():
        if 'ref_video' not in request.files or 'user_video' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
    
        ref_video_file = request.files['ref_video']
        user_video_file = request.files['user_video']
    
        # Save the files to a directory
        ref_video_file.save(os.path.join(app.config['UPLOAD_FOLDER'], ref_video_file.filename))
        user_video_file.save(os.path.join(app.config['UPLOAD_FOLDER'], user_video_file.filename))
    
        # Process the files as needed
        # ...
    
        return jsonify({'message': 'Files uploaded successfully'}), 200    
        
    @app.route('/api/feedback', methods=['GET', 'POST'])
    def get_feedback(): 
        return gemini_conn.generate_feedback('test_reference.mp4', 'test_student.mp4')

        if 'ref_video' not in request.files or 'user_video' not in request.files:
            return 'No file part', 400

        user_video = request.files['user_video']
        ref_video = request.files['ref_video']

        if user_video.filename == '' or ref_video.filename == '':
            return 'No selected file', 400

        if user_video and ref_video:
            user_video_name = secure_filename(user_video.filename)
            ref_video_name = secure_filename(ref_video.filename)
            user_video.save(os.path.join(app.config['UPLOAD_FOLDER'], user_video_name))
            ref_video.save(os.path.join(app.config['UPLOAD_FOLDER'], ref_video_name))
        else:
            return 'File type not allowed', 400
        
        return gemini_conn.generate_feedback(user_video_name, ref_video_name)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    return app

if __name__ == '__main__':
    app.run(debug=True)
