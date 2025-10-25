import { useState, useEffect } from 'react';
import { getReviewsByCourse, submitReview, upvoteReview } from '../services/reviewService';

/**
 * Custom hook for managing course reviews
 * @param {string} courseCode - Course code to fetch reviews for
 * @returns {Object} - Reviews data and helper functions
 */
export function useReviews(courseCode) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reviews when courseCode changes
  useEffect(() => {
    if (courseCode) {
      fetchReviews();
    }
  }, [courseCode]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviewsByCourse(courseCode);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      setError(err.message);
      console.error('Error in useReviews hook:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData) => {
    try {
      const reviewId = await submitReview({
        ...reviewData,
        courseCode
      });
      
      // Refresh reviews after submission
      await fetchReviews();
      
      return { success: true, reviewId };
    } catch (err) {
      console.error('Error submitting review:', err);
      return { success: false, error: err.message };
    }
  };

  const markHelpful = async (reviewId) => {
    try {
      await upvoteReview(reviewId);
      
      // Update local state optimistically
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpfulVotes: review.helpfulVotes + 1,
                totalVotes: review.totalVotes + 1
              }
            : review
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error marking review helpful:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    reviews,
    averageRating,
    totalReviews,
    loading,
    error,
    addReview,
    markHelpful,
    refreshReviews: fetchReviews
  };
}

export default useReviews;