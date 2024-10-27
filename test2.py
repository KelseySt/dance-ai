import cv2
import mediapipe as mp
import numpy as np

from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2


mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

cap = cv2.VideoCapture('../testDemo/student.mp4')

body_landmarks = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

body_connections = [
    (11, 12),  # Left shoulder to right shoulder
    (11, 13),  # Left shoulder to left elbow
    (12, 14),  # Right shoulder to right elbow
    (13, 15),  # Left elbow to left wrist
    (14, 16),  # Right elbow to right wrist
    (11, 23),  # Left shoulder to left hip
    (12, 24),  # Right shoulder to right hip
    (23, 25),  # Left hip to left knee
    (24, 26),  # Right hip to right knee
    (25, 27),  # Left knee to left ankle
    (26, 28),  # Right knee to right ankle
]


# Get the width and height of the video for saving output
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter object to save the output video
output_path = 'result.mp4'  # Output video file path
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, 30, (frame_width, frame_height))


with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        
        # Recolor image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
      
        # Make detection
        results = pose.process(image)
    
        # Recolor back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        if results.pose_landmarks:
            # Create a list of filtered landmarks based on body_landmarks indices
            filtered_landmarks = [
                results.pose_landmarks.landmark[i] for i in body_landmarks
            ]
            
            # Draw each filtered landmark
            for landmark in filtered_landmarks:
                h, w, _ = image.shape
                x, y = int(landmark.x * w), int(landmark.y * h)
                cv2.circle(image, (x, y), 5, (0, 255, 0), -1)  # Draw the landmark

                # Draw connections between the filtered landmarks
            for start_idx, end_idx in body_connections:
                start_landmark = filtered_landmarks[body_landmarks.index(start_idx)]
                end_landmark = filtered_landmarks[body_landmarks.index(end_idx)]
                start_x, start_y = int(start_landmark.x * w), int(start_landmark.y * h)
                end_x, end_y = int(end_landmark.x * w), int(end_landmark.y * h)
                cv2.line(image, (start_x, start_y), (end_x, end_y), (255, 0, 0), 2)  # Draw the line

                
        #mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
         #                   mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
          #                  mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                     #           )               
        
        out.write(image)

        cv2.imshow('Mediapipe Feed', image)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()