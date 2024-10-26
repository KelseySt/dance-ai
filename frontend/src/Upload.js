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
    return (
    
        // <div className="bg-gray-50 min-h-screen flex items-center justify-center fill-screen ">
        //   <div className="relative w-full max-w-lg">
        //     <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        //     <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        //     <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        //     <div className="m-8 relative space-y-4">
        //       <div className="p-5 bg-white rounded-lg flex items-center justify-between space-x-8">
        //         <div className="flex-1">
        //           <div className="h-4 w-48 bg-gray-300 rounded"></div>
        //         </div>
        //         <div>
        //           <div className="w-24 h-6 rounded-lg bg-purple-300"></div>
        //         </div>
        //       </div>
        //       <div className="p-5 bg-white rounded-lg flex items-center justify-between space-x-8">
        //         <div className="flex-1">
        //           <div className="h-4 w-56 bg-gray-300 rounded"></div>
        //         </div>
        //         <div>
        //           <div className="w-20 h-6 rounded-lg bg-yellow-300"></div>
        //         </div>
        //       </div>
        //       <div className="p-5 bg-white rounded-lg flex items-center justify-between space-x-8">
        //         <div className="flex-1">
        //           <div className="h-4 w-44 bg-gray-300 rounded"></div>
        //         </div>
        //         <div>
        //           <div className="w-28 h-6 rounded-lg bg-pink-300"></div>
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        // </div>

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
