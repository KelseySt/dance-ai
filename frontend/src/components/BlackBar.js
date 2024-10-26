export default function BlackBar( { progress }) {
    return (
      <div className={"z-10 absolute top-0 border border-black bg-black w-0.5 h-2.5"}  style={{ left: `${progress}%` }}>
      </div>
    );
  }