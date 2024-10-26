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

        {/* Fetch data from Flask/Backend */}
        useEffect(() => {
        fetch('http://127.0.0.1:5000/api/data').then(response => response.json())
        .then(data => setData(data))
      }, []);
    
    // Return method which displays the file upload form
    return (
    <div className="bg-purple-500 p-7 rounded-[30px] w-[400px] shadow-[0px_4px_8px_rgba(0,0,0,0,2)] text-center">
         <h2 className="text-[2em] mb-[15px]">Upload Your Videos</h2>
         <form id="upload-form">
            <label htmlFor="refVideo" className="block bg-gray-200 border-2 border-dashed border-gray-400 rounded-[15px] my-2 p-4 text-gray-800 cursor-pointer transition-colors duration-300 hover:bg-gray-300">
             {refVideo}
                 <input type="file" id="refVideo" name="refVideo" accept="video/*" required className="hidden" 
                onChange={(e) => handleFileChange(e, setrefVideo, setrefVideoFile)}
                handleSubmit/>
            </label>
            <label htmlFor="userVideoFile" className="block bg-gray-200 border-2 border-dashed border-gray-400 rounded-[15px]  my-2 p-4 text-gray-800 cursor-pointer transition-colors duration-300 hover:bg-gray-300">
            {userVideo}                                  
                <input type="file" id="userVideoFile" name="userVideoFile" accept="video/*" required className="hidden" 
                onChange={(e) => handleFileChange(e, setuserVideo, setuserVideoFile)}
                handleSubmit/>
            </label>
            <button type="submit" className="block bg-green-500 text-white border-none py-2 px-4 rounded-lg w-full cursor-pointer text-lg transition-colors duration-300 hover:bg-green-600">
                Upload Videos
            </button>
        </form>
    </div>
    );

    return <div>Data: {data}</div>
}
  export default Upload;
