import './App.css';
import React, { useEffect, useState } from 'react';
import BlackBar from './components/BlackBar.js';
import ClickableSegment from './components/ClickableSegment.js';

let numOfTimestamps;
let timestampRanges;
let showInfobox;
let infoboxPosition;
let infoboxTimestamp;
let infoboxFeedback;
let infoboxImprovement;
let setTimestampRanges;
let setShowInfobox;
let setInfoboxPosition;
let setInfoboxTimestamp;
let setInfoboxFeedback;
let setInfoboxImprovement;
let timestampArr;

function Setup() {
  numOfTimestamps = jsonData.feedback.length;
  [timestampRanges, setTimestampRanges] = useState(Array(numOfTimestamps).fill([null, null, null, null, null, null]));
  [showInfobox, setShowInfobox] = useState(false); {/* Determines whether infobox appears */}
  [infoboxPosition, setInfoboxPosition] = useState(null);
  [infoboxTimestamp, setInfoboxTimestamp] = useState(null);
  [infoboxFeedback, setInfoboxFeedback] = useState(null);
  [infoboxImprovement, setInfoboxImprovement] = useState(null);

  timestampArr = parseFeedback(jsonData);

  useEffect(() => {
    const updatedRanges = timestampArr.slice().map(([totalLength, start, end, feedback, improvement]) => {
      const first = secondsToProgress(start, totalLength);
      const second = secondsToProgress(end, totalLength);
      const clickPosition = (first + second) / 2;
      const sfeedback = feedback;
      const simprovement = improvement;
      return [totalLength, first, second, clickPosition, sfeedback, simprovement];
    });
    // Update the state with the new timestamp ranges
    setTimestampRanges(updatedRanges);
  }, [numOfTimestamps]);
}


