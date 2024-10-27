import './App.css';
import React, { useEffect, useState, Component} from 'react';
import BlackBar from './components/BlackBar.js';
import ClickableSegment from './components/ClickableSegment.js';
import ReactPlayer from 'react-player';
import { useLocation } from 'react-router-dom';


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

function App(props) {
  console.log(props.response)
  Setup(props.response);
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

function Setup(data) {
  data = JSON.parse(data)
  numOfTimestamps = data.length;
  [timestampRanges, setTimestampRanges] = useState(
    Array(numOfTimestamps).fill([null, null, null, null, null, null])
  );
  [showInfobox, setShowInfobox] = useState(false);
  [infoboxPosition, setInfoboxPosition] = useState(null);
  [infoboxTimestamp, setInfoboxTimestamp] = useState(null);
  [infoboxFeedback, setInfoboxFeedback] = useState(null);
  [infoboxImprovement, setInfoboxImprovement] = useState(null);
  [progressValue, setProgressValue] = useState(0); 

  timestampArr = parseFeedback(data);
  useEffect(() => {
    const updatedRanges = parseFeedback(data).map(
      ([totalLength, start, end, feedback, improvement]) => {
        const first = msToProgress(start, totalLength);
        const second = msToProgress(end, totalLength);
        const clickPosition = (first + second) / 2;
        return [totalLength, first, second, clickPosition, feedback, improvement];
      }
    );
    setTimestampRanges(updatedRanges);
  }, [numOfTimestamps]);
}

// Function to convert current time to progress percentage
function msToProgress(currTime, totalTime) {
  return (currTime / totalTime) * 100;
}

/**
 * Converts a fraction of a video to milliseconds.
 * @param {number} fraction - Fraction of video to convert to milliseconds (0-100).
 * @param {number} totalTime - Total length of video in milliseconds.
 * @returns {number} The converted time in milliseconds.
 */
function progressToMs(fraction, totalTime) {
  return (fraction * totalTime) / 100;
}

/**
 * Converts a time in seconds to MM:SS format.
 * @param {number} seconds - Time in seconds to convert.
 * @returns {string} The converted time in MM:SS format.
 */
function secondFormat(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = milliseconds % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millis.toString().padStart(3, '0')}`;
}

// Helper function to convert "minutes:seconds" to seconds
function parseTimestamp(timeStr) {
  const [min, sec, millisec] = timeStr.split(':').map(Number);
  return (min * 60 + sec) * 1000 + millisec;
}

function parseFeedback(jsonData) {
  console.log(jsonData)
  console.log(typeof jsonData)
  return jsonData.map(({ feedback, summary, timestamp_student_range }) => {
    const [startStr, endStr] = timestamp_student_range.split('-');
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);
    const totalLength = 5000;
    return [totalLength, start, end, feedback, summary];
  });
}

