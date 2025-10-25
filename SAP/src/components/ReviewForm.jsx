import React, { useState } from 'react';

/**
 * ReviewForm - Form for students to submit course reviews
 * @param {string} courseCode - Course code
 * @param {string} courseName - Course name
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onCancel - Callback to cancel/close form
 */
function ReviewForm({ courseCode, courseName, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rating: 0,
    reviewText: '',
    difficultyRating: 0,
    workloadRating: 0,
    profHelpfulnessRating: 0,
    semesterTaken: '',
    authorName: '',
    authorEmail: '',
    isAnonymous: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRatingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!formData.reviewText.trim()) {
      newErrors.reviewText = 'Review text is required';
    } else if (formData.reviewText.trim().length < 20) {
      newErrors.reviewText = 'Review must be at least 20 characters';
    }
    
    if (!formData.isAnonymous && !formData.authorName.trim()) {
      newErrors.authorName = 'Please enter your name or select anonymous';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        courseCode,
        courseName
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingSelector = ({ label, value, onChange, name }) => (
    <div className="rating-selector">
      <label>{label}</label>
      <div className="stars-input">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star-button ${star <= value ? 'filled' : ''}`}
            onClick={() => onChange(name, star)}
          >
            {star <= value ? '★' : '☆'}
          </button>
        ))}
        {value > 0 && <span className="rating-label">{value}/5</span>}
      </div>
    </div>
  );

  return (
    <div className="review-form-overlay">
      <div className="review-form">
        <div className="form-header">
          <h2>Leave a Review</h2>
          <p className="form-subtitle">{courseName} ({courseCode})</p>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <RatingSelector
              label="Overall Rating *"
              value={formData.rating}
              onChange={handleRatingChange}
              name="rating"
            />
            {errors.rating && <span className="error">{errors.rating}</span>}
          </div>

          <div className="form-section">
            <label htmlFor="reviewText">Your Review *</label>
            <textarea
              id="reviewText"
              name="reviewText"
              value={formData.reviewText}
              onChange={handleInputChange}
              placeholder="Share your experience with this course... (minimum 20 characters)"
              rows="5"
              className={errors.reviewText ? 'error' : ''}
            />
            {errors.reviewText && <span className="error">{errors.reviewText}</span>}
          </div>

          <div className="form-section optional-ratings">
            <h3>Additional Ratings (Optional)</h3>
            
            <RatingSelector
              label="Difficulty"
              value={formData.difficultyRating}
              onChange={handleRatingChange}
              name="difficultyRating"
            />
            
            <RatingSelector
              label="Workload"
              value={formData.workloadRating}
              onChange={handleRatingChange}
              name="workloadRating"
            />
            
            <RatingSelector
              label="Professor Helpfulness"
              value={formData.profHelpfulnessRating}
              onChange={handleRatingChange}
              name="profHelpfulnessRating"
            />
          </div>

          <div className="form-section">
            <label htmlFor="semesterTaken">Semester Taken</label>
            <input
              type="text"
              id="semesterTaken"
              name="semesterTaken"
              value={formData.semesterTaken}
              onChange={handleInputChange}
              placeholder="e.g., Fall 2025"
            />
          </div>

          <div className="form-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
              />
              <label htmlFor="isAnonymous">Post anonymously</label>
            </div>
          </div>

          {!formData.isAnonymous && (
            <div className="form-section">
              <label htmlFor="authorName">Your Name *</label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                value={formData.authorName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={errors.authorName ? 'error' : ''}
              />
              {errors.authorName && <span className="error">{errors.authorName}</span>}
              
              <label htmlFor="authorEmail">Email (Optional)</label>
              <input
                type="email"
                id="authorEmail"
                name="authorEmail"
                value={formData.authorEmail}
                onChange={handleInputChange}
                placeholder="your.email@bu.edu"
              />
              <small>Your email will only be visible if you choose to share it</small>
            </div>
          )}

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewForm;