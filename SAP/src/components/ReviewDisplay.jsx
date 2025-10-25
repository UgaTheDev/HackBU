import React from 'react';

/**
 * ReviewDisplay - Shows all reviews for a course
 * @param {string} courseCode - Course code
 * @param {string} courseName - Course name
 * @param {Array} reviews - Array of review objects
 * @param {number} averageRating - Average rating
 * @param {Function} onMarkHelpful - Callback when "Helpful" is clicked
 * @param {Function} onClose - Callback to close the display
 */
function ReviewDisplay({ 
  courseCode, 
  courseName, 
  reviews, 
  averageRating, 
  onMarkHelpful,
  onClose 
}) {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? "star filled" : "star empty"}>
          {i < rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="review-display-overlay">
      <div className="review-display">
        <div className="review-display-header">
          <div>
            <h2>{courseName}</h2>
            <p className="course-code-subtitle">{courseCode}</p>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="review-summary">
          <div className="average-rating">
            <div className="rating-number">{averageRating.toFixed(1)}</div>
            <div className="stars-large">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="review-count">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews-message">
              <p>No reviews yet for this course.</p>
              <p>Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    {review.isAnonymous ? (
                      <span className="anonymous-badge">Anonymous</span>
                    ) : (
                      <span className="author-name">{review.authorName}</span>
                    )}
                  </div>
                  <div className="review-date">
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                <div className="review-rating">
                  {renderStars(review.rating)}
                  <span className="rating-value">{review.rating}/5</span>
                  {review.semesterTaken && (
                    <span className="semester-taken">
                      Taken: {review.semesterTaken}
                    </span>
                  )}
                </div>

                <div className="review-text">
                  {review.reviewText}
                </div>

                {(review.difficultyRating || review.workloadRating || review.profHelpfulnessRating) && (
                  <div className="review-breakdown">
                    {review.difficultyRating && (
                      <div className="breakdown-item">
                        <span className="breakdown-label">Difficulty:</span>
                        <span className="breakdown-value">
                          {review.difficultyRating}/5
                        </span>
                      </div>
                    )}
                    {review.workloadRating && (
                      <div className="breakdown-item">
                        <span className="breakdown-label">Workload:</span>
                        <span className="breakdown-value">
                          {review.workloadRating}/5
                        </span>
                      </div>
                    )}
                    {review.profHelpfulnessRating && (
                      <div className="breakdown-item">
                        <span className="breakdown-label">Prof Helpfulness:</span>
                        <span className="breakdown-value">
                          {review.profHelpfulnessRating}/5
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="review-actions">
                  <button 
                    className="helpful-button"
                    onClick={() => onMarkHelpful(review.id)}
                  >
                    👍 Helpful ({review.helpfulVotes})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewDisplay;