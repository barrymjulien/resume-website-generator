/**
 * Test script to directly submit a resume to the production API
 * This simulates a real form submission to the production API endpoint
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

/**
 * Makes a POST request to the production API
 */
async function makeApiRequest(data) {
  try {
    console.log('Making API request to production endpoint...');
    
    // Try both API endpoints - the Netlify Function URL and the API redirect
    const urls = [
      'https://resume-website-generator.netlify.app/.netlify/functions/submit-resume', 
      'https://resume-website-generator.netlify.app/api/submit-resume'
    ];
    
    let lastError = null;
    
    // Try each URL in sequence
    for (const url of urls) {
      try {
        console.log(`Trying URL: ${url}`);
        
        const response = await axios.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
          },
          // Increase timeout for production API
          timeout: 15000
        });
        
        console.log('Success! Response status:', response.status);
        return response.data;
      } catch (error) {
        console.error(`Failed with URL ${url}:`, error.message);
        lastError = error;
        // Continue to next URL
      }
    }
    
    // If we get here, all URLs failed
    console.error('All API endpoints failed. Last error details:');
    
    if (lastError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', lastError.response.status);
      console.error('Response headers:', lastError.response.headers);
      console.error('Response data:', lastError.response.data);
      
      return {
        success: false,
        status: lastError.response.status,
        data: lastError.response.data
      };
    } else if (lastError.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      return {
        success: false,
        error: 'No response received from server'
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', lastError.message);
      return {
        success: false,
        error: lastError.message
      };
    }
  } catch (generalError) {
    console.error('Unexpected error during API request:', generalError);
    return {
      success: false,
      error: 'Unexpected error during API request'
    };
  }
}

/**
 * Main function to run the test
 */
async function main() {
  try {
    console.log('Starting production submission test...');
    
    // Read the test resume file
    const resumeFilePath = path.join(__dirname, '_data/resumes/test-resume-1.json');
    const resumeData = JSON.parse(await fs.readFile(resumeFilePath, 'utf8'));
    
    console.log(`Read resume data for: ${resumeData.fullName}`);
    
    // Modify the data slightly to make it unique for this test submission
    resumeData.metadata.id = `test-prod-${Date.now().toString(36)}`;
    resumeData.metadata.createdAt = new Date().toISOString();
    
    console.log(`Testing production submission with resume ID: ${resumeData.metadata.id}`);
    
    // Send the data to the production API
    console.log('Sending request to production API...');
    const result = await makeApiRequest(resumeData);
    
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('\nSubmission successful!');
      console.log('\nThe resume should now be visible in GitHub at:');
      console.log(`https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/blob/main/_data/resumes/${resumeData.metadata.id}.json`);
      
      console.log('\nAnd the generated HTML page will be available at:');
      console.log(`https://resume-website-generator.netlify.app/resumes/${resumeData.metadata.id}.html`);
      console.log('(Note: It may take a few minutes for the GitHub Action to build and deploy the site)');
    } else {
      console.log('\nSubmission failed.');
      console.log('Check the API response for details.');
    }
    
  } catch (error) {
    console.error('Error during test submission:', error);
  }
}

// Run the test
main();
