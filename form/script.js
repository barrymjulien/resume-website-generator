document.addEventListener('DOMContentLoaded', function() {
    // Form elements (Using IDs you provided)
    const resumeForm = document.getElementById('resumeForm'); // Assuming form ID is resumeForm
    const educationContainer = document.getElementById('educationContainer');
    const experienceContainer = document.getElementById('experienceContainer');
    const projectsContainer = document.getElementById('projectsContainer');

    // Buttons (Using IDs you provided)
    const addEducationBtn = document.getElementById('addEducation');
    const addExperienceBtn = document.getElementById('addExperience');
    const addProjectBtn = document.getElementById('addProject');
    const submitBtn = document.getElementById('submitBtn'); // Assuming submit button ID
    const previewBtn = document.getElementById('previewBtn');
    const retryBtn = document.getElementById('retryBtn'); // Assuming retry button ID for error message

    // Status elements (Using IDs you provided)
    const submissionStatus = document.getElementById('submissionStatus'); // Main container for status
    const loadingIndicator = document.getElementById('loadingIndicator');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText'); // Specific element for error message text
    const resumeLink = document.getElementById('resumeLink');
    const editLink = document.getElementById('editLink');

    // Counter for dynamic form elements
    // Initialize based on existing elements if needed, or start fresh
    let educationCount = document.querySelectorAll('.education-entry').length;
    let experienceCount = document.querySelectorAll('.experience-entry').length;
    let projectCount = document.querySelectorAll('.project-entry').length;

    // --- Event Listeners ---
    if (addEducationBtn) addEducationBtn.addEventListener('click', addEducation);
    if (addExperienceBtn) addExperienceBtn.addEventListener('click', addExperience);
    if (addProjectBtn) addProjectBtn.addEventListener('click', addProject);
    if (resumeForm) resumeForm.addEventListener('submit', handleSubmit);
    if (previewBtn) previewBtn.addEventListener('click', handlePreview);
    // Make retry button hide the overall status display
    if (retryBtn) retryBtn.addEventListener('click', hideSubmissionStatus);

    // Initialize remove buttons for potentially pre-existing entries
    initializeRemoveButtons();

    // --- Functions ---

    function initializeRemoveButtons() {
        document.querySelectorAll('.education-entry .remove-btn').forEach(btn => addRemoveListener(btn, '.education-entry'));
        document.querySelectorAll('.experience-entry .remove-btn').forEach(btn => addRemoveListener(btn, '.experience-entry'));
        document.querySelectorAll('.project-entry .remove-btn').forEach(btn => addRemoveListener(btn, '.project-entry'));

        updateRemoveButtonsVisibility('.education-entry');
        updateRemoveButtonsVisibility('.experience-entry');
        updateRemoveButtonsVisibility('.project-entry');
    }

    function addRemoveListener(button, entrySelector) {
         // Use { once: true } if elements are completely replaced, otherwise standard listener
         button.addEventListener('click', function() {
            // Only remove if more than one entry exists
            if (document.querySelectorAll(entrySelector).length > 1) {
                this.closest(entrySelector)?.remove(); // Use optional chaining
                updateRemoveButtonsVisibility(entrySelector);
            } else {
                alert(`At least one ${entrySelector.substring(1)} is required.`);
            }
        });
    }

    function updateRemoveButtonsVisibility(selector) {
        const entries = document.querySelectorAll(selector);
        const show = entries.length > 1;
        entries.forEach(entry => {
            const removeBtn = entry.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.style.display = show ? 'inline-block' : 'none'; // Or 'block'
            }
        });
    }

    function addEducation() {
        educationCount++; // Increment counter first
        const entryHtml = `
            <div class="education-entry form-section-item"> {/* Added form-section-item class */}
                <div class="form-row">
                    <div class="form-group">
                        <label for="institution${educationCount}">Institution *</label>
                        <input type="text" id="institution${educationCount}" name="education[${educationCount}].institution" required data-name="institution">
                    </div>
                    <div class="form-group">
                        <label for="degree${educationCount}">Degree *</label>
                        <input type="text" id="degree${educationCount}" name="education[${educationCount}].degree" required data-name="degree">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="eduStartDate${educationCount}">Start Date</label>
                        <input type="month" id="eduStartDate${educationCount}" name="education[${educationCount}].startDate" data-name="startDate">
                    </div>
                    <div class="form-group">
                        <label for="eduEndDate${educationCount}">End Date</label>
                        <input type="month" id="eduEndDate${educationCount}" name="education[${educationCount}].endDate" data-name="endDate">
                    </div>
                </div>
                <div class="form-group">
                    <label for="eduDescription${educationCount}">Description</label>
                    <textarea id="eduDescription${educationCount}" name="education[${educationCount}].description" rows="3" data-name="description"></textarea>
                </div>
                <button type="button" class="remove-btn">Remove</button>
            </div>
        `;
        educationContainer.insertAdjacentHTML('beforeend', entryHtml);
        const newEntry = educationContainer.lastElementChild;
        const removeBtn = newEntry.querySelector('.remove-btn');
        if (removeBtn) addRemoveListener(removeBtn, '.education-entry');
        updateRemoveButtonsVisibility('.education-entry');
    }

    function addExperience() {
        experienceCount++; // Increment counter first
        const entryHtml = `
            <div class="experience-entry form-section-item"> {/* Added form-section-item class */}
                <div class="form-row">
                    <div class="form-group">
                        <label for="company${experienceCount}">Company *</label>
                        <input type="text" id="company${experienceCount}" name="experience[${experienceCount}].company" required data-name="company">
                    </div>
                    <div class="form-group">
                        <label for="position${experienceCount}">Position *</label>
                        <input type="text" id="position${experienceCount}" name="experience[${experienceCount}].position" required data-name="position">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="expStartDate${experienceCount}">Start Date</label>
                        <input type="month" id="expStartDate${experienceCount}" name="experience[${experienceCount}].startDate" data-name="startDate">
                    </div>
                    <div class="form-group">
                        <label for="expEndDate${experienceCount}">End Date</label>
                        <input type="month" id="expEndDate${experienceCount}" name="experience[${experienceCount}].endDate" data-name="endDate">
                        <div class="checkbox-group">
                            <input type="checkbox" id="currentJob${experienceCount}" name="experience[${experienceCount}].current" data-name="current">
                            <label for="currentJob${experienceCount}" class="checkbox-label">Current Position</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="expDescription${experienceCount}">Description *</label>
                    <textarea id="expDescription${experienceCount}" name="experience[${experienceCount}].description" rows="4" required data-name="description"></textarea>
                </div>
                <button type="button" class="remove-btn">Remove</button>
            </div>
        `;
        experienceContainer.insertAdjacentHTML('beforeend', entryHtml);
        const newEntry = experienceContainer.lastElementChild;
        const removeBtn = newEntry.querySelector('.remove-btn');
        const currentJobCheckbox = newEntry.querySelector(`#currentJob${experienceCount}`);
        const endDateInput = newEntry.querySelector(`#expEndDate${experienceCount}`);

        if (removeBtn) addRemoveListener(removeBtn, '.experience-entry');

        // Add event listener to the current job checkbox
        if (currentJobCheckbox && endDateInput) {
             currentJobCheckbox.addEventListener('change', function() {
                endDateInput.disabled = this.checked;
                if (this.checked) {
                    endDateInput.value = ''; // Clear end date if current
                }
            });
            // Initial check in case it's added checked (though unlikely)
            endDateInput.disabled = currentJobCheckbox.checked;
        }
        updateRemoveButtonsVisibility('.experience-entry');
    }

    function addProject() {
        projectCount++; // Increment counter first
        const entryHtml = `
            <div class="project-entry form-section-item"> {/* Added form-section-item class */}
                <div class="form-row">
                    <div class="form-group">
                        <label for="projectTitle${projectCount}">Project Title *</label>
                        <input type="text" id="projectTitle${projectCount}" name="projects[${projectCount}].title" required data-name="title">
                    </div>
                    <div class="form-group">
                        <label for="projectUrl${projectCount}">Project URL</label>
                        <input type="url" id="projectUrl${projectCount}" name="projects[${projectCount}].url" placeholder="https://project-demo.com" data-name="url">
                    </div>
                </div>
                <div class="form-group">
                    <label for="projectDescription${projectCount}">Description *</label>
                    <textarea id="projectDescription${projectCount}" name="projects[${projectCount}].description" rows="3" required data-name="description"></textarea>
                </div>
                <div class="form-group">
                    <label for="projectTechnologies${projectCount}">Technologies Used (comma-separated)</label>
                    <input type="text" id="projectTechnologies${projectCount}" name="projects[${projectCount}].technologies" placeholder="React, Node.js, MongoDB" data-name="technologies">
                </div>
                <button type="button" class="remove-btn">Remove</button>
            </div>
        `;
        projectsContainer.insertAdjacentHTML('beforeend', entryHtml);
        const newEntry = projectsContainer.lastElementChild;
        const removeBtn = newEntry.querySelector('.remove-btn');
        if (removeBtn) addRemoveListener(removeBtn, '.project-entry');
        updateRemoveButtonsVisibility('.project-entry');
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!resumeForm.checkValidity()) {
            resumeForm.reportValidity(); // Trigger browser validation UI
            return;
        }

        showSubmissionStatus(true); // Show loading state

        const formData = new FormData(resumeForm);
        const resumeData = formDataToStructuredJSON(formData); // Use the structured JSON converter

        // Add metadata just before submission
        resumeData.metadata = {
            createdAt: new Date().toISOString(),
            version: '1.0.0', // Or fetch from package.json if needed
            id: generateUniqueId() // Generate ID at submission time
        };

        // Send data to serverless function
        submitResumeData(resumeData);
    }

     // More robust function to convert form data, handling dynamic sections
    function formDataToStructuredJSON(formData) {
        const data = {};

        // Get simple fields directly
        ['template', 'fullName', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'summary', 'skills'].forEach(key => {
            data[key] = formData.get(key) || ''; // Default to empty string if null
        });

        // Process Skills string into array
         data.skills = data.skills.split(',')
                            .map(skill => skill.trim())
                            .filter(skill => skill.length > 0);

        // Process dynamic sections
        data.education = processDynamicSection('.education-entry', ['institution', 'degree', 'startDate', 'endDate', 'description']);
        data.experience = processDynamicSection('.experience-entry', ['company', 'position', 'startDate', 'endDate', 'current', 'description']);
        data.projects = processDynamicSection('.project-entry', ['title', 'url', 'description', 'technologies']);

        return data;
    }

    function processDynamicSection(entrySelector, fieldNames) {
        const entries = [];
        document.querySelectorAll(entrySelector).forEach(entryElement => {
            const entryData = {};
            let hasData = false; // Check if entry has any actual data
            fieldNames.forEach(fieldName => {
                 // Find input/textarea/select using name or data-name attribute within the entry element
                const input = entryElement.querySelector(`[name$="].${fieldName}"]`) || entryElement.querySelector(`[data-name="${fieldName}"]`);
                 if (input) {
                    if (input.type === 'checkbox') {
                        entryData[fieldName] = input.checked;
                        // Usually checkbox alone doesn't mean the entry has data unless required
                    } else if (input.tagName === 'TEXTAREA' || input.type === 'text' || input.type === 'url' || input.type === 'month' || input.type === 'email') {
                         entryData[fieldName] = input.value.trim();
                        if (entryData[fieldName]) {
                            hasData = true; // Mark if any text field has value
                        }
                    }
                    // Handle 'technologies' specifically if it's comma-separated in one input
                     if (fieldName === 'technologies' && typeof entryData[fieldName] === 'string') {
                        entryData[fieldName] = entryData[fieldName].split(',')
                                                    .map(tech => tech.trim())
                                                    .filter(tech => tech.length > 0);
                         if (entryData[fieldName].length > 0) hasData = true;
                    }
                } else {
                    // Initialize field as empty/null if not found (or default value)
                     entryData[fieldName] = (fieldName === 'technologies') ? [] : (fieldName === 'current' ? false : '');
                }

                 // Handle null for dates if empty
                 if ((fieldName === 'startDate' || fieldName === 'endDate') && !entryData[fieldName]) {
                     entryData[fieldName] = null;
                 }
                 // If 'current' is true, ensure 'endDate' is null
                 if (fieldName === 'endDate' && entryData['current'] === true) {
                    entryData[fieldName] = null;
                 }

            });
             // Only add the entry if it contains some data (modify this condition if needed)
            if (hasData) {
                entries.push(entryData);
            }
        });
        return entries;
    }


    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 7); // Slightly longer random part
    }

    // --- submitResumeData function with CORRECTED .catch block ---
    function submitResumeData(resumeData) {
        console.log('Submitting resume data via API:', resumeData);

        showSubmissionStatus(true); // Show loading

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
             controller.abort();
             console.error('API request timed out.');
             // Show timeout specific error if needed, or let the catch handle AbortError
             // handleSubmitResponse({ success: false, error: 'Request timed out. Please try again.' });
        }, 25000); // 25 second timeout

        fetch('/api/submit-resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resumeData),
            signal: controller.signal
        })
        .finally(() => clearTimeout(timeoutId)) // Always clear timeout
        .then(response => {
            // Check if response is ok (status 200-299)
            if (!response.ok) {
                 // Try to get error details from body, then throw
                 return response.text().then(text => {
                    let errorDetail = text;
                    try {
                        // Attempt to parse as JSON for structured errors
                        const errorJson = JSON.parse(text);
                        errorDetail = errorJson.error || errorJson.message || text;
                    } catch(e) { /* Ignore parsing error, use raw text if not JSON */ }
                    // Throw an error to be caught by the .catch block
                    throw new Error(`Server error: ${response.status} - ${errorDetail}`);
                 });
            }
            // If OK, parse the JSON body for the success response
            return response.json();
        })
        .then(data => {
             // Handle successful response from the function (data might still indicate internal success/failure)
             // Check if the data object itself signals success
             if (data && data.success) {
                handleSubmitResponse(data);
             } else {
                 // Handle cases where the function returns 2xx but reports an error in the body
                 throw new Error(data.error || 'API returned success status but reported an error.');
             }
        })
        .catch(error => { // *** THIS IS THE CORRECTED CATCH BLOCK ***
            console.error('Error submitting resume via API:', error);

            // Display the error message from the fetch failure or thrown error
            handleSubmitResponse({
                success: false,
                 // Use the error message caught, provide default if empty
                error: `Submission failed: ${error.message || 'Network error or server unavailable. Please try again.'}`
            });

            // *** NO FALLBACK LOGIC HERE ***

        }); // *** END OF CORRECTED CATCH BLOCK ***
    }
    // --- End submitResumeData ---


    function handleSubmitResponse(response) {
        hideLoadingIndicator(); // Hide loading indicator regardless of success/fail

        if (response.success) {
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            // Construct absolute URLs
            const origin = window.location.origin;
            const viewUrl = new URL(response.resumeUrl, origin).href;
            const editUrlWithToken = new URL(response.editUrl, origin).href;

            resumeLink.href = viewUrl;
            editLink.href = editUrlWithToken;
            resumeLink.textContent = `View Your Resume`; // Keep text simple
            editLink.textContent = `Save Your Edit Link!`; // Clear call to action
            submissionStatus.style.display = 'flex'; // Ensure parent container is visible

            // Optionally disable form fields or show a 'Start Over' button?
            // resumeForm.reset(); // Maybe reset the form?

        } else {
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
            errorText.textContent = response.error || 'An unknown error occurred. Please try again.';
            submissionStatus.style.display = 'flex'; // Ensure parent container is visible
        }
    }

    function handlePreview() {
        // Implement preview logic if needed - This is just a placeholder
        const formData = new FormData(resumeForm);
        const resumeData = formDataToStructuredJSON(formData);
        console.log('Preview resume data:', resumeData);
        alert('Preview functionality not fully implemented. Check console for data.');
    }

    function showSubmissionStatus(isLoading = false) {
        submissionStatus.style.display = 'flex'; // Show the main status container
        if(isLoading) {
            loadingIndicator.style.display = 'block';
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
        }
         // Disable submit button when loading
         if (submitBtn) submitBtn.disabled = isLoading;
    }

    function hideLoadingIndicator() {
         if (loadingIndicator) loadingIndicator.style.display = 'none';
          // Re-enable submit button when loading is done (could be success or error)
         if (submitBtn) submitBtn.disabled = false; // FIXED: was submitButton
    }

    // Function attached to the 'Try Again' button
    function hideSubmissionStatus() {
         if (submissionStatus) submissionStatus.style.display = 'none';
          // Re-enable submit button when user clicks retry
         if (submitBtn) submitBtn.disabled = false; // FIXED: was submitButton
    }

}); // End DOMContentLoaded