function handleClick(position, timestamp, feedback, improvement) {
  console.log('clicked!');
  if (infoboxPosition === position) {
    setShowInfobox(false); // Close the infobox if it's already open and showing the same feedback
  } else {
    setShowInfobox(true); // Open the infobox otherwise
    setInfoboxPosition(position);
    setInfoboxTimestamp(timestamp);
    setInfoboxFeedback(feedback);
    setInfoboxImprovement(improvement);
  }
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



function ProgressBarComponent( { progressValue } ) {
  return (
    <div className="flex justify-center row-span-3 rounded">
      <div className="relative w-4/5 bg-gray-200 rounded-full h-2.5 dark:bg-gray-400">
        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progressValue}%`}}></div>
        {timestampRanges.map(([totalLength, first, second, clickPosition, feedback, improvement], index) => (
          <PairOfBoxes 
            key={index}
            firstPosition={first} 
            secondPosition={second} 
            onClick={() => handleClick(
              clickPosition, 
              secondFormat(progressToSeconds(first, totalLength)) + " - " + secondFormat(progressToSeconds(second, totalLength)),
              feedback, 
              improvement
            )}
          />
        ))}
          
      </div>
    </div>
    
  );
}


function VideoComponent( { title } ) {
  return (
    <div className='w-11/12 justify-items-center mx-3 my-10 border border-black rounded'>
        { title } Video
      </div>
  )
}

function TopComponent() {
  useEffect(() => {
    // This effect will run whenever showInfobox changes
  }, [showInfobox]);

  return (
    <div className='grid grid-cols-3 justify-items-center w-full row-span-4 '> 
      <div className='w-11/12 justify-items-center mx-3 my-10 rounded'>
        {showInfobox ? <InfoboxComponent timestamp={infoboxTimestamp} feedback={infoboxFeedback} improvement={infoboxImprovement}/> : null}
      </div>
      <VideoComponent title="Student"/>
      <VideoComponent title="Teacher"/>
    </div>
  );
}

function BottomComponent() {

  return (
    <div className='flex items-center grid grid-row-3 w-full row-span-1 border border-black'>  
      <ProgressBarComponent progressValue="90" /> {/* progressValue determines progress bar percentage; numOfTimestamps determines number of PairOfBoxes */}
    </div>
  );
}

function InfoboxComponent({timestamp, feedback, improvement}) {
  return (
    <div> 
      <div
        className="absolute bg-white border border-black p-2 rounded w-1/4 mt-5"
        style={{ top: '30px', left: 'calc(11.11% + 40px)', transform: 'translateX(-50%)' }}
      >
        <h2 className="underline font-bold">Timestamp:</h2>
        <p className="text-sm">{timestamp}</p>

        <h2 className="underline font-bold">Feedback:</h2>
        <p className="text-sm">{feedback}</p>

        <h2 className="underline font-bold">Improvement:</h2>
        <p className="text-sm">{improvement}</p>
      </div>
    </div>
  );
}

function App() {
  Setup();
  const [data, setData] = useState(null);

  {/* Fetch data from Flask/Backend 
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/data').then(response => response.json())
    .then(data => setData(data))
  }, []);*/}

  return (
    <div className="text-center bg-gray-500 w-screen h-screen rounded">
      {/* <h1>React + Flask Integration</h1>
      {data ? <p>{data.message}</p> : <p>Loading...</p>}*/}
      <div className='bg-gray-200 h-screen w-auto grid grid-rows-5 justify-items-center rounded'>
         <TopComponent />
         <BottomComponent />
      </div>  
    </div>
  );
}

export default App;




// Function to convert current time to progress percentage
function secondsToProgress(currTime, totalTime) {
  return Math.round(currTime/totalTime*100);
}


/**
 * Converts a fraction of a video to seconds.
 * @param {number} fraction - Fraction of video to convert to seconds (0-100).
 * @param {number} totalTime - Total length of video in seconds.
 * @returns {number} The converted time in seconds.
 */
function progressToSeconds(fraction, totalTime) {
  return Math.round(fraction*totalTime/100);
}

/**
 * Converts a time in seconds to MM:SS format.
 * @param {number} seconds - Time in seconds to convert.
 * @returns {string} The converted time in MM:SS format.
 */
function secondFormat(seconds) {
  if (seconds < 60) {
    return `0:${seconds}`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds < 10) {
      return `${minutes}:0${remainingSeconds}`;
    }
    return `${minutes}:${remainingSeconds}`;
  }
}

// Helper function to convert "minutes:seconds" to seconds
function parseTimestamp(timeStr) {
  const [min, sec] = timeStr.split(":").map(Number);
  return min * 60 + sec;
}

function parseFeedback(jsonData) {
  return jsonData.feedback.map((item) => {
    const timeParts = item.timestamp.split("-");
    
    // If there's only a single time (e.g., "0:15"), we add one second to create a range
    const start = parseTimestamp(timeParts[0]);
    const end = timeParts[1] ? parseTimestamp(timeParts[1]) : start + 1;

    return [110, start, end, item.error, item.suggestion];
  });
}


const jsonData = {
  "feedback": [
    {
      "error": "The arm movements are off-beat during the \"Yokikikikikikiki\" section at 0:24-0:29",
      "suggestion": "Try counting the beats and making sure your arm movement lines up with the music.",
      "timestamp": "0:24-0:29"
    },
    {
      "error": "The arm movements are off-beat during the \"Tokitokitoki\" section at 0:57-1:04",
      "suggestion": "Try counting the beats and making sure your arm movement lines up with the music.",
      "timestamp": "0:57-1:04"
    },
    {
      "error": "The arms are not fully extended on the \"Yoi\" at 0:15",
      "suggestion": "Focus on getting your arms fully extended on the \"Yoi\" in order to create a more pronounced motion.",
      "timestamp": "0:15"
    },
    {
      "error": "The movement is off-beat on the \"Tokitokitoki\" section at 1:17-1:24",
      "suggestion": "Focus on moving your arms in time with the music to execute the movements accurately.",
      "timestamp": "1:17-1:24"
    }
  ],
  "ref_video_name": "test_student.mp4",
  "user_video_name": "test_reference.mp4"
};
