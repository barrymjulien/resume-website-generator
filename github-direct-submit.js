/**
 * Direct GitHub submission script for resume data
 * This script bypasses the Netlify Functions and directly submits to GitHub
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');

// Configuration from .env file
const config = {
  github: {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    dataPath: '_data/resumes',
    token: process.env.GITHUB_TOKEN
  }
};

/**
 * Store the resume data directly in GitHub
 * @param {Object} data - Resume data
 * @returns {Object} - Result of the GitHub operation
 */
async function storeResumeInGitHub(data) {
  console.log('Storing resume data directly to GitHub:', data.metadata.id);
  
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
      message: `Add resume: ${data.metadata.id} (direct submission)`,
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
    
    // Trigger the build process via repository dispatch
    await octokit.repos.createDispatchEvent({
      owner: config.github.owner,
      repo: config.github.repo,
      event_type: 'resume-created',
      client_payload: {
        resumeId: data.metadata.id
      }
    });
    
    return {
      success: true,
      message: 'Resume data stored successfully and build triggered',
      resumeId: data.metadata.id,
      commitSha: commitData.sha
    };
  } catch (error) {
    console.error('Error storing resume in GitHub:', error);
    return {
      success: false,
      error: `Failed to store resume: ${error.message}`
    };
  }
}

/**
 * Generate a unique ID for the resume
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Main function to run the test
 */
async function main() {
  try {
    console.log('Starting direct GitHub submission test...');
    
    // Read the test resume file
    const resumeFilePath = path.join(__dirname, '_data/resumes/test-resume-1.json');
    const resumeData = JSON.parse(await fs.readFile(resumeFilePath, 'utf8'));
    
    console.log(`Read resume data for: ${resumeData.fullName}`);
    
    // Modify the data slightly to make it unique for this test submission
    resumeData.metadata.id = `direct-${Date.now().toString(36)}`;
    resumeData.metadata.createdAt = new Date().toISOString();
    
    console.log(`Testing direct GitHub submission with resume ID: ${resumeData.metadata.id}`);
    
    // Send the data directly to GitHub
    console.log('Submitting directly to GitHub...');
    const result = await storeResumeInGitHub(resumeData);
    
    console.log('GitHub submission result:', result);
    
    if (result.success) {
      console.log('\nDirect submission successful!');
      console.log('\nThe resume should now be visible in GitHub at:');
      console.log(`https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/blob/main/_data/resumes/${resumeData.metadata.id}.json`);
      
      console.log('\nAnd the generated HTML page will be available once the GitHub Action completes:');
      console.log(`${process.env.NETLIFY_SITE_URL}/resumes/${resumeData.metadata.id}.html`);
      console.log('(Note: It may take a few minutes for the GitHub Action to build and deploy the site)');
    } else {
      console.log('\nSubmission failed.');
      console.log('Check the error details for more information.');
    }
    
  } catch (error) {
    console.error('Error during direct GitHub submission:', error);
  }
}

// Run the script
main();
