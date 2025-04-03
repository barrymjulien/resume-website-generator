/**
 * Test script to submit a resume to GitHub
 * This is a standalone version of the function in submit-resume.js
 */

require('dotenv').config();
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

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
    console.log(`Current commit SHA: ${commitSha}`);
    
    // Create a new blob with the resume data
    const { data: blobData } = await octokit.git.createBlob({
      owner: config.github.owner,
      repo: config.github.repo,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      encoding: 'base64'
    });
    
    console.log(`Created blob: ${blobData.sha}`);
    
    // Get the current tree
    const { data: treeData } = await octokit.git.getTree({
      owner: config.github.owner,
      repo: config.github.repo,
      tree_sha: commitSha
    });
    
    console.log(`Current tree SHA: ${treeData.sha}`);
    
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
    
    console.log(`New tree created: ${newTree.sha}`);
    
    // Create a new commit
    const { data: commitData } = await octokit.git.createCommit({
      owner: config.github.owner,
      repo: config.github.repo,
      message: `Add test resume: ${data.metadata.id}`,
      tree: newTree.sha,
      parents: [commitSha]
    });
    
    console.log(`New commit created: ${commitData.sha}`);
    
    // Update the reference
    await octokit.git.updateRef({
      owner: config.github.owner,
      repo: config.github.repo,
      ref: `heads/${config.github.branch}`,
      sha: commitData.sha
    });
    
    console.log(`Branch reference updated to new commit`);
    
    // Trigger build workflow
    await triggerBuild(data.metadata.id);
    
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
    
    console.log('Build triggered successfully');
    
    return {
      success: true,
      message: 'Build triggered successfully'
    };
  } catch (error) {
    console.error('Error triggering build:', error);
    return {
      success: false,
      message: `Failed to trigger build: ${error.message}`
    };
  }
}

// Main function to run the test
async function main() {
  try {
    console.log('Starting test submission...');
    
    // Read the test resume file
    const resumeFilePath = path.join(__dirname, '_data/resumes/test-resume-1.json');
    const resumeData = JSON.parse(await fs.readFile(resumeFilePath, 'utf8'));
    
    console.log(`Read resume data for: ${resumeData.fullName}`);
    
    // Store the resume in GitHub
    const result = await storeResumeInGitHub(resumeData);
    
    console.log('Test submission completed successfully!');
    console.log('Result:', result);
    
    console.log('\nResume should now be visible in GitHub at:');
    console.log(`https://github.com/${config.github.owner}/${config.github.repo}/blob/${config.github.branch}/${config.github.dataPath}/${resumeData.metadata.id}.json`);
    
    console.log('\nAnd the generated HTML page (after the workflow completes) will be at:');
    console.log(`https://resume-website-generator.netlify.app/resumes/${resumeData.metadata.id}.html`);
    
  } catch (error) {
    console.error('Error during test submission:', error);
    process.exit(1);
  }
}

// Run the test
main();
