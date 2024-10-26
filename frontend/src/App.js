
import './App.css';
import React, { useEffect, useState } from 'react';

function TopComponent() {
  return (
    <div className='grid grid-cols-2 justify-items-center w-full row-span-2 border border-black'>  
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
    <div className='flex items-center grid grid-row-3 w-full row-span-2 border border-black'>  
      <ProgressBarComponent progressValue="60"/> {/* progressValuee determines progress bar percentage */}
      <div className="contents-center row-span-2">
      </div>

    </div>
  );
}

function ProgressBarComponent( { progressValue } ) {
  const [showInfobox, setShowInfobox] = useState(false); {/* Determines whether infobox appears */}
  const [infoboxPosition, setInfoboxPosition] = useState(null);

  function handleClick(position) {
    setShowInfobox(!showInfobox);
    setInfoboxPosition(position);
  }

  return (
    <div className="flex justify-center row-span-1">
      <div className="relative w-4/5 bg-gray-200 rounded-full h-2.5 dark:bg-gray-400">
        <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${progressValue}%`}}></div>
        <PairOfBoxes firstPosition={55} secondPosition={60} onClick={() => {handleClick(57.5)}}/>
        <PairOfBoxes firstPosition={20} secondPosition={23} onClick={() => {handleClick(21.5)}}/>

        {showInfobox ? <InfoboxComponent position={infoboxPosition}/> : null}
      </div>
    </div>
    
  );
}

function BlackBar( { progress }) {
  return (
    <div className={"z-10 absolute top-0 border border-black bg-black w-0.5 h-2.5"}  style={{ left: `${progress}%` }}>
    </div>
  );
}

function ClickableSegment({position, distance, onClick}) {
  return (
    <div 
      className='absolute top-0 h-2.5 cursor-pointer bg-red-400' style={{ left: `${position}%`, width: `${distance}%` }} 
      onClick={onClick}
    >
    </div>
  );
}

function PairOfBoxes({firstPosition, secondPosition, onClick}) {
  return (
    <>
      <BlackBar progress={firstPosition} />
      <ClickableSegment position={firstPosition} distance={(secondPosition-firstPosition)} onClick={onClick}/>
      <BlackBar progress={secondPosition} />
    </>
  )
}

function InfoboxComponent({position}) {
  return (
    <div> 
      <div
        className="absolute bg-white border border-black p-2 rounded"
        style={{ top: '30px', left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <h1>Timestamp</h1>
        <h1>Feedback</h1>
        <h1>Improvement</h1>
      </div>
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
      <div className='m-10 h-screen w-auto grid grid-rows-4 justify-items-center'>
         <TopComponent />
         <BottomComponent />
      </div>  
    </div>
  );
}

export default App;
