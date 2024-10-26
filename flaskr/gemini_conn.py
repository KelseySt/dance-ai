import os
from dotenv import load_dotenv
import time
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

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



def generate_feedback(user_video_name, ref_video_name): 
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_schema": content.Schema(
            type=content.Type.OBJECT,
            enum=[],
            required=["user_video_name", "ref_video_name", "feedback"],
            properties={
                "user_video_name": content.Schema(
                    type=content.Type.STRING
                ),
                "ref_video_name": content.Schema(
                    type=content.Type.STRING
                ),
                "feedback": content.Schema(
                    type=content.Type.ARRAY,
                    items=content.Schema(
                        type=content.Type.OBJECT,
                        enum=[],
                        required=["timestamp", "error", "suggestion"],
                        properties={
                            "timestamp": content.Schema(
                                type=content.Type.STRING
                            ),
                            "error": content.Schema(
                                type=content.Type.STRING
                            ),
                            "suggestion": content.Schema(
                                type=content.Type.STRING
                            )
                        }
                    )
                ),
                "summary": content.Schema(
                    type=content.Type.STRING
                )
            }
        ),
        "response_mime_type": "application/json"
    }


    

    model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    )
    prompt = (
        f"You are given two video files:\n"
        f"1. {user_video_name} - A user attempting to replicate dance moves.\n"
        f"2. {ref_video_name} - The reference dance.\n\n"
        "Your task is to critique the errors in the first video compared to the reference. "
        "Only focus on major errors, including but not limited to incorrect moves, off-beat steps, "
        "and timing issues. List up to 8 key errors with timestamps, descriptions of the error, "
        "and tips for improvement."
        "timestamps should be a range for example 0:08-0:10"
    )
    print("Uploading files")
    files = [
    upload_to_gemini("uploads/"+user_video_name, mime_type="video/mp4"),
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

def test_conn(): 
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
    )

    response = model.generate_content([
       "test" 
    ])

    print(response.text)
    return response.text

# generate_feedback('test_reference.mp4', 'test_student.mp4')
