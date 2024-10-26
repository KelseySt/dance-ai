import numpy as np
import cv2
import mediapipe as mp
from scipy.spatial.distance import euclidean

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

KEY_LANDMARKS = [mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.RIGHT_SHOULDER,
                 mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.RIGHT_ELBOW,
                 mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.RIGHT_KNEE,
                 mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.RIGHT_HIP]

def extract_keypoints(video_path):
    keypoints = []
    
    cap = cv2.VideoCapture(video_path)
    with mp_pose.Pose(static_image_mode=False) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame to get keypoints
            results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if results.pose_landmarks:
                landmarks = [(results.pose_landmarks.landmark[lm].x,
                              results.pose_landmarks.landmark[lm].y,
                              results.pose_landmarks.landmark[lm].z) for lm in KEY_LANDMARKS]
                keypoints.append(landmarks)
                
    cap.release()
    print("Keypoint at 0: ")
    print(keypoints[0])
    return keypoints

def find_starting_pose(keypoints_sequence, movement_threshold=0.1):
    for i in range(1, len(keypoints_sequence)):
        movement = np.sum([np.linalg.norm(np.array(p1) - np.array(p2))
                           for p1, p2 in zip(keypoints_sequence[i-1], keypoints_sequence[i])])
        
        if movement > movement_threshold:
            return i
    return 0

def find_matching_frame(target_pose, keypoints_sequence):
    min_distance = float('inf')
    matching_frame_index = 0
    
    for i, pose in enumerate(keypoints_sequence):
        distance = np.sum([euclidean(tp, sp) for tp, sp in zip(target_pose, pose)])
        if distance < min_distance:
            min_distance = distance
            matching_frame_index = i
    return matching_frame_index

def detect_differences(teacher_keypoints, student_keypoints, teacher_start_frame, difference_threshold=6.5):
    return

def process_videos(teacher_video_path, student_video_path, output_path="processed_output.mp4"):
    teacher_keypoints = extract_keypoints(teacher_video_path)
    student_keypoints = extract_keypoints(student_video_path)
    
    teacher_start_frame = find_starting_pose(teacher_keypoints)
    student_start_frame = find_matching_frame(teacher_keypoints[teacher_start_frame], student_keypoints)
    
    differing_frames = detect_differences(teacher_keypoints, student_keypoints, teacher_start_frame)
    
    cap_teacher = cv2.VideoCapture(teacher_video_path)
    cap_student = cv2.VideoCapture(student_video_path)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = int(cap_teacher.get(cv2.CAP_PROP_FPS))
    frame_width = int(cap_teacher.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap_teacher.get(cv2.CAP_PROP_FRAME_HEIGHT))

    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width * 2, frame_height))
    
    with mp_pose.Pose(static_image_mode=False) as pose:
        frame_index = 0
        while cap_teacher.isOpened() and cap_student.isOpened():
            ret_teacher, frame_teacher = cap_teacher.read()
            ret_student, frame_student = cap_student.read()
            
            if not ret_teacher or not ret_student:
                break

            results_teacher = pose.process(cv2.cvtColor(frame_teacher, cv2.COLOR_BGR2RGB))
            results_student = pose.process(cv2.cvtColor(frame_student, cv2.COLOR_BGR2RGB))

            # Draw pose landmarks on the teacher's and student's frames
            if results_teacher.pose_landmarks:
                mp_drawing.draw_landmarks(frame_teacher, results_teacher.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            if results_student.pose_landmarks:
                mp_drawing.draw_landmarks(frame_student, results_student.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            
            frame_student = cv2.resize(frame_student, (frame_width, frame_height))

            # Highlight start frame
            if frame_index == teacher_start_frame:
                cv2.putText(frame_teacher, "Start Frame", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            if frame_index == student_start_frame:
                cv2.putText(frame_student, "Start Frame", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Highlight differing frames
            if frame_index in differing_frames:
                cv2.putText(frame_student, "Pose Mismatch", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            combined_frame = np.hstack((frame_teacher, frame_student))
            out.write(combined_frame)

            frame_index += 1
    
    cap_teacher.release()
    cap_student.release()
    out.release()

    print(f"Processed video saved to {output_path}")

# Example usage
process_videos("./testDemo/teacher.mp4", "./testDemo/teacher.mp4")
