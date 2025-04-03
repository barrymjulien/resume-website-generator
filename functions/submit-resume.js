/**
 * Resume Website Generator - Serverless Function
 * 
 * This function processes form submissions from the resume generator form,
 * stores the data in a GitHub repository, and triggers a build process.
 */

require('dotenv').config();
const { Octokit } = require('@octokit/rest');

// Configuration
const config = {
  // GitHub repository details
  github: {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    dataPath: '_data/resumes',
    token: process.env.GITHUB_TOKEN
  }
};

/**
 * Main handler function for the serverless function
 * @param {Object} event - The event object from the serverless provider
 * @returns {Object} - Response object
 */
exports.handler = async (event, context) => {
  // Set CORS headers for browser clients
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Parse the request body
    const resumeData = JSON.parse(event.body);
    
    // Validate the resume data
    const validationResult = validateResumeData(resumeData);
    if (!validationResult.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validationResult.error })
      };
    }
    
    // Sanitize the resume data
    const sanitizedData = sanitizeResumeData(resumeData);
    
    // Store the resume data in GitHub
    const storeResult = await storeResumeInGitHub(sanitizedData);
    
    // Trigger the build process
    await triggerBuild(sanitizedData.metadata.id);
    
    // Return success response with production URLs (without brackets to avoid URL encoding issues)
    const resumeId = sanitizedData.metadata.id;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        resumeId: resumeId,
        resumeUrl: `/resumes/${resumeId}.html`,
        editUrl: `/edit/${resumeId}.html?token=${generateEditToken(resumeId)}`
      })
    };
  } catch (error) {
    console.error('Error processing resume submission:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

/**
 * Validate the resume data
 * @param {Object} data - Resume data
 * @returns {Object} - Validation result
 */
function validateResumeData(data) {
  // Required fields
  const requiredFields = ['fullName', 'email', 'summary', 'skills'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        valid: false,
        error: `Missing required field: ${field}`
      };
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }
  
  // Validate that there's at least one education entry
  if (!data.education || !Array.isArray(data.education) || data.education.length === 0) {
    return {
      valid: false,
      error: 'At least one education entry is required'
    };
  }
  
  // Validate that there's at least one experience entry
  if (!data.experience || !Array.isArray(data.experience) || data.experience.length === 0) {
    return {
      valid: false,
      error: 'At least one experience entry is required'
    };
  }
  
  // Validate that there's at least one skill
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    return {
      valid: false,
      error: 'At least one skill is required'
    };
  }
  
  return { valid: true };
}

/**
 * Sanitize the resume data
 * @param {Object} data - Resume data
 * @returns {Object} - Sanitized data
 */
function sanitizeResumeData(data) {
  // Create a deep copy of the data
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Ensure metadata exists
  if (!sanitized.metadata) {
    sanitized.metadata = {
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      id: generateUniqueId()
    };
  }
  
  // Sanitize text fields to prevent XSS
  const sanitizeText = (text) => {
    if (!text) return text;
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  // Sanitize personal information
  sanitized.fullName = sanitizeText(sanitized.fullName);
  sanitized.email = sanitizeText(sanitized.email);
  sanitized.phone = sanitizeText(sanitized.phone);
  sanitized.location = sanitizeText(sanitized.location);
  sanitized.summary = sanitizeText(sanitized.summary);
  
  // Sanitize URLs
  const sanitizeUrl = (url) => {
    if (!url) return url;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      return url;
    } catch (e) {
      return null;
    }
  };
  
  sanitized.website = sanitizeUrl(sanitized.website);
  sanitized.linkedin = sanitizeUrl(sanitized.linkedin);
  sanitized.github = sanitizeUrl(sanitized.github);
  
  // Sanitize education entries
  if (Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map(edu => ({
      institution: sanitizeText(edu.institution),
      degree: sanitizeText(edu.degree),
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: sanitizeText(edu.description)
    }));
  }
  
  // Sanitize experience entries
  if (Array.isArray(sanitized.experience)) {
    sanitized.experience = sanitized.experience.map(exp => ({
      company: sanitizeText(exp.company),
      position: sanitizeText(exp.position),
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: !!exp.current,
      description: sanitizeText(exp.description)
    }));
  }
  
  // Sanitize project entries
  if (Array.isArray(sanitized.projects)) {
    sanitized.projects = sanitized.projects.map(proj => ({
      title: sanitizeText(proj.title),
      url: sanitizeUrl(proj.url),
      description: sanitizeText(proj.description),
      technologies: Array.isArray(proj.technologies) 
        ? proj.technologies.map(tech => sanitizeText(tech))
        : []
    }));
  }
  
  // Sanitize skills
  if (Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map(skill => sanitizeText(skill));
  }
  
  // Validate template choice
  sanitized.template = ['default', 'modern'].includes(sanitized.template) 
    ? sanitized.template 
    : 'default';
  
  return sanitized;
}

