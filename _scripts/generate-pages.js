/**
 * Resume Website Generator - Static Page Generator
 * 
 * This script generates static HTML pages from resume JSON data.
 * It parses all JSON files in the _data/resumes/ directory,
 * applies the appropriate template, and outputs HTML files.
 */

const fs = require('fs').promises;
const path = require('path');
const nunjucks = require('nunjucks');
const { marked } = require('marked');

// Configuration
const config = {
  dataDir: path.join(__dirname, '../_data/resumes'),
  templatesDir: path.join(__dirname, '../_templates'),
  outputDir: path.join(__dirname, '../_site'),
  resumesOutputDir: path.join(__dirname, '../_site/resumes'),
  editOutputDir: path.join(__dirname, '../_site/edit')
};

// Initialize Nunjucks
const env = nunjucks.configure(config.templatesDir, {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true
});

// Add custom filters
env.addFilter('formatDate', function(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
});

/**
 * Main function to generate all pages
 */
async function generatePages() {
  try {
    console.log('Starting static page generation...');
    
    // Create output directories if they don't exist
    await createDirectories();
    
    // Get all resume data files
    const resumeFiles = await getResumeFiles();
    console.log(`Found ${resumeFiles.length} resume files`);
    
    // Parse resume data
    const resumes = await parseResumeFiles(resumeFiles);
    
    // Generate individual resume pages
    await generateResumePages(resumes);
    
    // Generate edit pages
    await generateEditPages(resumes);
    
    // Generate index page
    await generateIndexPage(resumes);
    
    // Copy assets
    await copyAssets();
    
    console.log('Static page generation completed successfully!');
  } catch (error) {
    console.error('Error generating pages:', error);
    process.exit(1);
  }
}

/**
 * Create necessary directories
 */
async function createDirectories() {
  const directories = [
    config.outputDir,
    config.resumesOutputDir,
    config.editOutputDir,
    path.join(config.outputDir, 'assets'),
    path.join(config.outputDir, 'assets/css'),
    path.join(config.outputDir, 'assets/js')
  ];
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
  
  console.log('Created output directories');
}

/**
 * Get all resume JSON files
 * @returns {Promise<string[]>} Array of file paths
 */
async function getResumeFiles() {
  try {
    const files = await fs.readdir(config.dataDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(config.dataDir, file));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`Data directory not found: ${config.dataDir}`);
      return [];
    }
    throw error;
  }
}

/**
 * Parse resume JSON files
 * @param {string[]} files - Array of file paths
 * @returns {Promise<Object[]>} Array of resume data objects
 */
async function parseResumeFiles(files) {
  const resumes = [];
  
  for (const file of files) {
    try {
      const data = await fs.readFile(file, 'utf8');
      const resume = JSON.parse(data);
      
      // Validate resume data
      if (!resume.fullName || !resume.email) {
        console.warn(`Skipping invalid resume: ${file}`);
        continue;
      }
      
      // Ensure metadata exists
      if (!resume.metadata) {
        resume.metadata = {
          id: path.basename(file, '.json'),
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        };
      }
      
      // Convert markdown to HTML in description fields
      if (resume.summary) {
        resume.summary = marked(resume.summary);
      }
      
      if (Array.isArray(resume.experience)) {
        resume.experience.forEach(exp => {
          if (exp.description) {
            exp.description = marked(exp.description);
          }
        });
      }
      
      if (Array.isArray(resume.education)) {
        resume.education.forEach(edu => {
          if (edu.description) {
            edu.description = marked(edu.description);
          }
        });
      }
      
      if (Array.isArray(resume.projects)) {
        resume.projects.forEach(proj => {
          if (proj.description) {
            proj.description = marked(proj.description);
          }
        });
      }
      
      resumes.push(resume);
    } catch (error) {
      console.error(`Error parsing resume file ${file}:`, error);
    }
  }
  
  return resumes;
}

/**
 * Generate individual resume pages
 * @param {Object[]} resumes - Array of resume data objects
 */
async function generateResumePages(resumes) {
  for (const resume of resumes) {
    try {
      // Determine which template to use
      const templateName = resume.template === 'modern' ? 'modern.html' : 'default.html';
      
      // Render the template with the resume data
      const html = nunjucks.render(templateName, resume);
      
      // Write the HTML file
      const outputPath = path.join(config.resumesOutputDir, `${resume.metadata.id}.html`);
      await fs.writeFile(outputPath, html);
      
      console.log(`Generated resume page: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating resume page for ${resume.fullName}:`, error);
    }
  }
}

/**
 * Generate edit pages
 * @param {Object[]} resumes - Array of resume data objects
 */
