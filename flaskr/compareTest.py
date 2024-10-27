import numpy as np
import cv2
import mediapipe as mp
from scipy.spatial.distance import euclidean
from handle_video import get_mismatch_frames

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Used to calculate first instance of significant movement
KEY_LANDMARKS = [mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.RIGHT_SHOULDER,
                 mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.RIGHT_ELBOW,
                 mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.RIGHT_KNEE]

# For drawing appropriate nodes
landmark_indices = {
    "LS": mp_pose.PoseLandmark.LEFT_SHOULDER.value,
    "RS": mp_pose.PoseLandmark.RIGHT_SHOULDER.value,
    "LE": mp_pose.PoseLandmark.LEFT_ELBOW.value,
    "RE": mp_pose.PoseLandmark.RIGHT_ELBOW.value,
    "LW": mp_pose.PoseLandmark.LEFT_WRIST.value,
    "RW": mp_pose.PoseLandmark.RIGHT_WRIST.value,
    "LH": mp_pose.PoseLandmark.LEFT_HIP.value,
    "RH": mp_pose.PoseLandmark.RIGHT_HIP.value,
    "LK": mp_pose.PoseLandmark.LEFT_KNEE.value,
    "RK": mp_pose.PoseLandmark.RIGHT_KNEE.value,
    "LA": mp_pose.PoseLandmark.LEFT_ANKLE.value,
    "RA": mp_pose.PoseLandmark.RIGHT_ANKLE.value,
}

def draw_landmarks_and_vectors(image, landmarks):
        # Draw landmarks
        for name, index in landmark_indices.items():
            landmark = landmarks.landmark[index]
            h, w, _ = image.shape
            x, y = int(landmark.x * w), int(landmark.y * h)
            cv2.circle(image, (x, y), 5, (0, 50, 255), -1)  
            cv2.putText(image, name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # Draw vectors between specific landmarks
        pairs = [
            ("LS", "LE"),
            ("LE", "LW"),
            ("RS", "RE"),
            ("RE", "RW"),
            ("LH", "LK"),
            ("LK", "LA"),
            ("RH", "RK"),
            ("RK", "RA"),
            ("LS", "LH"),
            ("RS", "RH"),
            ("RS", "LS"),
            ("RH","LH")
        ]

        for p1, p2 in pairs:
            point1 = landmarks.landmark[landmark_indices[p1]]
            point2 = landmarks.landmark[landmark_indices[p2]]
            h, w, _ = image.shape
            x1, y1 = int(point1.x * w), int(point1.y * h)
            x2, y2 = int(point2.x * w), int(point2.y * h)
            cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 2)  


def draw_landmarks_and_vectors_s(image, landmarks, accurate):
        # Draw landmarks
        for name, index in landmark_indices.items():
            landmark = landmarks.landmark[index]
            h, w, _ = image.shape
            x, y = int(landmark.x * w), int(landmark.y * h)
            cv2.circle(image, (x, y), 5, (0, 50, 255), -1) 
            cv2.putText(image, name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # Draw vectors between specific landmarks
        pairs = [
            ("LS", "LE"),
            ("LE", "LW"),
            ("RS", "RE"),
            ("RE", "RW"),
            ("LH", "LK"),
            ("LK", "LA"),
            ("RH", "RK"),
            ("RK", "RA"),
            ("LS", "LH"),
            ("RS", "RH"),
            ("RS", "LS"),
            ("RH","LH")
        ]

        for p1, p2 in pairs:
            point1 = landmarks.landmark[landmark_indices[p1]]
            point2 = landmarks.landmark[landmark_indices[p2]]
            h, w, _ = image.shape
            x1, y1 = int(point1.x * w), int(point1.y * h)
            x2, y2 = int(point2.x * w), int(point2.y * h)
            if accurate:
                cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Green
            else:
                cv2.line(image, (x1, y1), (x2, y2), (0, 0, 255), 2) # Red



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
    return keypoints

def normalize_pose(pose):
    left_shoulder, right_shoulder = np.array(pose[0]), np.array(pose[1])
    torso_length = np.linalg.norm(left_shoulder - right_shoulder)
    return [(np.array(point) - left_shoulder) / torso_length for point in pose]

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

def detect_differences(teacher_keypoints, student_keypoints, teacher_start_frame, difference_threshold=0.5):
    differing_frames = []
    teacher_pose = normalize_pose(teacher_keypoints[teacher_start_frame])

    for i, student_pose in enumerate(student_keypoints):
        normalized_student_pose = normalize_pose(student_pose)
        difference = np.sum([euclidean(tp, sp) for tp, sp in zip(teacher_pose, normalized_student_pose)])
        
        if difference > difference_threshold:
            differing_frames.append(i)
    return differing_frames

def process_videos(teacher_video_path, student_video_path, output_path="./frontend/public/processed_video.mp4"):
    teacher_keypoints = extract_keypoints(teacher_video_path)
    student_keypoints = extract_keypoints(student_video_path)
    
    teacher_start_frame = find_starting_pose(teacher_keypoints)
    student_start_frame = find_starting_pose(student_keypoints)
    #student_start_frame = find_matching_frame(teacher_keypoints[teacher_start_frame], student_keypoints)
    
    differing_frames = get_mismatch_frames(student_video_path, teacher_video_path)[0]
    print("Differing frames: ")
    print(differing_frames)
    
    cap_teacher = cv2.VideoCapture(teacher_video_path)
    cap_student = cv2.VideoCapture(student_video_path)

    cap_teacher.set(cv2.CAP_PROP_POS_FRAMES, teacher_start_frame)
    
    cap_student.set(cv2.CAP_PROP_POS_FRAMES, student_start_frame)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = int(cap_teacher.get(cv2.CAP_PROP_FPS))
    frame_width = int(cap_teacher.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap_teacher.get(cv2.CAP_PROP_FRAME_HEIGHT))

    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width * 2, frame_height))

    # Populate student frames to look for
    student_wrong = [value for values in differing_frames.values() for value in values]


    with mp_pose.Pose(static_image_mode=False) as pose:
        frame_index = 0
        while cap_teacher.isOpened() and cap_student.isOpened():
            accurate = True
            ret_teacher, frame_teacher = cap_teacher.read()
            ret_student, frame_student = cap_student.read()
            
            if not ret_teacher or not ret_student:
                break

            results_teacher = pose.process(cv2.cvtColor(frame_teacher, cv2.COLOR_BGR2RGB))
            results_student = pose.process(cv2.cvtColor(frame_student, cv2.COLOR_BGR2RGB))

            real_frame_s = frame_index # + student_start_frame   
            # Draw pose landmarks on the teacher's and student's frames
            if results_teacher.pose_landmarks:
                draw_landmarks_and_vectors(frame_teacher, results_teacher.pose_landmarks)
            if results_student.pose_landmarks:
                if real_frame_s in student_wrong:
                    accurate = False
                draw_landmarks_and_vectors_s(frame_student, results_student.pose_landmarks, accurate)
                
            frame_student = cv2.resize(frame_student, (frame_width, frame_height))

            combined_frame = np.hstack((frame_teacher, frame_student))
            out.write(combined_frame)

            frame_index += 1
    print(differing_frames)
    cap_teacher.release()
    cap_student.release()
    out.release()
    print(f"Processed video saved to {output_path}")

#process_videos("./testDemo/teacher1.mp4", "./testDemo/student2.3.mp4")
