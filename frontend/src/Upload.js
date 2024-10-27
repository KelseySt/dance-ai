import './Upload.css';
import React, { useEffect, useState } from 'react';

function Upload() {
        const [data, setData] = useState(null);

        const [refVideo, setrefVideo] = useState('Reference Dance');

        const [userVideo, setuserVideo] = useState('Your Dance');

        const [refVideoFile, setrefVideoFile] = useState(null);

        const [userVideoFile, setuserVideoFile] = useState(null);

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
            
            const formData = new FormData(); 
            formData.append('ref_video', refVideoFile);  //Add reference video
            formData.append('user_video', userVideoFile);//Add user video

            fetch('/api/data', {
              method: 'POST',
              body: formData,
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));

            try {
                const response = await fetch('/api/data', formData, { // Send data to Flask backend
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Test connection:", data);
                } else {
                    console.error("Uploaded failed: ", response.statusText);
                    console.log("Uploading:", refVideoFile, userVideoFile);
                }
            } catch(error) {
                console.error('Error', error);
            }
        };
    
    // Return method which displays the file upload form
    //change text to white
    //add a box shadow to the card
    return (
    <div className='bg-orange-200 flex items-center justify-center h-screen w-screen'> 
            <div className='absolute w-96 h-96 scale-150 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000'></div>
            <div className='absolute w-96 h-96 scale-150 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opactiy-50 animate-blob'></div>
            <div className='absolute w-96 h-96 scale-150 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000'></div>
                <div className="left-1/2 top-1 -translate-x-1/2 bg-transparent scale-125 p-3 rounded-[30px] w-[350px] opacity-100 text-center shadow-2xl">
                <h2 className="text-[2em] mb-[15px] text-white">Upload Your Videos</h2>
                <form id="upload-form">
                    <label htmlFor="refVideo" className="block bg-rose-200 border-2 border-white rounded-[15px] my-2 p-4 text-black cursor-pointer transition-colors duration-300 hover:bg-gray-300 shadow-md">
                    {refVideo}
                        <input type="file" id="refVideo" name="refVideo" accept="video/*" required className="hidden" 
                        onChange={(e) => handleFileChange(e, setrefVideo, setrefVideoFile)}
                        handleSubmit/>
                    </label>
                    <label htmlFor="userVideoFile" className="block bg-rose-200 border-2 border-white rounded-[15px]  my-2 p-4 text-black cursor-pointer transition-colors duration-300 hover:bg-gray-300 shadow-md">
                    {userVideo}                                  
                        <input type="file" id="userVideoFile" name="userVideoFile" accept="video/*" required className="hidden" 
                        onChange={(e) => handleFileChange(e, setuserVideo, setuserVideoFile)}
                        handleSubmit/>
                    </label>
                    <button type="submit" className="block bg-green-500 border-white text-white py-2 px-4 rounded-lg w-full cursor-pointer text-lg transition-colors duration-300 hover:bg-green-600">
                        Upload Videos
                    </button>
                </form>
                </div>
    </div>    
    );

    return <div>Data: {data}</div>
}
  export default Upload;
