export default function ClickableSegment({position, distance, onClick}) {
    return (
      <div 
        className='absolute top-0 h-2.5 cursor-pointer bg-red-400' style={{ left: `${position}%`, width: `${distance}%` }} 
        onClick={onClick}
      >
      </div>
    );
  }