/**
 * Generate a unique ID for the resume
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Generate an edit token for the resume
 * @param {string} resumeId - Resume ID
 * @returns {string} - Edit token
 */
function generateEditToken(resumeId) {
  // In a real implementation, this would use a secure method to generate a token
  // that can be verified later, such as JWT or a signed hash
  return Buffer.from(`${resumeId}-${Date.now()}`).toString('base64');
}

/**
 * Store the resume data in GitHub
 * @param {Object} data - Resume data
 * @returns {Object} - Result of the GitHub operation
 */
async function storeResumeInGitHub(data) {
  console.log('Storing resume data:', data.metadata.id);
  
  try {
    const octokit = new Octokit({
      auth: config.github.token
    });
    
    // Get the current commit SHA
    const { data: refData } = await octokit.git.getRef({
      owner: config.github.owner,
      repo: config.github.repo,
      ref: `heads/${config.github.branch}`
    });
    
    const commitSha = refData.object.sha;
    
    // Create a new blob with the resume data
    const { data: blobData } = await octokit.git.createBlob({
      owner: config.github.owner,
      repo: config.github.repo,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      encoding: 'base64'
    });
    
    // Get the current tree
    const { data: treeData } = await octokit.git.getTree({
      owner: config.github.owner,
      repo: config.github.repo,
      tree_sha: commitSha
    });
    
    // Create a new tree with the new file
    const { data: newTree } = await octokit.git.createTree({
      owner: config.github.owner,
      repo: config.github.repo,
      base_tree: treeData.sha,
      tree: [
        {
          path: `${config.github.dataPath}/${data.metadata.id}.json`,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
    });
    
    // Create a new commit
    const { data: commitData } = await octokit.git.createCommit({
      owner: config.github.owner,
      repo: config.github.repo,
      message: `Add resume: ${data.metadata.id}`,
      tree: newTree.sha,
      parents: [commitSha]
    });
    
    // Update the reference
    await octokit.git.updateRef({
      owner: config.github.owner,
      repo: config.github.repo,
      ref: `heads/${config.github.branch}`,
      sha: commitData.sha
    });
    
    return {
      success: true,
      message: 'Resume data stored successfully',
      commitSha: commitData.sha
    };
  } catch (error) {
    console.error('Error storing resume in GitHub:', error);
    throw new Error(`Failed to store resume: ${error.message}`);
  }
}

/**
 * Trigger the build process
 * @param {string} resumeId - Resume ID
 * @returns {Object} - Result of the trigger operation
 */
async function triggerBuild(resumeId) {
  console.log('Triggering build for resume:', resumeId);
  
  try {
    const octokit = new Octokit({
      auth: config.github.token
    });
    
    // Create a repository dispatch event to trigger the GitHub Actions workflow
    const { data } = await octokit.repos.createDispatchEvent({
      owner: config.github.owner,
      repo: config.github.repo,
      event_type: 'resume-created',
      client_payload: {
        resumeId: resumeId
      }
    });
    
    return {
      success: true,
      message: 'Build triggered successfully'
    };
  } catch (error) {
    console.error('Error triggering build:', error);
    // We'll continue even if the build trigger fails
    return {
      success: false,
      message: `Failed to trigger build: ${error.message}`
    };
  }
}
