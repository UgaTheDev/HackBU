import React from 'react';

/**
 * CourseCard - Displays individual course recommendation with reviews summary
 * @param {Object} course - Course object with details
 * @param {number} averageRating - Average rating from reviews
 * @param {number} totalReviews - Number of reviews
 * @param {Function} onViewReviews - Callback when "View Reviews" is clicked
 * @param {Function} onLeaveReview - Callback when "Leave Review" is clicked
 */
function CourseCard({ course, averageRating, totalReviews, onViewReviews, onLeaveReview }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="course-card">
      <div className="course-header">
        <h3 className="course-title">{course.courseName}</h3>
        <span className="course-code">{course.courseCode}</span>
      </div>
      
      <div className="course-meta">
        <span className="units">{course.units} units</span>
        {course.instructors && course.instructors.length > 0 && (
          <span className="instructors">
            {course.instructors.join(', ')}
          </span>
        )}
      </div>

      {course.schedule && (
        <div className="course-schedule">
          <strong>Schedule:</strong> {course.schedule}
        </div>
      )}

      <p className="course-description">{course.description}</p>

      {course.hubAreas && course.hubAreas.length > 0 && (
        <div className="hub-tags">
          {course.hubAreas.map((hub, index) => (
            <span key={index} className="hub-tag">{hub}</span>
          ))}
        </div>
      )}

      {course.prerequisites && course.prerequisites.length > 0 && (
        <div className="prerequisites">
          <strong>Prerequisites:</strong> {course.prerequisites.join(', ')}
        </div>
      )}

      <div className="course-rating">
        {totalReviews > 0 ? (
          <>
            <div className="stars">
              {renderStars(averageRating)}
              <span className="rating-value">
                {averageRating.toFixed(1)} / 5.0
              </span>
            </div>
            <span className="review-count">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </>
        ) : (
          <span className="no-reviews">No reviews yet</span>
        )}
      </div>

      <div className="course-actions">
        <button 
          className="btn btn-secondary" 
          onClick={onViewReviews}
          disabled={totalReviews === 0}
        >
          View Reviews
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onLeaveReview}
        >
          Leave a Review
        </button>
      </div>
    </div>
  );
}

export default CourseCard;