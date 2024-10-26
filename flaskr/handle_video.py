import cv2
import mediapipe as mp
import numpy as np
from dtw import calculate
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False)

def generate_video_landmarks(video_path): 
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video.")
        exit()
    vec_video_landmarks = []
    raw_landmarks = []
    while cap.isOpened(): 
        ret, frame = cap.read()
        if not ret: 
            print("reached end of video")
            break 
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)
        if results.pose_landmarks: 
            vec = []
            for landmark in results.pose_landmarks.landmark:
                vec.append([landmark.x, landmark.y, landmark.z])
            vec_video_landmarks.append(vec)
    cap.release()
    return vec_video_landmarks

def get_mismatch_frames(student_video_path, ref_video_path): 
    stud_ladmarks = generate_video_landmarks(student_video_path)
    ref_landmarks = generate_video_landmarks(ref_video_path)
    mismatched_frames = calculate(stud_ladmarks, ref_landmarks)
    return mismatched_frames 

video_path = '../testDemo/student.mp4'  # Replace with your actual video path
ref_video_path = '../testDemo/teacher.mp4'
# print(get_mismatch_frames(video_path, ref_video_path))

