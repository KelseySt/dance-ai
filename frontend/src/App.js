
import './App.css';
import React, { useEffect, useState } from 'react';

function TopComponent() {
  return (
    <div className='grid grid-cols-2 justify-items-center w-full row-span-3 border border-black'>  
      <VideoComponent title="Student"/>
      <VideoComponent title="Teacher"/>
    </div>
  );
}

function VideoComponent( { title } ) {
  return (
    <div className='w-11/12 justify-items-center mx-3 my-10 border border-black'>
        { title } Video
      </div>
  )
}

function BottomComponent() {
  return (
    <div className='flex items-center grid grid-row-3 w-full row-span-1 border border-black'>  
      <ProgressBarComponent pvalue=".30"/>
      <div className="contents-center row-span-2"></div>
    </div>
  );
}

function ProgressBarComponent( { pvalue } ) {
  return (
    <div className="flex justify-center row-span-1 border border-green">
      <div class="relative w-4/5 bg-gray-200 rounded-full h-2.5 dark:bg-gray-400">
        <div class="bg-red-600 h-2.5 rounded-full w-[60%]"></div>
        <PairOfBoxes firstPosition={1} secondPosition={3}/>
      </div>
    </div>
    
  );
}

function BlackBar( { progress }) {
  return (
    <div className={"absolute top-0 border border-black bg-black w-0.5 h-2.5"}  style={{ left: `${progress}%` }}>
    </div>
  );
}

function ClickableSegment({position, distance}) {
  return (
    <div className='absolute top-0 h-2.5 cursor-pointer' style={{ left: `${position}%`, width: `${distance}%` }}>
    </div>
  );
}

function PairOfBoxes({firstPosition, secondPosition}) {
  return (
    <>
      <BlackBar progress={firstPosition} />
      <ClickableSegment position={firstPosition} distance={(secondPosition-firstPosition)} />
      <BlackBar progress={secondPosition} />
    </>
  )
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
         <TopComponent />
         <BottomComponent />
      </div>  
    </div>
  );
}

export default App;
