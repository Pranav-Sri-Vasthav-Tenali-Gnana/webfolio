document.addEventListener("DOMContentLoaded", () => {
    // Loading screen animation
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }, 1500);

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu .nav-link');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // Custom cursor
    const cursor = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursor && cursorOutline) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            cursorOutline.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });

        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'scale(0.8)';
            cursorOutline.style.transform = 'scale(1.5)';
        });

        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'scale(1)';
            cursorOutline.style.transform = 'scale(1)';
        });

        // Hide cursor on mouse leave
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorOutline.style.opacity = '1';
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Multi-text typing effect for hero section
    const typingTexts = ["Web Developer", "Full Stack Developer", "Data Engineer", "Python Developer"];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingDelay = 100;
    const erasingDelay = 50;
    const newTextDelay = 2000;

    function typeEffect() {
        const currentText = typingTexts[textIndex];
        const typingElement = document.querySelector('.dynamic-text');

        if (typingElement) {
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(typeEffect, newTextDelay);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % typingTexts.length;
                setTimeout(typeEffect, typingDelay);
            } else {
                setTimeout(typeEffect, isDeleting ? erasingDelay : typingDelay);
            }
        }
    }

    setTimeout(typeEffect, newTextDelay);

    // Glitch effect for hero heading
    const glitchText = document.querySelector('.glitch');
    if (glitchText) {
        setInterval(() => {
            glitchText.classList.add('active');
            setTimeout(() => {
                glitchText.classList.remove('active');
            }, 200);
        }, 3000);
    }

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate skill bars when they come into view
                if (entry.target.classList.contains('skill-bar')) {
                    const progress = entry.target.querySelector('.progress');
                    if (progress) {
                        const percentage = progress.getAttribute('data-percentage');
                        progress.style.width = percentage + '%';
                    }
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section, .skill-bar').forEach(element => {
        observer.observe(element);
    });

    // Project filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            
            projects.forEach(project => {
                if (filter === 'all' || project.getAttribute('data-category') === filter) {
                    project.style.display = 'block';
                    setTimeout(() => {
                        project.style.opacity = '1';
                        project.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    project.style.opacity = '0';
                    project.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        project.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate form submission
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-message success';
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Message sent successfully!';
                contactForm.appendChild(successMessage);
                
                // Reset form
                contactForm.reset();
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            } catch (error) {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-message error';
                errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to send message. Please try again.';
                contactForm.appendChild(errorMessage);
                
                setTimeout(() => {
                    errorMessage.remove();
                }, 3000);
            } finally {
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const icon = themeToggle.querySelector('i');
            
            if (icon.classList.contains('fa-moon')) {
                // Switch to light theme
                icon.classList.replace('fa-moon', 'fa-sun');
                root.style.setProperty('--background', '#ffffff');
                root.style.setProperty('--surface', '#f5f5f5');
                root.style.setProperty('--text-primary', '#000000');
                root.style.setProperty('--text-secondary', '#666666');
            } else {
                // Switch to dark theme
                icon.classList.replace('fa-sun', 'fa-moon');
                root.style.setProperty('--background', '#0a0a0a');
                root.style.setProperty('--surface', '#111111');
                root.style.setProperty('--text-primary', '#ffffff');
                root.style.setProperty('--text-secondary', '#b3b3b3');
            }
        });
    }

    // Form label animation
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        // Check for pre-filled inputs
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});