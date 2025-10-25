import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import ReviewDisplay from './ReviewDisplay';
import ReviewForm from './ReviewForm';
import { getCourseRecommendations } from '../services/terrierGPTService';
import { useReviews } from '../hooks/useReviews';

/**
 * CourseRecommender - Main interface for course recommendations with reviews
 */
function CourseRecommender() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState({
    major: '',
    semester: '',
    preferences: ''
  });
  
  // Modal states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showReviewDisplay, setShowReviewDisplay] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Reviews data for selected course
  const [reviewsData, setReviewsData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchRecommendations = async () => {
    if (!studentData.major) {
      setError('Please enter your major');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const courses = await getCourseRecommendations(studentData);
      setRecommendations(courses);
      
      // Fetch reviews for all recommended courses
      const reviewsPromises = courses.map(async (course) => {
        try {
          const { getReviewsByCourse } = await import('../services/reviewService');
          const reviewData = await getReviewsByCourse(course.courseCode);
          return { courseCode: course.courseCode, ...reviewData };
        } catch (err) {
          console.error(`Error fetching reviews for ${course.courseCode}:`, err);
          return { courseCode: course.courseCode, reviews: [], averageRating: 0, totalReviews: 0 };
        }
      });
      
      const allReviews = await Promise.all(reviewsPromises);
      const reviewsMap = {};
      allReviews.forEach(data => {
        reviewsMap[data.courseCode] = data;
      });
      setReviewsData(reviewsMap);
      
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReviews = (course) => {
    setSelectedCourse(course);
    setShowReviewDisplay(true);
  };

  const handleLeaveReview = (course) => {
    setSelectedCourse(course);
    setShowReviewForm(true);
  };

  const handleCloseReviewDisplay = () => {
    setShowReviewDisplay(false);
    setSelectedCourse(null);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedCourse(null);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const { submitReview } = await import('../services/reviewService');
      await submitReview(reviewData);
      
      // Refresh reviews for this course
      const { getReviewsByCourse } = await import('../services/reviewService');
      const updatedReviews = await getReviewsByCourse(reviewData.courseCode);
      setReviewsData(prev => ({
        ...prev,
        [reviewData.courseCode]: updatedReviews
      }));
      
      // Show success message
      alert('Review submitted successfully!');
      handleCloseReviewForm();
    } catch (err) {
      console.error('Error submitting review:', err);
      throw err;
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!selectedCourse) return;
    
    try {
      const { upvoteReview } = await import('../services/reviewService');
      await upvoteReview(reviewId);
      
      // Refresh reviews
      const { getReviewsByCourse } = await import('../services/reviewService');
      const updatedReviews = await getReviewsByCourse(selectedCourse.courseCode);
      setReviewsData(prev => ({
        ...prev,
        [selectedCourse.courseCode]: updatedReviews
      }));
    } catch (err) {
      console.error('Error marking review helpful:', err);
    }
  };

  return (
    <div className="course-recommender">
      <div className="recommender-header">
        <h1>Smart Academic Planner</h1>
        <p className="subtitle">Get personalized course recommendations powered by AI</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="major">Major *</label>
          <input
            type="text"
            id="major"
            name="major"
            value={studentData.major}
            onChange={handleInputChange}
            placeholder="e.g., Computer Science"
          />
        </div>

        <div className="input-group">
          <label htmlFor="semester">Semester</label>
          <input
            type="text"
            id="semester"
            name="semester"
            value={studentData.semester}
            onChange={handleInputChange}
            placeholder="e.g., Fall 2025"
          />
        </div>

        <div className="input-group">
          <label htmlFor="preferences">Preferences</label>
          <textarea
            id="preferences"
            name="preferences"
            value={studentData.preferences}
            onChange={handleInputChange}
            placeholder="Any specific interests, schedule preferences, or requirements?"
            rows="3"
          />
        </div>

        <button 
          className="btn btn-primary btn-large"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          {loading ? 'Loading Recommendations...' : 'Get Recommendations'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>Recommended Courses</h2>
          <div className="course-grid">
            {recommendations.map((course) => {
              const courseReviews = reviewsData[course.courseCode] || {
                averageRating: 0,
                totalReviews: 0
              };
              
              return (
                <CourseCard
                  key={course.courseCode}
                  course={course}
                  averageRating={courseReviews.averageRating}
                  totalReviews={courseReviews.totalReviews}
                  onViewReviews={() => handleViewReviews(course)}
                  onLeaveReview={() => handleLeaveReview(course)}
                />
              );
            })}
          </div>
        </div>
      )}

      {showReviewDisplay && selectedCourse && (
        <ReviewDisplay
          courseCode={selectedCourse.courseCode}
          courseName={selectedCourse.courseName}
          reviews={reviewsData[selectedCourse.courseCode]?.reviews || []}
          averageRating={reviewsData[selectedCourse.courseCode]?.averageRating || 0}
          onMarkHelpful={handleMarkHelpful}
          onClose={handleCloseReviewDisplay}
        />
      )}

      {showReviewForm && selectedCourse && (
        <ReviewForm
          courseCode={selectedCourse.courseCode}
          courseName={selectedCourse.courseName}
          onSubmit={handleSubmitReview}
          onCancel={handleCloseReviewForm}
        />
      )}
    </div>
  );
}

export default CourseRecommender;