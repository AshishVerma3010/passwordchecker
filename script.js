document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const strengthBar = document.getElementById('strength-bar');
    const criteriaList = document.getElementById('criteria-list');
    
    // Generator Elements
    const generatedPasswordField = document.getElementById('generatedPassword');
    const copyButton = document.getElementById('copyButton');
    const generateButton = document.getElementById('generateButton');
    const passwordLengthSlider = document.getElementById('passwordLength');
    const passwordLengthValue = document.getElementById('passwordLengthValue');
    const securityNotice = document.getElementById('security-notice'); // New element

    // Criteria mapping
    const criteria = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special'),
    };

    // --- INITIALIZE ---
    passwordLengthValue.textContent = passwordLengthSlider.value;

    // --- EVENT LISTENERS ---

    // Update length display on slider input
    passwordLengthSlider.addEventListener('input', () => {
        passwordLengthValue.textContent = passwordLengthSlider.value;
    });

    // Update feedback on password input
    passwordInput.addEventListener('input', () => {
        securityNotice.classList.remove('visible'); // Hide notice when user types
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        updateFeedback(strength);
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
    
    // Generate new password
    generateButton.addEventListener('click', () => {
        const length = parseInt(passwordLengthSlider.value, 10);
        const newPassword = generatePassword(length);
        generatedPasswordField.value = newPassword;
        passwordInput.value = newPassword; // Also put in checker
        updateFeedback(checkPasswordStrength(newPassword)); // Update feedback for it
        securityNotice.classList.add('visible'); // Show security notice
    });
    
    // Copy password to clipboard
    copyButton.addEventListener('click', () => {
        if (generatedPasswordField.value) {
            navigator.clipboard.writeText(generatedPasswordField.value).then(() => {
                copyButton.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fa-regular fa-copy"></i>';
                }, 2000);
            });
        }
    });

    // --- FUNCTIONS ---

    /**
     * Checks password strength and returns a detailed status object.
     * @param {string} password - The password to check.
     * @returns {object} An object containing the score and boolean checks for each criterion.
     */
    function checkPasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        
        return { score, checks };
    }

    /**
     * Updates the UI based on the password strength score and criteria checks.
     * @param {object} strength - The strength object from checkPasswordStrength.
     */
    function updateFeedback(strength) {
        // Update criteria checklist
        for (const key in strength.checks) {
            const li = criteria[key];
            const icon = li.querySelector('i');
            if (strength.checks[key]) {
                li.classList.add('valid');
                icon.className = 'fa-solid fa-check-circle';
            } else {
                li.classList.remove('valid');
                icon.className = 'fa-regular fa-circle';
            }
        }
        
        // Update strength bar and input border color
        let width = (strength.score / 5) * 100;
        let color = '';
        let borderColor = '';

        if (passwordInput.value.length === 0) {
            width = 0;
            color = '';
            borderColor = '#1f2a4a';
        } else if (strength.score <= 2) {
            color = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            borderColor = '#e74c3c';
        } else if (strength.score <= 4) {
            color = 'linear-gradient(90deg, #f39c12, #e67e22)';
            borderColor = '#f39c12';
        } else {
            color = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            borderColor = '#2ecc71';
        }

        strengthBar.style.width = `${width}%`;
        strengthBar.style.background = color;
        passwordInput.style.borderColor = borderColor;
    }

    /**
     * Generates a strong, random password using the Web Crypto API.
     * @param {number} length - The desired length of the password.
     * @returns {string} The generated password.
     */
    function generatePassword(length = 16) {
        const charSets = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        const finalLength = Math.max(length, 8);
        const allChars = Object.values(charSets).join('');
        
        // A helper function to get a crypto-secure random number
        const getRandomNumber = (max) => {
            const buffer = new Uint32Array(1);
            window.crypto.getRandomValues(buffer);
            return buffer[0] % max;
        };
        
        let passwordArray = [];
        
        // Ensure at least one character from each set is included
        passwordArray.push(charSets.lowercase[getRandomNumber(charSets.lowercase.length)]);
        passwordArray.push(charSets.uppercase[getRandomNumber(charSets.uppercase.length)]);
        passwordArray.push(charSets.numbers[getRandomNumber(charSets.numbers.length)]);
        passwordArray.push(charSets.symbols[getRandomNumber(charSets.symbols.length)]);

        // Fill the rest of the password length with random characters from the full set
        for (let i = 4; i < finalLength; i++) {
            passwordArray.push(allChars[getRandomNumber(allChars.length)]);
        }

        // Shuffle the array using a secure method (Fisher-Yates shuffle)
        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = getRandomNumber(i + 1);
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }

        return passwordArray.join('');
    }
});