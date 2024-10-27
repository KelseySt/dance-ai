export default function ClickableSegment({position, distance, onClick}) {
    return (
      <div 
        className='absolute top-0 h-5 cursor-pointer bg-red-400 hover:width-1 hover:height-1  ' style={{ left: `${position}%`, width: `${distance}%` }} 
        onClick={onClick}
      >
      </div>
    );
  }