import cv2
import mediapipe as mp

# Initialize MediaPipe Pose model
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False)
mp_drawing = mp.solutions.drawing_utils

# Path to the local video file
video_path = './testDemo/student.mp4'  # Replace with your actual video path

# Open the video file
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Reached end of video or encountered an error.")
        break
    
    # Convert the BGR image to RGB for MediaPipe processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process the image and extract pose landmarks
    results = pose.process(rgb_frame)
    
    # Check if landmarks are detected
    if results.pose_landmarks:
        # Draw landmarks on the frame
        mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        
        # Output landmark data (coordinates, visibility)
        landmarks = results.pose_landmarks.landmark
        for idx, landmark in enumerate(landmarks):
            print(f"Landmark {idx}: x={landmark.x}, y={landmark.y}, z={landmark.z}, visibility={landmark.visibility}")

    # Display the processed frame with landmarks
    cv2.imshow("Pose Landmarks", frame)
    
    # Press 'q' to exit the loop
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

# Release the video capture and close any OpenCV windows
cap.release()
cv2.destroyAllWindows()
