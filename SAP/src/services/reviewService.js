import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const REVIEWS_COLLECTION = 'reviews';

/**
 * Fetch all reviews for a specific course
 * @param {string} courseCode - Course code (e.g., "CASCS131")
 * @returns {Promise<Object>} - Reviews array, average rating, and count
 */
export async function getReviewsByCourse(courseCode) {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef, 
      where('courseCode', '==', courseCode),
      orderBy('helpfulVotes', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    let totalRating = 0;
    
    querySnapshot.forEach((doc) => {
      const reviewData = { id: doc.id, ...doc.data() };
      reviews.push(reviewData);
      totalRating += reviewData.rating;
    });
    
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    return {
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw new Error('Failed to fetch reviews');
  }
}

/**
 * Submit a new review
 * @param {Object} reviewData - Review data object
 * @returns {Promise<string>} - New review ID
 */
export async function submitReview(reviewData) {
  try {
    // Validate required fields
    if (!reviewData.courseCode || !reviewData.rating || !reviewData.reviewText) {
      throw new Error('Missing required fields: courseCode, rating, or reviewText');
    }
    
    // Validate rating range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    // Validate review text length
    if (reviewData.reviewText.length < 20) {
      throw new Error('Review text must be at least 20 characters');
    }
    
    const reviewToSubmit = {
      // Course info
      courseCode: reviewData.courseCode,
      courseName: reviewData.courseName || '',
      collegeCode: reviewData.collegeCode || '',
      subjectCode: reviewData.subjectCode || '',
      courseNumber: reviewData.courseNumber || '',
      
      // Review content
      rating: reviewData.rating,
      reviewText: reviewData.reviewText,
      
      // Optional ratings
      difficultyRating: reviewData.difficultyRating || null,
      workloadRating: reviewData.workloadRating || null,
      profHelpfulnessRating: reviewData.profHelpfulnessRating || null,
      
      // Semester info
      semesterTaken: reviewData.semesterTaken || '',
      
      // Author info
      authorEmail: reviewData.isAnonymous ? null : reviewData.authorEmail,
      isAnonymous: reviewData.isAnonymous || true,
      authorName: reviewData.isAnonymous ? 'Anonymous' : reviewData.authorName,
      
      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      verified: false,
      helpfulVotes: 0,
      totalVotes: 0,
      reportedCount: 0
    };
    
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewToSubmit);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

/**
 * Upvote a review as helpful
 * @param {string} reviewId - Review document ID
 * @returns {Promise<Object>} - Updated vote counts
 */
export async function upvoteReview(reviewId) {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    await updateDoc(reviewRef, {
      helpfulVotes: increment(1),
      totalVotes: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error upvoting review:', error);
    throw new Error('Failed to upvote review');
  }
}

/**
 * Report a review as inappropriate
 * @param {string} reviewId - Review document ID
 * @returns {Promise<Object>} - Success status
 */
export async function reportReview(reviewId) {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    await updateDoc(reviewRef, {
      reportedCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error reporting review:', error);
    throw new Error('Failed to report review');
  }
}