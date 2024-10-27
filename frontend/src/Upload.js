import './Upload.css';
import React, { useEffect, useState } from 'react';

function Upload() {
    const [setData] = useState(null);
    const [refVideo, setrefVideo] = useState('Reference Dance');
    const [userVideo, setuserVideo] = useState('Your Dance');
    const [refVideoFile, setrefVideoFile] = useState(null);
    const [userVideoFile, setuserVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    

        // Function to handle file change
        const handleFileChange = (event, setter, fileSetter) => {
            if(event.target.files.length > 0) {
                const file = event.target.files[0];  //sets file as the current file
                setter((setter === setrefVideo ? 'Reference ' : 'Your ') + 'Dance ✓');    //Sets the videos text
                fileSetter(file);    //Stores file
            }
        };

        const handleSubmit = async (event) => {
            event.preventDefault(); //This should prevent the default form submission

            setLoading(true);   //Loading true on form submission
            
            const formData = new FormData(); 
            if (refVideoFile) formData.append('ref_video', refVideoFile);
            if (userVideoFile) formData.append('user_video', userVideoFile);

            try {
                // const response = await fetch('/your-upload-endpoint', { //replace with upload endpoint
                const response = await fetch('http://127.0.0.1:5000/api/feedback', {
                    method: 'POST',
                    body: formData,
                });

                fetch('http://127.0.0.1:5000/api/data')
                .then(response => response.json())
                .then(data => console.log("Test connection data:", data))
                .catch(error => console.error("Test connection error:", error));

                if (response.ok) {
                    console.log("Success:");
                    setLoading(false);  //Stops loading on success
                } else {
                    console.error("Uploaded failed: ", response.statusText);
                    console.log("Uploading:", refVideoFile, userVideoFile);
                }
            } catch(error) {
                console.error('Error', error);
            } finally {
                setLoading(false); //Stops loading incase of error
            }
        };
    return (
            <div className="bg-orange-200 flex items-center justify-center h-screen w-screen">
            <div className="absolute inset-x-96 w-96 h-96 scale-125 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute inset-y-40 w-96 h-96 scale-125 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
            <div className="absolute right-96 bottom-10 inset-x--10 w-96 h-96 scale-125 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
            <div className="absolute left-0 top-0 w-60 h-60 bg-lime-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute right-11 bottom-12 w-44 h-44 scale-125 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>


            <div class="absolute bg-transparent scale-125 p-3 rounded-[30px] w-[350px] opacity-100 text-center shadow-2xl">
                <h2 className="text-[2em] mb-[15px] text-white">Upload Your Videos</h2>
                <form id="upload-form">
                <label for="refVideo" class="block bg-rose-200 border-2 border-white rounded-[15px] my-2 p-4 text-black cursor-pointer transition-colors duration-300 hover:bg-gray-300 shadow-md">
                {refVideo}
                <input type="file" id="refVideo" name="refVideo" accept="video/*" required className="hidden"
                        onChange={(e) => handleFileChange(e, setrefVideo, setrefVideoFile)}
                        handleSubmit/>
                        </label>
                <label for="userVideo" class="block bg-rose-200 border-2 border-white rounded-[15px] my-2 p-4 text-black cursor-pointer transition-colors duration-300 hover:bg-gray-300 shadow-md">
                {userVideo}                                  
                <input type="file" id="userVideo" name="userVideo" accept="video/*" required className="hidden"
                        onChange={(e) => handleFileChange(e, setuserVideo, setuserVideoFile)}
                        handleSubmit/>
                        </label>
                    <button type="submit" class="block bg-green-500 text-white py-2 px-4 rounded-lg w-full cursor-pointer text-lg transition-colors duration-300 hover:bg-green-600">Upload Videos</button>
                </form>
                </div>
                </div>
                );
           }
             export default Upload;