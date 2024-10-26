
import './App.css';
import React, { useEffect, useState } from 'react';

function VideoComponent() {
  return (
    <div className='grid grid-cols-2 justify-items-center w-full row-span-3 border border-black'>  
      <div className='w-full justify-items-center mx-3 my-10 border border-black'>
        Student Video
      </div>
      <div className='w-full justify-items-center mx-3 my-10 border border-black'>
        Teacher Video
      </div>
    </div>
  );
}

function BottomComponent() {
  return (
    <div className='w-full row-span-1 border border-black'>  
      <h2>Bottom</h2>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);

  {/* Fetch data from Flask/Backend */}
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data').then(response => response.json())
    .then(data => setData(data))
  }, []);

  return (
    <div className="App">
      {/* <h1>React + Flask Integration</h1>
      {data ? <p>{data.message}</p> : <p>Loading...</p>}*/}
      <div className='m-20 h-screen w-auto grid grid-rows-4 justify-items-center'>
         <VideoComponent />
         <BottomComponent />
      </div>  
    </div>
  );
}

export default App;
