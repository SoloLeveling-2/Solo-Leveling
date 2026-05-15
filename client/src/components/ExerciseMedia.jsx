import { youtubeEmbedUrl, youtubeSearchUrl, imageSearchUrl } from '../lib/media.js';

export default function ExerciseMedia({ exercise, compact = false }) {
  const embed = youtubeEmbedUrl(exercise.videoUrl);
  const ytQuery = exercise.youtubeQuery || `how to do ${exercise.name} proper form`;
  const imgQuery = exercise.name + ' exercise demonstration';

  return (
    <div className="media-card">
      {embed ? (
        <div className="media-video">
          <iframe
            src={embed}
            title={`${exercise.name} tutorial`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : exercise.imageUrl ? (
        <img className="media-image" src={exercise.imageUrl} alt={`${exercise.name} demonstration`} loading="lazy" />
      ) : (
        <div className="media-placeholder">
          <div className="icon">▶</div>
          <p>
            {compact
              ? 'Tap below to look up a tutorial.'
              : `No video or image set for ${exercise.name}. Find a tutorial and paste the URL in the exercise.`}
          </p>
          <div className="media-actions">
            <a className="media-link" href={youtubeSearchUrl(ytQuery)} target="_blank" rel="noreferrer">
              ▶ Watch on YouTube
            </a>
            <a className="media-link" href={imageSearchUrl(imgQuery)} target="_blank" rel="noreferrer">
              🖼 Find images
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
