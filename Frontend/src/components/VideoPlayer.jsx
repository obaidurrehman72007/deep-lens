import React from 'react';

const VideoPlayer = ({ youtubeId,onReady, onProgress }) => {
  if (!youtubeId) return <div className="bg-black aspect-video flex items-center justify-center text-white">Invalid Video ID</div>;

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;