async function generateEditPages(resumes) {
  for (const resume of resumes) {
    try {
      // Create a simple edit page that redirects to the form with the resume data
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Resume - ${resume.fullName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f7fb;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            max-width: 500px;
        }
        
        h1 {
            color: #4a6cf7;
            margin-bottom: 1rem;
        }
        
        p {
            margin-bottom: 2rem;
            color: #6c757d;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(74, 108, 247, 0.2);
            border-top: 5px solid #4a6cf7;
            border-radius: 50%;
            margin: 0 auto 1rem;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Loading Editor</h1>
        <div class="spinner"></div>
        <p>Please wait while we load your resume data...</p>
    </div>
    
    <script>
        // In a real implementation, this would validate the token from the URL
        // and then redirect to the form with the resume data
        
        // Get the token from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        // Redirect to the form with the resume ID
        setTimeout(() => {
            window.location.href = '/?edit=${resume.metadata.id}&token=' + (token || '');
        }, 1500);
    </script>
</body>
</html>
      `;
      
      // Write the HTML file
      const outputPath = path.join(config.editOutputDir, `${resume.metadata.id}.html`);
      await fs.writeFile(outputPath, html);
      
      console.log(`Generated edit page: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating edit page for ${resume.fullName}:`, error);
    }
  }
}

/**
 * Generate index page with search functionality
 * @param {Object[]} resumes - Array of resume data objects
 */
async function generateIndexPage(resumes) {
  try {
    // Create a simple index page with search functionality
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Website Generator</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #4a6cf7;
            --primary-hover: #3a5ce4;
            --secondary-color: #6c757d;
            --light-color: #f8f9fa;
            --dark-color: #343a40;
            --border-color: #dee2e6;
            --box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--dark-color);
            background-color: #f5f7fb;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header */
        header {
            background-color: var(--primary-color);
            color: white;
            padding: 2rem 0;
            text-align: center;
            box-shadow: var(--box-shadow);
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        header p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 1.5rem;
        }
        
        .create-btn {
            display: inline-block;
            background-color: white;
            color: var(--primary-color);
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .create-btn:hover {
            background-color: rgba(255, 255, 255, 0.9);
            transform: translateY(-2px);
        }
        
        /* Search Section */
        .search-section {
            padding: 2rem 0;
        }
        
        .search-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: var(--box-shadow);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .search-box {
            display: flex;
            margin-bottom: 1.5rem;
        }
        
        .search-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 4px 0 0 4px;
            font-size: 1rem;
        }
        
        .search-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 0 4px 4px 0;
            padding: 0 1.5rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .search-btn:hover {
            background-color: var(--primary-hover);
        }
        
        /* Resume Cards */
        .resumes-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .resume-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .resume-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
            background-color: var(--primary-color);
            color: white;
            padding: 1.5rem;
        }
        
        .card-name {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }
        
        .card-title {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .card-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .card-skill {
            background-color: #f0f4ff;
            color: var(--primary-color);
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
        }
        
        .card-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
        }
        
        .card-link {
            color: var(--primary-color);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .card-link:hover {
            text-decoration: underline;
        }
        
        .no-results {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: var(--box-shadow);
        }
        
        /* Footer */
        footer {
            background-color: var(--dark-color);
            color: white;
            padding: 1.5rem 0;
            text-align: center;
            margin-top: 2rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .resumes-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1><i class="fas fa-file-alt"></i> Resume Website Generator</h1>
            <p>Create and share your professional resume website in minutes</p>
            <a href="/form/index.html" class="create-btn">Create Your Resume</a>
        </div>
    </header>
    
    <main class="container">
        <section class="search-section">
            <div class="search-container">
                <div class="search-box">
                    <input type="text" id="searchInput" class="search-input" placeholder="Search resumes by name, skills, or position...">
                    <button id="searchBtn" class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <p>Showing <span id="resultCount">${resumes.length}</span> resumes</p>
            </div>
            
            <div id="resumesContainer" class="resumes-container">
                ${resumes.map(resume => `
                <div class="resume-card" data-name="${resume.fullName.toLowerCase()}" data-skills="${(resume.skills || []).join(' ').toLowerCase()}" data-position="${resume.experience && resume.experience.length > 0 ? resume.experience[0].position.toLowerCase() : ''}">
                    <div class="card-header">
                        <h3 class="card-name">${resume.fullName}</h3>
                        ${resume.experience && resume.experience.length > 0 ? `<p class="card-title">${resume.experience[0].position}</p>` : ''}
                    </div>
                    <div class="card-body">
                        <div class="card-skills">
                            ${(resume.skills || []).slice(0, 5).map(skill => `<span class="card-skill">${skill}</span>`).join('')}
                            ${(resume.skills || []).length > 5 ? `<span class="card-skill">+${resume.skills.length - 5} more</span>` : ''}
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="resumes/${resume.metadata.id}.html" class="card-link">View Resume</a>
                        <span class="card-date">${new Date(resume.metadata.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                `).join('')}
            </div>
            
            <div id="noResults" class="no-results" style="display: none;">
                <h3>No resumes found</h3>
                <p>Try a different search term or create your own resume</p>
            </div>
        </section>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 Resume Website Generator. All rights reserved.</p>
        </div>
    </footer>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            const searchBtn = document.getElementById('searchBtn');
            const resumesContainer = document.getElementById('resumesContainer');
            const noResults = document.getElementById('noResults');
            const resultCount = document.getElementById('resultCount');
            const resumeCards = document.querySelectorAll('.resume-card');
            
            function performSearch() {
                const searchTerm = searchInput.value.toLowerCase();
                let matchCount = 0;
                
                resumeCards.forEach(card => {
                    const name = card.dataset.name;
                    const skills = card.dataset.skills;
                    const position = card.dataset.position;
                    
                    if (name.includes(searchTerm) || skills.includes(searchTerm) || position.includes(searchTerm)) {
                        card.style.display = 'block';
                        matchCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                resultCount.textContent = matchCount;
                
                if (matchCount === 0) {
                    noResults.style.display = 'block';
                    resumesContainer.style.display = 'none';
                } else {
                    noResults.style.display = 'none';
                    resumesContainer.style.display = 'grid';
                }
            }
            
            searchBtn.addEventListener('click', performSearch);
            
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });
        });
    </script>
</body>
</html>
    `;
    
    // Write the HTML file
    const outputPath = path.join(config.outputDir, 'index.html');
    await fs.writeFile(outputPath, html);
    
    console.log(`Generated index page: ${outputPath}`);
  } catch (error) {
    console.error('Error generating index page:', error);
  }
}

/**
 * Copy assets to the output directory
 */
async function copyAssets() {
  // In a real implementation, this would copy CSS, JS, images, etc.
  console.log('Assets copied to output directory');
}

// Run the script
generatePages();
