// Home Page JavaScript - AquaHarvest
class AquaHarvestHome {
    constructor() {
        this.locationData = null;
        this.weatherData = null;
        this.particleSystem = null;
        this.init();
    }

    async init() {
        this.setupParticleSystem();
        this.setupAnimations();
        this.setupNavigation();
        this.setupLocationDetection();
        this.setupTypingAnimation();
        this.setupScrollEffects();
        await this.detectLocation();
    }

    // Particle System for Background
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
        const particleCount = 150;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.radius = Math.random() * 3 + 1;
                this.opacity = Math.random() * 0.5 + 0.3;
                this.hue = Math.random() * 60 + 180; // Blue-cyan range
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Slight pulsing effect
                this.opacity += Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.01;
                this.opacity = Math.max(0.1, Math.min(0.8, this.opacity));
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
                ctx.fill();
                
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${this.hue}, 70%, 60%)`;
                ctx.fill();
                ctx.restore();
            }
        }

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections between nearby particles
            this.drawConnections(particles, ctx);
            
            requestAnimationFrame(animate);
        };

        animate();
    }

    drawConnections(particles, ctx) {
        const maxDistance = 100;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.2;
                    ctx.strokeStyle = '#06b6d4';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    // Typing Animation
    setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-animation');
        const text = typingElement.dataset.text;
        let index = 0;
        
        const typeText = () => {
            if (index < text.length) {
                typingElement.textContent = text.slice(0, index + 1);
                index++;
                setTimeout(typeText, 100);
            } else {
                setTimeout(() => {
                    index = 0;
                    typingElement.textContent = '';
                    setTimeout(typeText, 1000);
                }, 3000);
            }
        };

        // Start typing animation after page load
        setTimeout(typeText, 1500);
    }

    // Word Animation for Hero Title
    setupAnimations() {
        const words = document.querySelectorAll('.word');
        
        words.forEach((word, index) => {
            const delay = parseInt(word.dataset.delay) || 0;
            word.style.animationDelay = `${delay}ms`;
        });

        // Fade in text animation
        const fadeTexts = document.querySelectorAll('.fade-in-text');
        fadeTexts.forEach(text => {
            const delay = parseInt(text.dataset.delay) || 0;
            text.style.animationDelay = `${delay}ms`;
        });

        // Button hover effects
        this.setupButtonEffects();
    }

    setupButtonEffects() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Start Assessment Button
        const startBtn = document.getElementById('startAssessmentBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.animateToAssessment();
            });
        }

        // Learn More Button
        const learnBtn = document.getElementById('learnMoreBtn');
        if (learnBtn) {
            learnBtn.addEventListener('click', () => {
                document.getElementById('features').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }

    animateToAssessment() {
        // Add loading animation
        const button = document.getElementById('startAssessmentBtn');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        // Simulate loading delay for smooth transition
        setTimeout(() => {
            window.location.href = 'assessment.html';
        }, 1500);
    }

    // Navigation
    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            } else {
                navbar.style.background = 'rgba(15, 23, 42, 0.8)';
            }
        });
    }

    // Location Detection
    async detectLocation() {
        const locationInfo = document.getElementById('locationInfo');
        const locationText = document.getElementById('locationText');
        const weatherInfo = document.getElementById('weatherInfo');
        const weatherText = document.getElementById('weatherText');

        try {
            // Request geolocation
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        this.locationData = { latitude, longitude };
                        
                        // Update UI with coordinates
                        locationText.innerHTML = `
                            <span class="coordinates">
                                ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E
                            </span>
                        `;
                        
                        // Fetch location name and weather
                        await this.fetchLocationDetails(latitude, longitude);
                        await this.fetchWeatherData(latitude, longitude);
                        
                        // Update background based on weather
                        this.updateBackgroundForWeather();
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        locationText.textContent = 'Location unavailable';
                        weatherText.textContent = 'Weather data unavailable';
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            } else {
                locationText.textContent = 'Geolocation not supported';
                weatherText.textContent = 'Weather data unavailable';
            }
        } catch (error) {
            console.error('Location detection failed:', error);
            locationText.textContent = 'Location detection failed';
            weatherText.textContent = 'Weather data unavailable';
        }
    }

    async fetchLocationDetails(lat, lng) {
        try {
            // Using a simple reverse geocoding approach
            // In a real app, you'd use a proper geocoding service
            const locationText = document.getElementById('locationText');
            locationText.innerHTML = `
                <span class="location-name">Location Detected</span>
                <small>${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</small>
            `;
        } catch (error) {
            console.error('Failed to fetch location details:', error);
        }
    }

    async fetchWeatherData(lat, lng) {
        try {
            // Simulate weather data (in production, use OpenWeatherMap or similar)
            const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Clear'];
            const temperatures = [25, 28, 22, 30, 26];
            
            const randomIndex = Math.floor(Math.random() * weatherConditions.length);
            const condition = weatherConditions[randomIndex];
            const temperature = temperatures[randomIndex];
            
            this.weatherData = {
                condition,
                temperature,
                humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
                windSpeed: Math.floor(Math.random() * 15) + 5 // 5-20 km/h
            };
            
            const weatherText = document.getElementById('weatherText');
            weatherText.innerHTML = `
                ${condition} • ${temperature}°C • ${this.weatherData.humidity}% humidity
            `;
            
            // Update weather icon
            const weatherIcon = weatherInfo.querySelector('i');
            this.updateWeatherIcon(weatherIcon, condition);
            
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
        }
    }

    updateWeatherIcon(iconElement, condition) {
        const iconMap = {
            'Sunny': 'fas fa-sun',
            'Clear': 'fas fa-sun',
            'Partly Cloudy': 'fas fa-cloud-sun',
            'Cloudy': 'fas fa-cloud',
            'Rainy': 'fas fa-cloud-rain'
        };
        
        iconElement.className = iconMap[condition] || 'fas fa-cloud-sun';
    }

    updateBackgroundForWeather() {
        if (!this.weatherData) return;
        
        const backgroundGradient = document.querySelector('.background-gradient');
        const rainParticles = document.querySelector('.rain-particles');
        
        // Adjust background based on weather
        switch (this.weatherData.condition) {
            case 'Rainy':
                rainParticles.style.opacity = '0.6';
                backgroundGradient.style.filter = 'brightness(0.8) contrast(1.1)';
                break;
            case 'Sunny':
            case 'Clear':
                rainParticles.style.opacity = '0.1';
                backgroundGradient.style.filter = 'brightness(1.1) contrast(1.0)';
                break;
            case 'Cloudy':
                rainParticles.style.opacity = '0.2';
                backgroundGradient.style.filter = 'brightness(0.9) contrast(1.05)';
                break;
            default:
                rainParticles.style.opacity = '0.3';
                backgroundGradient.style.filter = 'brightness(1.0) contrast(1.0)';
        }
    }

    setupLocationDetection() {
        // This method can be expanded for manual location input
        console.log('Location detection system initialized');
    }

    // Scroll Effects
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // Animate statistics when they come into view
        const statNumbers = document.querySelectorAll('.stat-number');
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                }
            });
        }, observerOptions);

        statNumbers.forEach(stat => {
            statObserver.observe(stat);
        });
    }

    animateNumber(element) {
        const target = element.textContent;
        const isPercentage = target.includes('%');
        const isPlusSuffix = target.includes('+');
        const numericValue = parseInt(target.replace(/[^\d]/g, ''));
        
        let current = 0;
        const increment = numericValue / 60; // Animate over 60 frames
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current);
            if (isPercentage) displayValue += '%';
            if (isPlusSuffix) displayValue += '+';
            if (target.includes('M')) displayValue += 'M';
            if (target.includes('K')) displayValue += 'K';
            
            element.textContent = displayValue;
        }, 16); // ~60fps
    }

    // Utility method to get location data
    getLocationData() {
        return this.locationData;
    }

    // Utility method to get weather data
    getWeatherData() {
        return this.weatherData;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aquaHarvestHome = new AquaHarvestHome();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AquaHarvestHome;
}

// ===== LOCATION DETECTION FEATURE =====
function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const apiKey = "6d5c4c0004b3442eabbbb2d0184dc8a9"; // your weather API key

  fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`)
    .then(response => response.json())
    .then(data => {
      if (document.getElementById("location")) {
        document.getElementById("location").innerText = data.location.name;
      }
      if (document.getElementById("temp")) {
        document.getElementById("temp").innerText = data.current.temp_c + "°C";
      }
    })
    .catch(err => console.error(err));
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  alert("Unable to detect location. Please allow location access.");
}

// Attach event to 'Use My Location' button if exists
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("useLocationBtn");
  if (btn) {
    btn.addEventListener("click", detectLocation);
  }
});
