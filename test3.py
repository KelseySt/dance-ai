from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


def process_video(video_path):
    # STEP 2: Create an PoseLandmarker object.
    base_options = python.BaseOptions(model_asset_path='pose_landmarker.task')
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        output_segmentation_masks=True)
    detector = vision.PoseLandmarker.create_from_options(options)

    # STEP 3 & 4: Process video frames
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error opening video file")
        return

    # Prepare output video
    fourcc = cv2.VideoWriter_fourcc(*'mp4v') # You might need to adjust the codec
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter('output.mp4', fourcc, fps, (width, height)) # Output video file

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert frame to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        detection_result = detector.detect(image)
        annotated_image = draw_landmarks_on_image(rgb_frame, detection_result)
        
        # Convert annotated image back to BGR for video output
        bgr_annotated_image = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)

        out.write(bgr_annotated_image)
        # Optional: Display the frame in real-time (slows down processing significantly)
        # cv2_imshow(bgr_annotated_image)
        # if cv2.waitKey(1) & 0xFF == ord('q'):
        #     break


    cap.release()
    out.release()
    print("Video processed successfully. Output saved as output.mp4")

# Example usage: Upload a video file
video_path = './testDemo'  # Assumes only one video is uploaded
process_video(video_path)