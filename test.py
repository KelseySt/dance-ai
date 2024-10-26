import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

def find_start_frame(cap, pose_detector, movement_threshold=0.05):
    previous_landmarks = None
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Process the frame to detect landmarks
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose_detector.process(frame_rgb)

        if results.pose_landmarks:
            # Convert current landmarks to an array
            current_landmarks = np.array([[lm.x, lm.y, lm.z] for lm in results.pose_landmarks.landmark])

            # Calculate movement if previous landmarks exist
            if previous_landmarks is not None:
                movement = np.linalg.norm(current_landmarks - previous_landmarks, axis=1).mean()
                
                # If movement exceeds the threshold, consider it the start frame
                if movement > movement_threshold:
                    return frame_count

            # Update previous landmarks
            previous_landmarks = current_landmarks

        frame_count += 1

    return None


# Open video files

cap_teacher = cv2.VideoCapture("../testDemo/teacher.mp4")
cap_student = cv2.VideoCapture("../testDemo/student.mp4")

start_frame_teacher = find_start_frame(cap_teacher, pose)
start_frame_student = find_start_frame(cap_student, pose)

cap_teacher.set(cv2.CAP_PROP_POS_FRAMES, start_frame_teacher)
cap_student.set(cv2.CAP_PROP_POS_FRAMES, start_frame_student)


# Check if videos are opened successfully
if not cap_teacher.isOpened() or not cap_student.isOpened():
    print("Error: Could not open one of the video files.")
    exit()

# Process frames in sync
while cap_teacher.isOpened() and cap_student.isOpened():
    ret_teacher, frame_teacher = cap_teacher.read()
    ret_student, frame_student = cap_student.read()

    if not ret_teacher or not ret_student:
        break

    # Display the synchronized frames side-by-side
    combined_frame = cv2.hconcat([frame_teacher, frame_student])
    cv2.imshow("Synchronized Dance Comparison", combined_frame)

    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

# Release resources
cap_teacher.release()
cap_student.release()
cv2.destroyAllWindows()
pose.close()