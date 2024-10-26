import os
from dotenv import load_dotenv
import time
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
from .handle_video import get_mismatch_frames

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def upload_to_gemini(path, mime_type=None):
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

def wait_for_files_active(files, max_retries=10, initial_delay=5):
    """Waits for the given files to be active using exponential backoff.
    
    This avoids constant polling by gradually increasing the delay between retries.
    """
    print("Waiting for file processing...")
    for file in files:
        retries = 0
        delay = initial_delay
        while retries < max_retries:
            file_state = genai.get_file(file.name).state.name
            if file_state == "ACTIVE":
                print(f"File {file.name} is now active.")
                break
            elif file_state != "PROCESSING":
                raise Exception(f"File {file.name} failed to process with state: {file_state}")
            
            print(f"File {file.name} still processing. Retrying in {delay} seconds...")
            time.sleep(delay)
            retries += 1
            delay *= 2  # Exponential backoff

        if retries == max_retries:
            raise TimeoutError(f"File {file.name} failed to become active after {max_retries} retries.")
    
    print("All files are active.")



def generate_feedback(user_video_name, ref_video_name, mismatch): 
    generation_config = {
        "response_mime_type": "application/json",
        "response_schema": { 
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "teacher_frame": {
                        "type": "integer",
                        "description": "Frame number from the teacher video."
                    },
                    "timestamp": {
                        "type": "string",
                        "description": "Timestamp of the teacher frame in HH:MM:SSS format."
                    },
                    "timestamp_student_range": {
                        "type": "string",
                        "description": "Timestamp of the student frames in HH:MM:SSS-HH:MM:SSS format."
                    },
                    "student_frames": {
                        "type": "array",
                        "items": {
                        "type": "integer"
                        },
                        "description": "Array of corresponding frame numbers from the student video."
                    },
                    "feedback": {
                        "type": "string",
                        "description": "Detailed feedback on the student's performance (max 100 words)."
                    },
                    "summary": {
                        "type": "string",
                        "description": "Short summary of the mistakes."
                    }
                },
                "required": [
                "teacher_frame",
                "timestamp",
                "timestamp_student_range",
                "student_frames",
                "feedback",
                "summary"
                ]
            }
        },
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192
    }

    

    model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    )
    prompt = (
        f"You are given two video files and a list of frames:\n"
        f"1. {user_video_name} - A user attempting to replicate dance moves.\n"
        f"2. {ref_video_name} - The reference dance.\n"
        f"3. {mismatch} - A list of frames from the reference dance that each contain an array of frames from the user video.\n"
        "Your task is to provide feedback for each reference frame on how the user frames are different from the reference frames."
        "The output should be formatted as such: JSON format for each reference frame to show successful analysis and the 100 word max description of how to improve the section. "
        "A shorter summary of the mistakes should also be added according to the schema"
        "Add the timestamp up to milliseconds in the video corresponding to the parent frame using 30 frames per second.\n"
        "Here is example output:\n"
        """[
            {
                "teacher_frame": 55,
                "timestamp": "00:01:833",
                "student_frames": [49, 50, 51, 52],
                "feedback": "The student's arms are not fully extended upwards during the 'up' motion. The student's arm movements are also not as crisp and defined as the teacher's. Lastly, there seems to be some hesitation from the student, as the movements of the student don't match the rhythm and beats of the teacher.",
                "summary": "Arms not fully extended, movements lack crispness, and timing is slightly off."

            },
            {
                "teacher_frame": 56,
                "timestamp": "00:01:866",
                "student_frames": [53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                "feedback": "While the student completes the bringing-down motion with their arms, the transition from up to down and then back up is slightly slower than the teacher's. This makes the movement appear less fluid and dynamic.  The student should focus on maintaining the pace and energy throughout the sequence. Also, make sure to bend your knees slightly when bringing your arms down.",
                "summary": "Slightly slower transition and bent knees needed during 'down' motion."
            },
            {
                "teacher_frame": 64,
                "timestamp": "00:02:133",
                "student_frames": [72, 73, 74, 75, 76],
                "feedback": "The student appears to anticipate the upward motion too early.  Start the upward arm movement only when indicated and ensure your arms are fully extended upwards with palms facing each other, as demonstrated by the teacher. The student should also work on the speed of the arm movements to match the rhythm.",
                "summary": "Anticipating upward motion, arms not fully extended, and inconsistent speed."
            }
            ]
        """
    )


    print("Uploading files")
    files = [
    upload_to_gemini("uploads/"+ user_video_name, mime_type="video/mp4"),
    upload_to_gemini('uploads/' + ref_video_name, mime_type="video/mp4"),
    
    ]

    

    wait_for_files_active(files)


    print(prompt)
    response = model.generate_content([
        prompt, 
        files[0], 
        files[1]
    ])

    return response.text

#mismatch = get_mismatch_frames("testDemo/"+"student.mp4", 'testDemo/' + "teacher.mp4")
#json_return = generate_feedback("student.mp4", "teacher.mp4", mismatch)
#print(json_return)
