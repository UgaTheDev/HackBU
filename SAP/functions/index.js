const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * CORS configuration for all functions
 */
const cors = require("cors")({ origin: true });

/**
 * GET /api/reviews?courseCode=CASCS131
 * Fetch all reviews for a specific course
 */
exports.getReviews = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({ error: "courseCode is required" });
    }

    try {
      const reviewsRef = db.collection("reviews");
      const snapshot = await reviewsRef
        .where("courseCode", "==", courseCode)
        .orderBy("helpfulVotes", "desc")
        .get();

      if (snapshot.empty) {
        return res.json({
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
        });
      }

      const reviews = [];
      let totalRating = 0;

      snapshot.forEach((doc) => {
        const reviewData = {
          id: doc.id,
          ...doc.data(),
        };
        reviews.push(reviewData);
        totalRating += reviewData.rating;
      });

      const averageRating = totalRating / reviews.length;

      return res.json({
        reviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({
        error: "Failed to fetch reviews",
        details: error.message,
      });
    }
  });
});

/**
 * POST /api/reviews
 * Submit a new review
 *
 * Request body:
 * {
 *   courseCode: string (required)
 *   courseName: string
 *   rating: number (1-5, required)
 *   reviewText: string (required, min 20 chars)
 *   difficultyRating: number (1-5, optional)
 *   workloadRating: number (1-5, optional)
 *   profHelpfulnessRating: number (1-5, optional)
 *   semesterTaken: string
 *   authorName: string
 *   authorEmail: string
 *   isAnonymous: boolean
 * }
 */
exports.submitReview = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const reviewData = req.body;

    // Validate required fields
    if (!reviewData.courseCode) {
      return res.status(400).json({ error: "courseCode is required" });
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    if (!reviewData.reviewText || reviewData.reviewText.trim().length < 20) {
      return res.status(400).json({
        error: "reviewText is required and must be at least 20 characters",
      });
    }

    try {
      const reviewToSubmit = {
        // Course info
        courseCode: reviewData.courseCode,
        courseName: reviewData.courseName || "",
        collegeCode: reviewData.collegeCode || "",
        subjectCode: reviewData.subjectCode || "",
        courseNumber: reviewData.courseNumber || "",

        // Review content
        rating: parseInt(reviewData.rating),
        reviewText: reviewData.reviewText.trim(),

        // Optional ratings
        difficultyRating: reviewData.difficultyRating
          ? parseInt(reviewData.difficultyRating)
          : null,
        workloadRating: reviewData.workloadRating
          ? parseInt(reviewData.workloadRating)
          : null,
        profHelpfulnessRating: reviewData.profHelpfulnessRating
          ? parseInt(reviewData.profHelpfulnessRating)
          : null,

        // Semester info
        semesterTaken: reviewData.semesterTaken || "",

        // Author info
        authorEmail:
          reviewData.isAnonymous || !reviewData.authorEmail
            ? null
            : reviewData.authorEmail,
        isAnonymous: reviewData.isAnonymous !== false,
        authorName: reviewData.isAnonymous
          ? "Anonymous"
          : reviewData.authorName || "Anonymous",

        // Metadata
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        verified: false,
        helpfulVotes: 0,
        totalVotes: 0,
        reportedCount: 0,
      };

      const docRef = await db.collection("reviews").add(reviewToSubmit);

      return res.status(201).json({
        success: true,
        reviewId: docRef.id,
        message: "Review submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      return res.status(500).json({
        error: "Failed to submit review",
        details: error.message,
      });
    }
  });
});

/**
 * PUT /api/reviews/:id/helpful
 * Upvote a review as helpful
 */
exports.upvoteReview = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow PUT requests
    if (req.method !== "PUT") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Extract review ID from path
    const pathParts = req.path.split("/");
    const reviewId = pathParts[pathParts.length - 2]; // Get ID before 'helpful'

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    try {
      const reviewRef = db.collection("reviews").doc(reviewId);
      const doc = await reviewRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Review not found" });
      }

      await reviewRef.update({
        helpfulVotes: admin.firestore.FieldValue.increment(1),
        totalVotes: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const updatedDoc = await reviewRef.get();
      const updatedData = updatedDoc.data();

      return res.json({
        success: true,
        helpfulVotes: updatedData.helpfulVotes,
        totalVotes: updatedData.totalVotes,
      });
    } catch (error) {
      console.error("Error upvoting review:", error);
      return res.status(500).json({
        error: "Failed to upvote review",
        details: error.message,
      });
    }
  });
});

/**
 * PUT /api/reviews/:id/report
 * Report a review as inappropriate
 */
exports.reportReview = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow PUT requests
    if (req.method !== "PUT") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Extract review ID from path
    const pathParts = req.path.split("/");
    const reviewId = pathParts[pathParts.length - 2];

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    try {
      const reviewRef = db.collection("reviews").doc(reviewId);
      const doc = await reviewRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Review not found" });
      }

      await reviewRef.update({
        reportedCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        success: true,
        message: "Review reported successfully",
      });
    } catch (error) {
      console.error("Error reporting review:", error);
      return res.status(500).json({
        error: "Failed to report review",
        details: error.message,
      });
    }
  });
});

/**
 * GET /api/courses/:courseCode/stats
 * Get statistics for a course (average ratings breakdown)
 */
exports.getCourseStats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const pathParts = req.path.split("/");
    const courseCode = pathParts[pathParts.length - 2];

    if (!courseCode) {
      return res.status(400).json({ error: "courseCode is required" });
    }

    try {
      const reviewsRef = db.collection("reviews");
      const snapshot = await reviewsRef
        .where("courseCode", "==", courseCode)
        .get();

      if (snapshot.empty) {
        return res.json({
          courseCode,
          totalReviews: 0,
          averageRating: 0,
          averageDifficulty: 0,
          averageWorkload: 0,
          averageProfHelpfulness: 0,
        });
      }

      let totalRating = 0;
      let totalDifficulty = 0;
      let totalWorkload = 0;
      let totalProfHelpfulness = 0;
      let difficultyCount = 0;
      let workloadCount = 0;
      let profHelpfulnessCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalRating += data.rating;

        if (data.difficultyRating) {
          totalDifficulty += data.difficultyRating;
          difficultyCount++;
        }
        if (data.workloadRating) {
          totalWorkload += data.workloadRating;
          workloadCount++;
        }
        if (data.profHelpfulnessRating) {
          totalProfHelpfulness += data.profHelpfulnessRating;
          profHelpfulnessCount++;
        }
      });

      const totalReviews = snapshot.size;

      return res.json({
        courseCode,
        totalReviews,
        averageRating: parseFloat((totalRating / totalReviews).toFixed(1)),
        averageDifficulty: difficultyCount
          ? parseFloat((totalDifficulty / difficultyCount).toFixed(1))
          : 0,
        averageWorkload: workloadCount
          ? parseFloat((totalWorkload / workloadCount).toFixed(1))
          : 0,
        averageProfHelpfulness: profHelpfulnessCount
          ? parseFloat((totalProfHelpfulness / profHelpfulnessCount).toFixed(1))
          : 0,
      });
    } catch (error) {
      console.error("Error fetching course stats:", error);
      return res.status(500).json({
        error: "Failed to fetch course stats",
        details: error.message,
      });
    }
  });
});
