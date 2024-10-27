import os
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from .handle_video import get_mismatch_frames
from .compareTest import process_videos

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
    @app.route('/api/feedback', methods=['GET', 'POST'])
    def get_feedback(): 
        # return gemini_conn.generate_feedback('test_reference.mp4', 'test_student.mp4')

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
        
        mismatch_data = get_mismatch_frames("uploads/" + user_video_name, "uploads/" + ref_video_name)
        ai_answer = gemini_conn.generate_feedback(user_video_name, ref_video_name, mismatch_data[0], mismatch_data[1])
        process_videos("uploads/" + ref_video_name, "uploads/" + user_video_name)
        return jsonify(ai_answer)

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
