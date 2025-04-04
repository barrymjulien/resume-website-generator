/**
 * Direct GitHub submission helper for the resume form
 * This script provides functions to submit resume data directly to GitHub
 * without requiring Netlify Functions to be working
 */

// GitHub API client using fetch
class GitHubClient {
  constructor(token, owner, repo, branch = 'main') {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.baseUrl = 'https://api.github.com';
  }

  // Helper for making authenticated requests to GitHub API
  async fetchGitHub(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error (${response.status}): ${errorData.message || 'Unknown error'}`);
    }

    return response.json();
  }

  // Get the current reference to get the latest commit SHA
  async getReference() {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`);
  }

  // Create a blob with the file content
  async createBlob(content) {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/git/blobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: btoa(content), // Base64 encode the content
        encoding: 'base64'
      })
    });
  }

  // Get the current tree
  async getTree(sha) {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/git/trees/${sha}`);
  }

  // Create a new tree
  async createTree(baseTree, path, blobSha) {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/git/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base_tree: baseTree,
        tree: [
          {
            path: path,
            mode: '100644', // File mode
            type: 'blob',
            sha: blobSha
          }
        ]
      })
    });
  }

  // Create a commit
  async createCommit(message, treeSha, parentSha) {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/git/commits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha]
      })
    });
  }

  // Update the reference to point to the new commit
  async updateReference(commitSha) {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sha: commitSha,
        force: false
      })
    });
  }

  // Trigger a repository dispatch event to start the build
  async createDispatchEvent(eventType, payload) {
    return this.fetchGitHub(`/repos/${this.owner}/${this.repo}/dispatches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: payload
      })
    });
  }

  // Store a resume file in GitHub and trigger a build
  async storeResume(resumeData, filePath) {
    try {
      // Step 1: Get the latest commit SHA
      const ref = await this.getReference();
      const latestCommitSha = ref.object.sha;

      // Step 2: Create a blob with the resume data
      const content = JSON.stringify(resumeData, null, 2);
      const blob = await this.createBlob(content);

      // Step 3: Get the current tree
      const tree = await this.getTree(latestCommitSha);

      // Step 4: Create a new tree with the new file
      const newTree = await this.createTree(tree.sha, filePath, blob.sha);

      // Step 5: Create a new commit
      const commit = await this.createCommit(
        `Add resume: ${resumeData.metadata.id} (direct web submission)`,
        newTree.sha,
        latestCommitSha
      );

      // Step 6: Update the reference
      await this.updateReference(commit.sha);

      // Step 7: Trigger a build via repository dispatch
      await this.createDispatchEvent('resume-created', {
        resumeId: resumeData.metadata.id
      });

      return {
        success: true,
        resumeId: resumeData.metadata.id,
        commitSha: commit.sha
      };
    } catch (error) {
      console.error('Error storing resume in GitHub:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Function to submit resume data directly to GitHub
async function submitResumeToGitHub(resumeData) {
  // Get GitHub configuration from environment variables
  // These will need to be set in the HTML form page
  const githubConfig = {
    token: window.GITHUB_TOKEN, 
    owner: window.GITHUB_OWNER,
    repo: window.GITHUB_REPO,
    branch: window.GITHUB_BRANCH || 'main'
  };

  // Create a GitHub client
  const githubClient = new GitHubClient(
    githubConfig.token,
    githubConfig.owner,
    githubConfig.repo,
    githubConfig.branch
  );

  // Set the file path
  const filePath = `_data/resumes/${resumeData.metadata.id}.json`;

  // Store the resume in GitHub
  const result = await githubClient.storeResume(resumeData, filePath);

  if (result.success) {
    // Return success with URLs for viewing and editing
    return {
      success: true,
      resumeId: result.resumeId,
      resumeUrl: `/resumes/${result.resumeId}.html`,
      editUrl: `/edit/${result.resumeId}.html?token=${btoa(`${result.resumeId}-${Date.now()}`)}`
    };
  } else {
    // Return error
    return {
      success: false,
      error: result.error || 'Failed to store resume in GitHub'
    };
  }
}

// Export the function for use in the form script
window.submitResumeToGitHub = submitResumeToGitHub;
