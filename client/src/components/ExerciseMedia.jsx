import { useMemo, useState } from 'react';
import { youtubeEmbedUrl, youtubeSearchUrl, imageSearchUrl, safeImageUrl } from '../lib/media.js';

const FALLBACK_EXPLANATIONS = {
  strength: 'Move slowly, keep a braced core, and stop a rep before your form breaks down.',
  cardio: 'Start at a conversational pace. Walk/run intervals are useful while your endurance builds.'
};

function getBeginnerExplanation(exercise) {
  if (exercise.beginnerExplanation) return exercise.beginnerExplanation;
  const category = exercise.category || (/run|cardio/i.test(`${exercise.name} ${exercise.muscleGroup}`) ? 'cardio' : 'strength');
  return FALLBACK_EXPLANATIONS[category] || FALLBACK_EXPLANATIONS.strength;
}

export default function ExerciseMedia({ exercise, compact = false, showGuidance = true }) {
  const [imageFailed, setImageFailed] = useState(false);
  const embed = youtubeEmbedUrl(exercise.videoUrl);
  const imageUrl = safeImageUrl(exercise.imageUrl);
  const ytQuery = exercise.youtubeQuery || `how to do ${exercise.name} proper form beginner`;
  const imgQuery = `${exercise.name} exercise demonstration proper form`;
  const hasImage = imageUrl && !imageFailed;
  const beginnerExplanation = getBeginnerExplanation(exercise);
  const tips = Array.isArray(exercise.tips) ? exercise.tips.slice(0, compact ? 2 : 3) : [];

  const placeholderInitials = useMemo(() => {
    return (exercise.name || 'EX')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'EX';
  }, [exercise.name]);

  return (
    <div className="media-card">
      {embed ? (
        <div className="media-video">
          <iframe
            src={embed}
            title={`${exercise.name} tutorial`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : hasImage ? (
        <a href={imageUrl} target="_blank" rel="noreferrer" className="media-image-link" aria-label={`Open ${exercise.name} image preview`}>
          <img
            className="media-image"
            src={imageUrl}
            alt={`${exercise.name} demonstration`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        </a>
      ) : (
        <div className="media-placeholder" role="note" aria-label={`${exercise.name} media placeholder`}>
          <div className="placeholder-badge">{placeholderInitials}</div>
          <p>
            {compact
              ? 'No saved demo yet. Use a beginner tutorial before starting.'
              : `No saved YouTube embed or image preview for ${exercise.name}. Add a safe URL or open a search below.`}
          </p>
          <div className="media-actions">
            <a className="media-link" href={exercise.videoUrl || youtubeSearchUrl(ytQuery)} target="_blank" rel="noreferrer">
              ▶ Watch on YouTube
            </a>
            <a className="media-link" href={imageSearchUrl(imgQuery)} target="_blank" rel="noreferrer">
              🖼 Find form images
            </a>
          </div>
        </div>
      )}

      {showGuidance && (
        <div className="media-guidance">
          <p className="media-guidance-title">Beginner explanation</p>
          <p>{beginnerExplanation}</p>
          {tips.length > 0 && (
            <ul>
              {tips.map((tip, index) => <li key={index}>{tip}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
