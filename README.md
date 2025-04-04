# Resume Website Generator 1

A comprehensive system for generating professional resume websites from form submissions. This project allows users to create and share their resumes as static websites hosted on GitHub Pages.

## Features

- **User-friendly Form Interface**: Responsive form for collecting resume information
- **Multiple Templates**: Choose between different resume designs
- **Automatic GitHub Pages Deployment**: Static sites automatically generated and deployed
- **Edit Functionality**: Unique links for resume owners to update their information
- **Search & Browse**: Index page to search and browse all generated resumes

## Project Structure

```
├── form/                  # Client-side form
│   ├── index.html         # Form interface
│   ├── styles.css         # Form styling
│   └── script.js          # Form handling & submission
├── functions/             # Serverless function
│   └── submit-resume.js   # Process submission & interact with GitHub
├── _templates/            # Resume page templates
│   ├── default.html       # Default resume template
│   └── modern.html        # Modern resume template
├── _scripts/              # Build scripts
│   └── generate-pages.js  # Static page generator
└── .github/workflows/     # GitHub Actions
    └── build-resumes.yml  # Automation workflow
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/resume-website-generator.git
   cd resume-website-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file with the following variables:
     ```
     GITHUB_OWNER=your-github-username
     GITHUB_REPO=your-repo-name
     GITHUB_TOKEN=your-github-personal-access-token
     ```

## Development

### Running the Form Locally

```
npm run dev:form
```

This will start a local server for the form interface at http://localhost:5000.

### Running the Serverless Function Locally

```
npm run dev:function
```

This will start the serverless function locally at http://localhost:9000.

## Deployment

### Form Interface

The form interface can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

1. Build the project:
   ```
   npm run build
   ```

2. Deploy the `form` directory to your hosting service.

### Serverless Function

The serverless function can be deployed to services like Netlify Functions, AWS Lambda, or Vercel Functions.

#### Netlify Deployment

1. Create a `netlify.toml` file:
   ```toml
   [build]
     functions = "lambda"
   
   [build.environment]
     GITHUB_OWNER = "your-github-username"
     GITHUB_REPO = "your-repo-name"
   ```

2. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```

### GitHub Repository Setup

1. Create a new GitHub repository for storing resume data and hosting the static sites.

2. Enable GitHub Pages for the repository, set to deploy from the `gh-pages` branch.

3. Create a GitHub Personal Access Token with `repo` scope.

4. Add the token as a secret in your GitHub repository settings.

## Usage

1. Fill out the resume form with your information.

2. Submit the form to generate your resume website.

3. Share the provided URL with potential employers.

4. Use the edit link to update your resume information as needed.

## Customization

### Adding New Templates

1. Create a new HTML template in the `_templates` directory.

2. Update the form to include the new template option.

3. Modify the `generate-pages.js` script to handle the new template.

### Extending Form Fields

1. Add new fields to the form in `form/index.html`.

2. Update the form handling in `form/script.js`.

3. Modify the serverless function to process the new fields.

4. Update the templates to display the new information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
