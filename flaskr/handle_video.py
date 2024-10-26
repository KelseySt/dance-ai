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
    # print("XXXXXXXXXXXXXXX")
    # print(results.pose_landmarks)
    return vec_video_landmarks, results.pose_landmarks

def get_mismatch_frames(student_video_path, ref_video_path): 
    stud_ladmarks, lll = generate_video_landmarks(student_video_path)
    ref_landmarks, rrr = generate_video_landmarks(ref_video_path)
    mismatched_frames = calculate(stud_ladmarks, ref_landmarks)
    return mismatched_frames 

# video_path = '../testDemo/student.mp4'  # Replace with your actual video path
# ref_video_path = '../testDemo/teacher.mp4'
# print(get_mismatch_frames(video_path, ref_video_path))

# stud_landmarks, lll = generate_video_landmarks(video_path)
# ref_landmarks, rrr = generate_video_landmarks(ref_video_path)
# mismatched_frames = calculate(stud_landmarks, ref_landmarks)



# def render_videos_with_annotation(video_path1, landmarks1, video_path2, landmarks2):
#     mp_drawing = mp.solutions.drawing_utils
#     cap1 = cv2.VideoCapture(video_path1)
#     cap2 = cv2.VideoCapture(video_path2)
#     while cap1.isOpened() or cap2.isOpened(): 
#         ret1, frame_of_1 = cap1.read()
#         ret2, frame_of_2 = cap2.read()
#         if not ret1 and not ret2: 
#             break
        
#         if ret1: 
#             rgb_frame1 = cv2.cvtColor(frame_of_1, cv2.COLOR_BGR2RGB)
#             mp_drawing.draw_landmarks(frame_of_1, lll, mp_pose.POSE_CONNECTIONS)
#             cv2.imshow("Video 1", frame_of_1)
#         if ret2: 
#             rgb_frame2 = cv2.cvtColor(frame_of_2, cv2.COLOR_BGR2RGB)
#             mp_drawing.draw_landmarks(frame_of_2, rrr, mp_pose.POSE_CONNECTIONS)
#             cv2.imshow("Video 2", frame_of_2)
#         if cv2.waitKey(10) & 0xFF == ord('q'): 
#             break 
    
#     cap1.release()
#     cap2.release()
#     cv2.destroyAllWindows()

# render_videos_with_annotation(video_path,  stud_landmarks, ref_video_path, ref_landmarks)



