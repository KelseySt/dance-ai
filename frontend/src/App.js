import './App.css';
import React, { useEffect, useState, Component} from 'react';
import BlackBar from './components/BlackBar.js';
import ClickableSegment from './components/ClickableSegment.js';
import ReactPlayer from 'react-player';


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
let progressValue;
let setProgressValue;



function handleClick(position, timestamp, feedback, improvement) {
  setShowInfobox(true);
  setInfoboxPosition(position);
  setInfoboxTimestamp(timestamp);
  setInfoboxFeedback(feedback);
  setInfoboxImprovement(improvement);
}

function PairOfBoxes({ firstPosition, secondPosition, onClick }) {
  return (
    <>
      <BlackBar progress={firstPosition} />
      <ClickableSegment
        position={firstPosition}
        distance={secondPosition - firstPosition}
        onClick={onClick}
      />
      <BlackBar progress={secondPosition} />
    </>
  );
}

function ProgressBarComponent({ progressValue }) {
  return (
    <div className="bg-[#392850] flex justify-center row-span-3 rounded shadow-md">
      <div className="relative w-4/5 bg-gray-700 rounded-full h-5 dark:bg-gray-400">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressValue}%` }}
        ></div>
        {timestampRanges.map(
          ([totalLength, first, second, clickPosition, feedback, improvement], index) => (
            <PairOfBoxes
              key={index}
              firstPosition={first}
              secondPosition={second}
              onClick={() =>
                handleClick(
                  clickPosition,
                  secondFormat(
                    Math.round(progressToMs(first, totalLength))
                  ) +
                    " - " +
                    secondFormat(
                      Math.round(progressToMs(second, totalLength))
                    ),
                  feedback,
                  improvement
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}

function VideoComponent({ title , url = "http://localhost:3000/student.mp4"}) {
  return (
    <div 
      className="bg-[#333] justify-items-center mx-3 my-15 border border-gray-600 rounded col-span-2 
             flex flex-col items-center" 
    >
      <div className="w-full h-full" style={{ paddingTop: "56.25%", position: "relative" }}> 
        <ReactPlayer url={url} controls={true} width="100%" height="100%"  style={{ top: "0", position: "absolute", left: "0" }}/>
      </div>
    </div>
  );
}

function TopComponent() {
  useEffect(() => {
    // This effect will run whenever showInfobox changes
  }, [showInfobox]);

  return (
    <div className="grid grid-cols-3 w-full row-span-4 ">
      <div className="flex justify-center items-center col-span-1 w-11/12 mx-3 my-10 rounded">
        {showInfobox ? (
          <InfoboxComponent
            timestamp={infoboxTimestamp}
            feedback={infoboxFeedback}
            improvement={infoboxImprovement}
          />
        ) : null}
      </div>
      <VideoComponent title="Student" />
    </div>
  );
}

function BottomComponent( { progressValue }) {
  return (
    <div className="bg-[#392850] flex items-center grid grid-row-3 w-full row-span-1 border border-gray-600">
      <ProgressBarComponent progressValue={progressValue} />
    </div>
  );
}

function InfoboxComponent({ timestamp, feedback, improvement }) {
  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 p-4 rounded w-1/4 shadow-md  transition-opacity duration-300 ease-in-out"
      style={{ top: '5%', left: '17%', transform: 'translateX(-50%)', opacity: showInfobox ? 1 : 0 }}
    >
      <h2 className="text-lg font-bold text-gray-300 underline">Timestamp:</h2>
      <p className="text-lg text-gray-400">{timestamp}</p>

      <h2 className="text-lg font-bold text-gray-300 underline">Feedback:</h2>
      <p className="text-lg text-gray-400">{feedback}</p>

      <h2 className="text-lg font-bold text-gray-300 underline">
        Summary:
      </h2>
      <p className="text-lg text-gray-400">{improvement}</p>
    </div>
  );
}

function App() {
  Setup();
  const [data, setData] = useState(null);

  return (
    <div className="app-container bg-[#221833] text-center w-screen h-screen rounded">
      <div className="bg-[#221833] app-body h-screen w-auto grid grid-rows-5 justify-items-center rounded">
        <TopComponent />
        <BottomComponent progressValue={progressValue}/>
      </div>
    </div>
  );
}

export default App;

function Setup() {
  numOfTimestamps = jsonData.feedback.length;
  [timestampRanges, setTimestampRanges] = useState(Array(numOfTimestamps).fill([null, null, null, null, null, null]));
  [showInfobox, setShowInfobox] = useState(false); {/* Determines whether infobox appears */}
  [infoboxPosition, setInfoboxPosition] = useState(null);
  [infoboxTimestamp, setInfoboxTimestamp] = useState(null);
  [infoboxFeedback, setInfoboxFeedback] = useState(null);
  [infoboxImprovement, setInfoboxImprovement] = useState(null);
  [progressValue, setProgressValue] = useState(0); 

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

const jsonData = [
  {
    feedback:
      "The student's arms are not fully extended upwards during the 'up' motion. The student's arm movements are also not as crisp and defined as the teacher's. Lastly, there seems to be some hesitation from the student, as the movements of the student don't match the rhythm and beats of the teacher.",
    student_frames: [49, 50, 51, 52],
    summary:
      'Arms not fully extended, movements lack crispness, and timing is slightly off.',
    teacher_frame: 55,
    timestamp: '00:01:833',
    timestamp_student_range: '00:01:633-00:01:666',
  },
  {
    feedback:
      "While the student completes the bringing-down motion with their arms, the transition from up to down and then back up is slightly slower than the teacher's. This makes the movement appear less fluid and dynamic.  The student should focus on maintaining the pace and energy throughout the sequence. Also, make sure to bend your knees slightly when bringing your arms down.",
    student_frames: [53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
    summary:
      'Slightly slower transition and bent knees needed during "down" motion.',
    teacher_frame: 56,
    timestamp: '00:01:866',
    timestamp_student_range: '00:01:766-00:01:933',
  },
];
