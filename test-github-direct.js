/**
 * Test script to directly submit a resume to GitHub
 * This bypasses the API and creates the file directly in the GitHub repository
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');

async function createFileInGitHub(owner, repo, path, content, message, branch) {
  console.log(`Creating file in GitHub: ${path}`);
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  
  try {
    // Try to get the SHA of the file if it exists
    let fileSha;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });
      fileSha = data.sha;
      console.log(`File already exists with SHA: ${fileSha}`);
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      console.log('File does not exist yet, will create it');
    }
    
    // Content needs to be base64 encoded
    const contentEncoded = Buffer.from(content).toString('base64');
    
    // Create or update the file
    const result = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: contentEncoded,
      sha: fileSha,
      branch
    });
    
    console.log(`File created/updated successfully!`);
    console.log(`Commit URL: ${result.data.commit.html_url}`);
    
    return result.data;
  } catch (error) {
    console.error('Error creating file in GitHub:', error);
    throw error;
  }
}

async function triggerGitHubWorkflow(owner, repo, eventType, clientPayload) {
  console.log(`Triggering GitHub workflow with event type: ${eventType}`);
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  
  try {
    await octokit.repos.createDispatchEvent({
      owner,
      repo,
      event_type: eventType,
      client_payload: clientPayload
    });
    
    console.log('GitHub workflow triggered successfully!');
    return true;
  } catch (error) {
    console.error('Error triggering GitHub workflow:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('Starting direct GitHub submission test...');
    
    // GitHub configuration
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    
    console.log(`GitHub repo: ${owner}/${repo}, branch: ${branch}`);
    
    // Read the test resume file
    const resumeFilePath = path.join(__dirname, '_data/resumes/test-resume-1.json');
    const resumeData = JSON.parse(await fs.readFile(resumeFilePath, 'utf8'));
    
    console.log(`Read resume data for: ${resumeData.fullName}`);
    
    // Modify the data slightly to make it unique for this test submission
    const timestamp = Date.now();
    const resumeId = `direct-github-${timestamp.toString(36)}`;
    resumeData.metadata.id = resumeId;
    resumeData.metadata.createdAt = new Date().toISOString();
    
    console.log(`Testing direct GitHub submission with resume ID: ${resumeId}`);
    
    // Create file path in the repository
    const filePath = `_data/resumes/${resumeId}.json`;
    
    // Convert the resume data to a JSON string
    const content = JSON.stringify(resumeData, null, 2);
    
    // Create the file in GitHub
    const result = await createFileInGitHub(
      owner,
      repo,
      filePath,
      content,
      `Add test resume: ${resumeId}`,
      branch
    );
    
    console.log('GitHub file creation result:', result);
    
    // Trigger the GitHub workflow to build the resume
    await triggerGitHubWorkflow(owner, repo, 'resume-created', { resumeId });
    
    // Output the URLs
    console.log('\nResume file is now available in GitHub at:');
    console.log(`https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`);
    
    console.log('\nThe generated HTML page will be available at (after workflow completes):');
    console.log(`https://resume-website-generator.netlify.app/resumes/${resumeId}.html`);
    console.log('(Note: It may take a few minutes for the GitHub Action to build and deploy the site)');
    
  } catch (error) {
    console.error('Error during GitHub submission:', error);
  }
}

main();
