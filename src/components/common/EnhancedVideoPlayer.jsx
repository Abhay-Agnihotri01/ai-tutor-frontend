// Enhanced Video Player has been upgraded to AdvancedVideoPlayer
// This file now imports the new advanced version with speed controls
import AdvancedVideoPlayer from './AdvancedVideoPlayer';

const EnhancedVideoPlayer = ({ src, poster, onTimeUpdate, onEnded, videoId, courseId, className = '' }) => {
  return (
    <AdvancedVideoPlayer
      src={src}
      poster={poster}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      className={className}
    />
  );
};

export default EnhancedVideoPlayer;