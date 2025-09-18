// Assessment Page JavaScript - AquaHarvest
class AquaHarvestAssessment {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.assessmentData = {};
        this.locationData = null;
        this.particleSystem = null;
        this.charts = {};
        this.init();
    }

    async init() {
        this.setupParticleSystem();
        this.setupFormInteractions();
        this.setupProgressTracking();
        this.setupLocationDetection();
        this.setupValidation();
        this.loadSavedProgress();
        this.setupAutoSave();
    }

    // Particle System for Assessment Background
    setupParticleSystem() {
        const canvas = document.getElementById('particleCanvas');
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const particleCount = 80;

        class DataParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.3 + 0.2;
                this.hue = Math.random() * 60 + 200; // Blue-purple range
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Keep within bounds
                this.x = Math.max(0, Math.min(canvas.width, this.x));
                this.y = Math.max(0, Math.min(canvas.height, this.y));

                // Pulsing effect
                this.opacity += Math.sin(Date.now() * this.pulseSpeed) * 0.05;
                this.opacity = Math.max(0.1, Math.min(0.5, this.opacity));
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 60%, 70%)`;
                ctx.fill();
                
                // Add data visualization effect
                ctx.shadowBlur = 8;
                ctx.shadowColor = `hsl(${this.hue}, 60%, 70%)`;
                ctx.fill();
                ctx.restore();
            }
        }

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new DataParticle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw data flow lines
            this.drawDataFlow(particles, ctx);
            
            requestAnimationFrame(animate);
        };

        animate();
    }

    drawDataFlow(particles, ctx) {
        const maxDistance = 120;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - (distance / maxDistance)) * 0.15;
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = '#06b6d4';
                    ctx.lineWidth = 0.5;
                    ctx.setLineDash([2, 4]);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    // Form Interactions
    setupFormInteractions() {
        // Usage slider interaction
        const usageSlider = document.getElementById('usageSlider');
        const dailyUsageInput = document.getElementById('dailyUsage');
        
        if (usageSlider && dailyUsageInput) {
            usageSlider.addEventListener('input', (e) => {
                dailyUsageInput.value = e.target.value;
            });
            
            dailyUsageInput.addEventListener('input', (e) => {
                const value = Math.max(50, Math.min(2000, e.target.value));
                usageSlider.value = value;
                dailyUsageInput.value = value;
            });
        }

        // Input animations
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                const formGroup = e.target.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('focused');
                }
            });
            
            input.addEventListener('blur', (e) => {
                const formGroup = e.target.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('focused');
                }
            });
            
            // Real-time validation
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
                this.saveFieldData(e.target);
            });
        });

        // Radio and checkbox interactions
        this.setupRadioCheckboxInteractions();
        
        // Save progress button
        const saveBtn = document.getElementById('saveProgress');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProgress();
                this.showNotification('Progress saved successfully!', 'success');
            });
        }
    }

    setupRadioCheckboxInteractions() {
        // Radio button interactions
        const radioOptions = document.querySelectorAll('.radio-option');
        radioOptions.forEach(option => {
            option.addEventListener('click', () => {
                const input = option.querySelector('input[type="radio"]');
                if (input) {
                    input.checked = true;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });

        // Checkbox interactions
        const checkboxOptions = document.querySelectorAll('.checkbox-option');
        checkboxOptions.forEach(option => {
            option.addEventListener('click', () => {
                const input = option.querySelector('input[type="checkbox"]');
                if (input) {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }

    // Progress Tracking
    setupProgressTracking() {
        this.updateProgress();
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
    }

    
    // Location Detection
    setupLocationDetection() {
        const detectBtn = document.getElementById('detectLocationBtn');
        const addressInput = document.getElementById('address');
        const locationDetails = document.getElementById('locationDetails');
        const detectedLocation = document.getElementById('detectedLocation');
        const coordinates = document.getElementById('coordinates');

        if (detectBtn) {
            detectBtn.addEventListener('click', async () => {
                detectBtn.disabled = true;
                detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';

                try {
                    if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const { latitude, longitude } = position.coords;
                                this.locationData = { latitude, longitude };

                                // Update coordinates
                                coordinates.innerHTML = `
                                    <span>Lat: ${latitude.toFixed(6)}</span>
                                    <span>Lng: ${longitude.toFixed(6)}</span>
                                `;

                                // Call reverse geocoding
                                await this.reverseGeocode(latitude, longitude, addressInput, detectedLocation);

                                locationDetails.style.display = 'block';
                                detectBtn.innerHTML = '<i class="fas fa-check"></i> Detected';
                                detectBtn.style.background = 'var(--success-color)';

                                setTimeout(() => {
                                    detectBtn.disabled = false;
                                    detectBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Auto-detect';
                                    detectBtn.style.background = 'var(--gradient-primary)';
                                }, 3000);
                            },
                            (error) => {
                                console.error('Geolocation error:', error);
                                this.showNotification('Location detection failed. Please enter address manually.', 'error');
                                detectBtn.disabled = false;
                                detectBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Auto-detect';
                            }
                        );
                    } else {
                        this.showNotification('Geolocation not supported by your browser.', 'error');
                        detectBtn.disabled = false;
                        detectBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Auto-detect';
                    }
                } catch (error) {
                    console.error('Location detection error:', error);
                    this.showNotification('Failed to detect location.', 'error');
                    detectBtn.disabled = false;
                    detectBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Auto-detect';
                }
            });
        }
    }

    async reverseGeocode(lat, lng, addressInput, detectedLocation) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();

            const address = data.display_name || `Lat: ${lat}, Lng: ${lng}`;
            addressInput.value = address;
            detectedLocation.textContent = address;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            detectedLocation.textContent = `Lat: ${lat}, Lng: ${lng}`;
        }
    }

    // Field Validation
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        let isValid = true;
        let message = '';

        // Remove previous validation styling
        field.classList.remove('valid', 'invalid');

        switch (fieldName) {
            case 'ownerName':
                if (value.length < 2) {
                    isValid = false;
                    message = 'Name must be at least 2 characters long';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
                if (value && !phoneRegex.test(value)) {
                    isValid = false;
                    message = 'Please enter a valid phone number';
                }
                break;
            case 'roofArea':
                const area = parseFloat(value);
                if (isNaN(area) || area < 10) {
                    isValid = false;
                    message = 'Roof area must be at least 10 square meters';
                } else if (area > 10000) {
                    isValid = false;
                    message = 'Roof area seems too large. Please check your input';
                }
                break;
            case 'availableSpace':
                const space = parseFloat(value);
                if (value && (isNaN(space) || space < 0)) {
                    isValid = false;
                    message = 'Available space must be a positive number';
                }
                break;
            case 'dailyUsage':
                const usage = parseFloat(value);
                if (isNaN(usage) || usage < 50) {
                    isValid = false;
                    message = 'Daily usage must be at least 50 liters';
                } else if (usage > 5000) {
                    isValid = false;
                    message = 'Daily usage seems too high. Please check your input';
                }
                break;
        }

        // Apply validation styling
        if (field.hasAttribute('required') && !value) {
            field.classList.add('invalid');
            this.showFieldError(field, 'This field is required');
        } else if (value && !isValid) {
            field.classList.add('invalid');
            this.showFieldError(field, message);
        } else if (value) {
            field.classList.add('valid');
            this.hideFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Step Navigation
    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                document.getElementById(`step${this.currentStep}`).classList.remove('active');
                this.currentStep++;
                
                if (this.currentStep === 4) {
                    // Process and show results
                    this.processAssessment();
                } else {
                    document.getElementById(`step${this.currentStep}`).classList.add('active');
                }
                
                this.updateProgress();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            document.getElementById(`step${this.currentStep}`).classList.remove('active');
            this.currentStep--;
            document.getElementById(`step${this.currentStep}`).classList.add('active');
            this.updateProgress();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        const radioGroups = currentStepElement.querySelectorAll('input[type="radio"][required]');
        
        let isValid = true;

        // Check required text inputs and selects
        requiredFields.forEach(field => {
            if (!this.validateField(field) || !field.value.trim()) {
                isValid = false;
            }
        });

        // Check radio groups
        const radioGroupNames = new Set();
        radioGroups.forEach(radio => radioGroupNames.add(radio.name));
        
        radioGroupNames.forEach(groupName => {
            const groupRadios = currentStepElement.querySelectorAll(`input[name="${groupName}"]`);
            const isGroupSelected = Array.from(groupRadios).some(radio => radio.checked);
            if (!isGroupSelected) {
                isValid = false;
                this.showNotification(`Please select an option for ${groupName.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            }
        });

        return isValid;
    }

    saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!this.assessmentData[input.name]) {
                    this.assessmentData[input.name] = [];
                }
                if (input.checked && !this.assessmentData[input.name].includes(input.value)) {
                    this.assessmentData[input.name].push(input.value);
                } else if (!input.checked) {
                    const index = this.assessmentData[input.name].indexOf(input.value);
                    if (index > -1) {
                        this.assessmentData[input.name].splice(index, 1);
                    }
                }
            } else if (input.type === 'radio' && input.checked) {
                this.assessmentData[input.name] = input.value;
            } else if (input.type !== 'radio' && input.value) {
                this.assessmentData[input.name || input.id] = input.value;
            }
        });

        // Add location data if available
        if (this.locationData) {
            this.assessmentData.location = this.locationData;
        }
    }

    saveFieldData(field) {
        if (field.type === 'checkbox') {
            if (!this.assessmentData[field.name]) {
                this.assessmentData[field.name] = [];
            }
            if (field.checked && !this.assessmentData[field.name].includes(field.value)) {
                this.assessmentData[field.name].push(field.value);
            } else if (!field.checked) {
                const index = this.assessmentData[field.name].indexOf(field.value);
                if (index > -1) {
                    this.assessmentData[field.name].splice(index, 1);
                }
            }
        } else if (field.type === 'radio' && field.checked) {
            this.assessmentData[field.name] = field.value;
        } else if (field.type !== 'radio' && field.value) {
            this.assessmentData[field.name || field.id] = field.value;
        }
    }

    // Auto-save functionality
    setupAutoSave() {
        setInterval(() => {
            this.saveProgress();
        }, 30000); // Auto-save every 30 seconds
    }

    saveProgress() {
        this.saveCurrentStepData();
        const progressData = {
            currentStep: this.currentStep,
            assessmentData: this.assessmentData,
            locationData: this.locationData,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('aquaHarvestProgress', JSON.stringify(progressData));
    }

    loadSavedProgress() {
        const savedProgress = localStorage.getItem('aquaHarvestProgress');
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                
                // Check if progress is recent (within 24 hours)
                const savedTime = new Date(progressData.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.assessmentData = progressData.assessmentData || {};
                    this.locationData = progressData.locationData;
                    
                    // Restore form values
                    this.restoreFormValues();
                    
                    // Ask user if they want to continue from where they left off
                    if (Object.keys(this.assessmentData).length > 0) {
                        const continueAssessment = confirm('We found a previous assessment in progress. Would you like to continue from where you left off?');
                        if (continueAssessment && progressData.currentStep > 1) {
                            this.goToStep(progressData.currentStep);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load saved progress:', error);
            }
        }
    }

    restoreFormValues() {
        Object.keys(this.assessmentData).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox' && Array.isArray(this.assessmentData[key])) {
                    const checkboxes = document.querySelectorAll(`[name="${key}"]`);
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = this.assessmentData[key].includes(checkbox.value);
                    });
                } else if (element.type === 'radio') {
                    const radio = document.querySelector(`[name="${key}"][value="${this.assessmentData[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = this.assessmentData[key];
                }
            }
        });
    }

    goToStep(stepNumber) {
        document.getElementById(`step${this.currentStep}`).classList.remove('active');
        this.currentStep = stepNumber;
        document.getElementById(`step${this.currentStep}`).classList.add('active');
        this.updateProgress();
    }

    // Process Assessment
    async processAssessment() {
        document.getElementById(`step${this.currentStep}`).classList.add('active');
        
        // Show processing animation
        const processingScreen = document.getElementById('processingScreen');
        const resultsScreen = document.getElementById('resultsScreen');
        
        processingScreen.style.display = 'block';
        resultsScreen.classList.add('hidden');
        
        // Simulate processing steps
        await this.simulateProcessingSteps();
        
        // Calculate results
        const results = await this.calculateResults();
        
        // Display results
        this.displayResults(results);
        
        // Hide processing, show results
        setTimeout(() => {
            processingScreen.style.display = 'none';
            resultsScreen.classList.remove('hidden');
            this.setupResultsInteractions();
        }, 6000);
    }

    async simulateProcessingSteps() {
        const steps = [
            'processStep1',
            'processStep2', 
            'processStep3',
            'processStep4'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Remove active from previous step
            if (i > 0) {
                document.getElementById(steps[i-1]).classList.remove('active');
            }
            
            // Add active to current step
            document.getElementById(steps[i]).classList.add('active');
        }
    }

    async calculateResults() {
        // This would integrate with the calculations.js module
        const calculator = new window.RainwaterCalculator(this.assessmentData, this.locationData);
        return calculator.generateReport();
    }

    displayResults(results) {
        // Update feasibility status
        const statusElement = document.querySelector('.feasibility-status');
        const statusIcon = statusElement.querySelector('.status-icon i');
        const statusTitle = statusElement.querySelector('h2');
        const statusDesc = statusElement.querySelector('p');
        
        if (results.feasibilityScore >= 80) {
            statusIcon.className = 'fas fa-check-circle';
            statusTitle.textContent = 'Highly Feasible';
            statusTitle.style.color = 'var(--success-color)';
            statusDesc.textContent = 'Your property shows excellent potential for rainwater harvesting';
            statusElement.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))';
            statusElement.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        } else if (results.feasibilityScore >= 60) {
            statusIcon.className = 'fas fa-exclamation-triangle';
            statusTitle.textContent = 'Moderately Feasible';
            statusTitle.style.color = 'var(--warning-color)';
            statusDesc.textContent = 'Your property has good potential with some considerations';
            statusElement.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1))';
            statusElement.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        } else {
            statusIcon.className = 'fas fa-times-circle';
            statusTitle.textContent = 'Limited Feasibility';
            statusTitle.style.color = 'var(--error-color)';
            statusDesc.textContent = 'Consider alternative water conservation methods';
            statusElement.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1))';
            statusElement.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
        
        // Update metrics
        document.getElementById('annualPotential').textContent = results.annualPotential.toLocaleString();
        document.getElementById('monthlyPotential').textContent = `${(results.annualPotential / 12).toLocaleString()} L`;
        document.getElementById('monsoonPotential').textContent = `${(results.annualPotential * 0.6 / 4).toLocaleString()} L`;
        
        document.getElementById('initialCost').textContent = `₹${results.initialCost.toLocaleString()}`;
        document.getElementById('annualSavings').textContent = `₹${results.annualSavings.toLocaleString()}`;
        document.getElementById('paybackPeriod').textContent = `${results.paybackPeriod} years`;
        
        document.getElementById('tankCapacity').textContent = `${results.recommendedCapacity.toLocaleString()} L capacity`;
        document.getElementById('rechargeDimensions').textContent = results.rechargeDimensions;
        
        document.getElementById('carbonSaved').textContent = `${results.carbonSaved} tons`;
        document.getElementById('groundwaterLevel').textContent = `${results.groundwaterLevel} m`;
        document.getElementById('aquiferType').textContent = results.aquiferType;
        document.getElementById('avgRainfall').textContent = `${results.avgRainfall} mm/year`;
        
        // Create rainfall chart
        this.createRainfallChart(results.rainfallData);
    }

    createRainfallChart(rainfallData) {
        const ctx = document.getElementById('rainfallChart').getContext('2d');
        
        this.charts.rainfall = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Rainfall (mm)',
                    data: rainfallData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    setupResultsInteractions() {
        // Download report button
        const downloadBtn = document.getElementById('downloadReport');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadReport();
            });
        }
        
        // Share results button
        const shareBtn = document.getElementById('shareResults');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareResults();
            });
        }
    }

    downloadReport() {
        // Generate and download PDF report
        this.showNotification('Generating report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            const reportData = this.generateReportData();
            this.createPDFReport(reportData);
            this.showNotification('Report downloaded successfully!', 'success');
        }, 2000);
    }

    generateReportData() {
        return {
            timestamp: new Date().toISOString(),
            assessmentData: this.assessmentData,
            locationData: this.locationData,
            // Add calculated results here
        };
    }

    createPDFReport(reportData) {
        // In a real application, this would generate a proper PDF
        // For now, we'll create a simple text report
        const reportContent = `
AQUAHARVEST - RAINWATER HARVESTING ASSESSMENT REPORT
Generated on: ${new Date().toLocaleDateString()}

PROPERTY INFORMATION:
Owner: ${this.assessmentData.ownerName || 'N/A'}
Address: ${this.assessmentData.address || 'N/A'}
Property Type: ${this.assessmentData.propertyType || 'N/A'}
Dwellers: ${this.assessmentData.dwellers || 'N/A'}

TECHNICAL SPECIFICATIONS:
Roof Area: ${this.assessmentData.roofArea || 'N/A'} sq.m
Roof Type: ${this.assessmentData.roofType || 'N/A'}
Available Space: ${this.assessmentData.availableSpace || 'N/A'} sq.m
Soil Type: ${this.assessmentData.soilType || 'N/A'}

WATER REQUIREMENTS:
Daily Usage: ${this.assessmentData.dailyUsage || 'N/A'} liters
Current Source: ${this.assessmentData.waterSource || 'N/A'}
Monthly Cost: ₹${this.assessmentData.waterCost || 'N/A'}
Budget: ₹${this.assessmentData.budget || 'N/A'}

This is a preliminary assessment. For detailed implementation, 
please consult with certified rainwater harvesting professionals.
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AquaHarvest_Assessment_Report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    shareResults() {
        if (navigator.share) {
            navigator.share({
                title: 'My AquaHarvest Assessment Results',
                text: 'Check out my rainwater harvesting potential assessment!',
                url: window.location.href
            });
        } else {
            // Fallback to copying URL
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Assessment URL copied to clipboard!', 'success');
            });
        }
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--border-radius)',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#2563eb'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    startNewAssessment() {
        if (confirm('Are you sure you want to start a new assessment? This will clear all current data.')) {
            localStorage.removeItem('aquaHarvestProgress');
            window.location.reload();
        }
    }
}

// Navigation functions for step buttons
function nextStep() {
    if (window.assessmentApp) {
        window.assessmentApp.nextStep();
    }
}

function prevStep() {
    if (window.assessmentApp) {
        window.assessmentApp.prevStep();
    }
}

function startNewAssessment() {
    if (window.assessmentApp) {
        window.assessmentApp.startNewAssessment();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentApp = new AquaHarvestAssessment();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AquaHarvestAssessment;
}
