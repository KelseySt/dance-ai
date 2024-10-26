import './Upload.css';
import React, { useEffect, useState } from 'react';

function Upload() {
    const [data, setData] = useState(null);
  
    {/* Fetch data from Flask/Backend */}
    useEffect(() => {
      fetch('http://127.0.0.1:5000/api/data').then(response => response.json())
      .then(data => setData(data))
    }, []);

    const videoUpload = () =>  {
        const handleSubmit = async (event) => {
            event.preventDefault(); //This should prevent the default form submission
        

            const Formdata = new FormData(event.target);

            
            try {
                const response = await fetch('/your-upload-endpoint', { //replace with upload endpoint
                method: 'POST',
                body: FormData,
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Success: ", result);
                } else {
                    console.error("Uploaded failed: ", response.statusText);
                }
            } catch(error) {
                console.error('Error', error);
            }
        };
    }

    return (
    <div className="bg-white p-7 rounded-[50px] w-[400px] shadow-[0px_4px_8px_rgba(0,0,0,0,2)] text-center">
        <h2 className="text-[2em] mb-[15px]">Upload Your Videos</h2>
        <form id="upload-form">
        <label htmlFor="video1" className="block bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg 
                                            my-2 p-4 text-gray-800 cursor-pointer transition-colors duration-300 hover:bg-gray-300">
            Select Video 1
                <input type="file" id="video1" name="video1" accept="video/*" required className="hidden" />
        </label>
        <label htmlFor="video2" className="block bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg 
                                            my-2 p-4 text-gray-800 cursor-pointer transition-colors duration-300 hover:bg-gray-300">
            Select Video 2                                    
                <input type="file" id="video2" name="video2" accept="video/*" required className="hidden" />
        </label>
            <button type="submit" className="bg-green-500 text-white border-none py-2 px-4 rounded-lg w-full
                                            cursor-pointer text-lg transition-colors duration-300 hover:bg-green600">
                Upload Videos
            </button>
        </form>
    </div>
    );
  }
  
  export default Upload;

  // When accepting the files from the user, make sure to do it as a form
  // Use 'Formdata"