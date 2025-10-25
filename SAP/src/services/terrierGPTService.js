/**
 * Service for integrating with TerrierGPT API
 * This handles course recommendations and course data fetching
 */

// TODO: Replace with actual TerrierGPT API endpoint
const TERRIER_GPT_API_BASE = 'https://api.terriergpt.bu.edu'; // Replace with actual URL

/**
 * Get course recommendations from TerrierGPT agent
 * @param {Object} studentData - Student preferences and academic info
 * @returns {Promise<Array>} - Array of recommended courses
 */
export async function getCourseRecommendations(studentData) {
  try {
    // TODO: Replace with actual API call to TerrierGPT
    // For now, using mock data for development
    
    // Example API call structure:
    // const response = await fetch(`${TERRIER_GPT_API_BASE}/recommendations`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(studentData)
    // });
    // const data = await response.json();
    // return data.recommendations;
    
    // Mock data for development
    return getMockRecommendations();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw new Error('Failed to get course recommendations');
  }
}

/**
 * Get detailed information about a specific course
 * @param {string} courseCode - Course code (e.g., "CASCS131")
 * @returns {Promise<Object>} - Course details
 */
export async function getCourseDetails(courseCode) {
  try {
    // TODO: Replace with actual API call to TerrierGPT
    // const response = await fetch(`${TERRIER_GPT_API_BASE}/courses/${courseCode}`);
    // const data = await response.json();
    // return data;
    
    // Mock data for development
    return getMockCourseDetails(courseCode);
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw new Error('Failed to get course details');
  }
}

/**
 * Search courses by query
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} - Array of matching courses
 */
export async function searchCourses(searchQuery) {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${TERRIER_GPT_API_BASE}/courses/search?q=${searchQuery}`);
    // const data = await response.json();
    // return data.courses;
    
    return getMockSearchResults(searchQuery);
  } catch (error) {
    console.error('Error searching courses:', error);
    throw new Error('Failed to search courses');
  }
}

// ===== MOCK DATA FOR DEVELOPMENT =====
// Remove these functions once TerrierGPT API is integrated

function getMockRecommendations() {
  return [
    {
      courseCode: 'CASCS131',
      courseName: 'Combinatoric Structures',
      collegeCode: 'CAS',
      subjectCode: 'CS',
      courseNumber: '131',
      units: 4,
      description: 'Fundamental concepts in discrete mathematics with a focus on combinatorics and graph theory.',
      prerequisites: ['CASCS111'],
      hubAreas: ['Quantitative Reasoning'],
      instructors: ['Prof. Reyzin'],
      schedule: 'MWF 10:10-11:00',
      semester: 'Fall 2025'
    },
    {
      courseCode: 'CASCS132',
      courseName: 'Geometric Algorithms',
      collegeCode: 'CAS',
      subjectCode: 'CS',
      courseNumber: '132',
      units: 4,
      description: 'Introduction to computational geometry and spatial algorithms.',
      prerequisites: ['CASCS131'],
      hubAreas: ['Quantitative Reasoning', 'Critical Thinking'],
      instructors: ['Prof. Smith'],
      schedule: 'TTH 11:00-12:30',
      semester: 'Fall 2025'
    },
    {
      courseCode: 'CASLF309',
      courseName: 'French Literature',
      collegeCode: 'CAS',
      subjectCode: 'LF',
      courseNumber: '309',
      units: 4,
      description: 'Survey of French literature from the 18th century to present.',
      prerequisites: ['CASLF210'],
      hubAreas: ['Aesthetic Exploration', 'Global Citizenship'],
      instructors: ['Prof. Dubois'],
      schedule: 'MW 2:30-4:00',
      semester: 'Fall 2025'
    }
  ];
}

function getMockCourseDetails(courseCode) {
  const mockCourses = {
    'CASCS131': {
      courseCode: 'CASCS131',
      courseName: 'Combinatoric Structures',
      collegeCode: 'CAS',
      subjectCode: 'CS',
      courseNumber: '131',
      units: 4,
      description: 'Fundamental concepts in discrete mathematics with a focus on combinatorics and graph theory. Topics include counting, recurrence relations, generating functions, and graph algorithms.',
      prerequisites: ['CASCS111'],
      corequisites: [],
      hubAreas: ['Quantitative Reasoning'],
      instructors: ['Prof. Reyzin', 'Prof. Johnson'],
      schedule: 'MWF 10:10-11:00',
      semester: 'Fall 2025',
      location: 'STO B50',
      capacity: 80,
      enrolled: 65,
      waitlist: 5
    }
  };
  
  return mockCourses[courseCode] || null;
}

function getMockSearchResults(query) {
  const allCourses = getMockRecommendations();
  return allCourses.filter(course => 
    course.courseName.toLowerCase().includes(query.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(query.toLowerCase())
  );
}

export default {
  getCourseRecommendations,
  getCourseDetails,
  searchCourses
};