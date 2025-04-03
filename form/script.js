document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const resumeForm = document.getElementById('resumeForm');
    const educationContainer = document.getElementById('educationContainer');
    const experienceContainer = document.getElementById('experienceContainer');
    const projectsContainer = document.getElementById('projectsContainer');
    
    // Buttons
    const addEducationBtn = document.getElementById('addEducation');
    const addExperienceBtn = document.getElementById('addExperience');
    const addProjectBtn = document.getElementById('addProject');
    const submitBtn = document.getElementById('submitBtn');
    const previewBtn = document.getElementById('previewBtn');
    const retryBtn = document.getElementById('retryBtn');
    
    // Status elements
    const submissionStatus = document.getElementById('submissionStatus');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const resumeLink = document.getElementById('resumeLink');
    const editLink = document.getElementById('editLink');
    
    // Counter for dynamic form elements
    let educationCount = 1;
    let experienceCount = 1;
    let projectCount = 1;
    
    // Add event listeners
    addEducationBtn.addEventListener('click', addEducation);
    addExperienceBtn.addEventListener('click', addExperience);
    addProjectBtn.addEventListener('click', addProject);
    resumeForm.addEventListener('submit', handleSubmit);
    previewBtn.addEventListener('click', handlePreview);
    retryBtn.addEventListener('click', hideSubmissionStatus);
    
    // Initialize remove buttons for initial entries
    initializeRemoveButtons();
    
    /**
     * Initialize remove buttons for the initial form entries
     */
    function initializeRemoveButtons() {
        document.querySelectorAll('.education-entry .remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (document.querySelectorAll('.education-entry').length > 1) {
                    this.closest('.education-entry').remove();
                    updateRemoveButtonsVisibility('.education-entry');
                }
            });
        });
        
        document.querySelectorAll('.experience-entry .remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (document.querySelectorAll('.experience-entry').length > 1) {
                    this.closest('.experience-entry').remove();
                    updateRemoveButtonsVisibility('.experience-entry');
                }
            });
        });
        
        document.querySelectorAll('.project-entry .remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (document.querySelectorAll('.project-entry').length > 1) {
                    this.closest('.project-entry').remove();
                    updateRemoveButtonsVisibility('.project-entry');
                }
            });
        });
        
        // Update visibility of remove buttons
        updateRemoveButtonsVisibility('.education-entry');
        updateRemoveButtonsVisibility('.experience-entry');
        updateRemoveButtonsVisibility('.project-entry');
    }
    
    /**
     * Update the visibility of remove buttons based on the number of entries
     * @param {string} selector - CSS selector for the entry container
     */
    function updateRemoveButtonsVisibility(selector) {
        const entries = document.querySelectorAll(selector);
        entries.forEach(entry => {
            const removeBtn = entry.querySelector('.remove-btn');
            if (entries.length > 1) {
                removeBtn.style.display = 'block';
            } else {
                removeBtn.style.display = 'none';
            }
        });
    }
    
    /**
     * Add a new education entry to the form
     */
    function addEducation() {
        const educationEntry = document.createElement('div');
        educationEntry.className = 'education-entry';
        educationEntry.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="institution${educationCount}">Institution *</label>
                    <input type="text" id="institution${educationCount}" name="education[${educationCount}].institution" required>
                </div>
                
                <div class="form-group">
                    <label for="degree${educationCount}">Degree *</label>
                    <input type="text" id="degree${educationCount}" name="education[${educationCount}].degree" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="eduStartDate${educationCount}">Start Date</label>
                    <input type="month" id="eduStartDate${educationCount}" name="education[${educationCount}].startDate">
                </div>
                
                <div class="form-group">
                    <label for="eduEndDate${educationCount}">End Date</label>
                    <input type="month" id="eduEndDate${educationCount}" name="education[${educationCount}].endDate">
                </div>
            </div>
            
            <div class="form-group">
                <label for="eduDescription${educationCount}">Description</label>
                <textarea id="eduDescription${educationCount}" name="education[${educationCount}].description" rows="3"></textarea>
            </div>
            
            <button type="button" class="remove-btn">Remove</button>
        `;
        
        educationContainer.appendChild(educationEntry);
        
        // Add event listener to the new remove button
        const removeBtn = educationEntry.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            educationEntry.remove();
            updateRemoveButtonsVisibility('.education-entry');
        });
        
        educationCount++;
        updateRemoveButtonsVisibility('.education-entry');
    }
    
    /**
     * Add a new experience entry to the form
     */
    function addExperience() {
        const experienceEntry = document.createElement('div');
        experienceEntry.className = 'experience-entry';
        experienceEntry.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="company${experienceCount}">Company *</label>
                    <input type="text" id="company${experienceCount}" name="experience[${experienceCount}].company" required>
                </div>
                
                <div class="form-group">
                    <label for="position${experienceCount}">Position *</label>
                    <input type="text" id="position${experienceCount}" name="experience[${experienceCount}].position" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="expStartDate${experienceCount}">Start Date</label>
                    <input type="month" id="expStartDate${experienceCount}" name="experience[${experienceCount}].startDate">
                </div>
                
                <div class="form-group">
                    <label for="expEndDate${experienceCount}">End Date</label>
                    <input type="month" id="expEndDate${experienceCount}" name="experience[${experienceCount}].endDate">
                    <div class="checkbox-group">
                        <input type="checkbox" id="currentJob${experienceCount}" name="experience[${experienceCount}].current">
                        <label for="currentJob${experienceCount}" class="checkbox-label">Current Position</label>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="expDescription${experienceCount}">Description *</label>
                <textarea id="expDescription${experienceCount}" name="experience[${experienceCount}].description" rows="4" required></textarea>
            </div>
            
            <button type="button" class="remove-btn">Remove</button>
        `;
        
        experienceContainer.appendChild(experienceEntry);
        
        // Add event listener to the new remove button
        const removeBtn = experienceEntry.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            experienceEntry.remove();
            updateRemoveButtonsVisibility('.experience-entry');
        });
        
        // Add event listener to the current job checkbox
        const currentJobCheckbox = experienceEntry.querySelector(`#currentJob${experienceCount}`);
        const endDateInput = experienceEntry.querySelector(`#expEndDate${experienceCount}`);
        
        currentJobCheckbox.addEventListener('change', function() {
            if (this.checked) {
                endDateInput.value = '';
                endDateInput.disabled = true;
            } else {
                endDateInput.disabled = false;
            }
        });
        
        experienceCount++;
        updateRemoveButtonsVisibility('.experience-entry');
    }
    
    /**
     * Add a new project entry to the form
     */
    function addProject() {
        const projectEntry = document.createElement('div');
        projectEntry.className = 'project-entry';
        projectEntry.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="projectTitle${projectCount}">Project Title *</label>
                    <input type="text" id="projectTitle${projectCount}" name="projects[${projectCount}].title" required>
                </div>
                
                <div class="form-group">
                    <label for="projectUrl${projectCount}">Project URL</label>
                    <input type="url" id="projectUrl${projectCount}" name="projects[${projectCount}].url" placeholder="https://project-demo.com">
                </div>
            </div>
            
            <div class="form-group">
                <label for="projectDescription${projectCount}">Description *</label>
                <textarea id="projectDescription${projectCount}" name="projects[${projectCount}].description" rows="3" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="projectTechnologies${projectCount}">Technologies Used</label>
                <input type="text" id="projectTechnologies${projectCount}" name="projects[${projectCount}].technologies" placeholder="React, Node.js, MongoDB">
            </div>
            
            <button type="button" class="remove-btn">Remove</button>
        `;
        
        projectsContainer.appendChild(projectEntry);
        
        // Add event listener to the new remove button
        const removeBtn = projectEntry.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            projectEntry.remove();
            updateRemoveButtonsVisibility('.project-entry');
        });
        
        projectCount++;
        updateRemoveButtonsVisibility('.project-entry');
    }
    
    /**
     * Handle form submission
     * @param {Event} event - Form submission event
     */
    function handleSubmit(event) {
        event.preventDefault();
        
        if (!resumeForm.checkValidity()) {
            // Trigger browser's built-in validation
            resumeForm.reportValidity();
            return;
        }
        
        // Show loading state
        showSubmissionStatus();
        
        // Get form data
        const formData = new FormData(resumeForm);
        const resumeData = formDataToJSON(formData);
        
        // Add metadata
        resumeData.metadata = {
            createdAt: new Date().toISOString(),
            version: '1.0.0',
            id: generateUniqueId()
        };
        
        // Process skills (convert comma-separated string to array)
        if (resumeData.skills) {
            resumeData.skills = resumeData.skills
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0);
        }
        
        // Send data to serverless function
        submitResumeData(resumeData);
    }
    
    /**
     * Convert FormData to JSON object
     * @param {FormData} formData - Form data
     * @returns {Object} - JSON object
     */
    function formDataToJSON(formData) {
        const data = {};
        
        // Process education entries
        data.education = [];
        for (let i = 0; i < educationCount; i++) {
            const institution = formData.get(`education[${i}].institution`);
            if (institution) {
                data.education.push({
                    institution: institution,
                    degree: formData.get(`education[${i}].degree`),
                    startDate: formData.get(`education[${i}].startDate`) || null,
                    endDate: formData.get(`education[${i}].endDate`) || null,
                    description: formData.get(`education[${i}].description`) || ''
                });
            }
        }
        
        // Process experience entries
        data.experience = [];
        for (let i = 0; i < experienceCount; i++) {
            const company = formData.get(`experience[${i}].company`);
            if (company) {
                const current = formData.get(`experience[${i}].current`) === 'on';
                data.experience.push({
                    company: company,
                    position: formData.get(`experience[${i}].position`),
                    startDate: formData.get(`experience[${i}].startDate`) || null,
                    endDate: current ? null : (formData.get(`experience[${i}].endDate`) || null),
                    current: current,
                    description: formData.get(`experience[${i}].description`) || ''
                });
            }
        }
        
        // Process project entries
        data.projects = [];
        for (let i = 0; i < projectCount; i++) {
            const title = formData.get(`projects[${i}].title`);
            if (title) {
                const technologies = formData.get(`projects[${i}].technologies`);
                data.projects.push({
                    title: title,
                    url: formData.get(`projects[${i}].url`) || null,
                    description: formData.get(`projects[${i}].description`) || '',
                    technologies: technologies ? technologies.split(',').map(tech => tech.trim()) : []
                });
            }
        }
        
        // Process personal information
        data.fullName = formData.get('fullName');
        data.email = formData.get('email');
        data.phone = formData.get('phone') || null;
        data.location = formData.get('location') || null;
        data.summary = formData.get('summary');
        data.website = formData.get('website') || null;
        data.linkedin = formData.get('linkedin') || null;
        data.github = formData.get('github') || null;
        data.skills = formData.get('skills');
        data.template = formData.get('template');
        
        return data;
    }
    
    /**
     * Generate a unique ID for the resume
     * @returns {string} - Unique ID
     */
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Submit resume data to the serverless function
     * @param {Object} resumeData - Resume data
     */
    function submitResumeData(resumeData) {
        // For demo purposes, we'll simulate a successful API call
        // In a real implementation, this would be a fetch call to the serverless function
        
        console.log('Submitting resume data:', resumeData);
        
        // Simulate API call delay
        setTimeout(() => {
            // Simulate successful response
            const response = {
                success: true,
                resumeId: resumeData.metadata.id,
                resumeUrl: `https://barrymjulien.github.io/resume-website-generator/resumes/${resumeData.metadata.id}.html`,
                editUrl: `https://barrymjulien.github.io/resume-website-generator/edit/${resumeData.metadata.id}.html?token=abc123`
            };
            
            handleSubmitResponse(response);
            
            // Uncomment to simulate an error response
            /*
            const errorResponse = {
                success: false,
                error: 'Failed to connect to the server. Please try again.'
            };
            handleSubmitResponse(errorResponse);
            */
        }, 2000);
    }
    
    /**
     * Handle the response from the serverless function
     * @param {Object} response - API response
     */
    function handleSubmitResponse(response) {
        hideLoadingIndicator();
        
        if (response.success) {
            // Show success message
            successMessage.style.display = 'block';
            
            // Set resume and edit links
            resumeLink.href = response.resumeUrl;
            editLink.href = response.editUrl;
        } else {
            // Show error message
            errorMessage.style.display = 'block';
            errorText.textContent = response.error || 'There was an error processing your resume. Please try again.';
        }
    }
    
    /**
     * Handle preview button click
     */
    function handlePreview() {
        // This would typically open a preview modal or navigate to a preview page
        // For this demo, we'll just log the form data
        const formData = new FormData(resumeForm);
        const resumeData = formDataToJSON(formData);
        
        console.log('Preview resume data:', resumeData);
        alert('Preview functionality would be implemented here. Check the console for the form data.');
    }
    
    /**
     * Show the submission status overlay
     */
    function showSubmissionStatus() {
        submissionStatus.style.display = 'flex';
        loadingIndicator.style.display = 'block';
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }
    
    /**
     * Hide the loading indicator
     */
    function hideLoadingIndicator() {
        loadingIndicator.style.display = 'none';
    }
    
    /**
     * Hide the submission status overlay
     */
    function hideSubmissionStatus() {
        submissionStatus.style.display = 'none';
        loadingIndicator.style.display = 'none';
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }
});
