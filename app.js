/* ======== HOMESCHOOL APP LOGIC ======== */

// Wait for the webpage (HTML) to finish loading
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DATA ---
    const math_data = {
        1: [["2 + 3", 5], ["What comes after 9", 10], ["1 + 1", 2]],
        2: [["12 ÷ 3", 4], ["7 × 5", 35], ["15 − 6", 9]],
        3: [["25 ÷ 5", 5], ["9 × 6", 54], ["100 − 37", 63]],
        4: [["144 ÷ 12", 12], ["15 × 8", 120], ["250 − 175", 75]],
        5: [["21 × 12", 252], ["625 ÷ 25", 25], ["1000 − 347", 653]],
        6: [["13 × 17", 221], ["1024 ÷ 16", 64], ["5000 − 2478", 2522]],
    };

    const answer_pool = [
        2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 20, 25, 30, 35, 40, 52, 54, 56,
        63, 64, 65, 66, 67, 68, 70, 73, 75, 110, 115, 120, 211, 221,
        231, 242, 252, 262, 643, 653, 663, 1024, 5000
    ];

    const spelling_words = {
        1: ["cat", "dog", "sun"],
        2: ["apple", "house", "green"],
        3: ["school", "friend", "yellow"],
        4: ["beautiful", "teacher", "holiday"],
        5: ["elephant", "mountain", "language"],
        6: ["knowledge", "exercise", "adventure"],
    };

    const pe_tasks = {
        1: ["Jump 10 times", "Run on the spot for 30 seconds", "Touch your toes 5 times"],
        2: ["Do 15 star jumps", "Hop on one foot 20 seconds each", "Balance on one foot 10 seconds"],
        3: ["Do 10 push-ups", "Run on the spot 1 minute", "Do 20 sit-ups"],
        4: ["Do 25 squats", "Hold a plank for 20 seconds", "Do 15 burpees"],
        5: ["Jog in place 2 minutes", "Do 20 lunges", "Do 30 jumping jacks"],
        6: ["Hold plank 1 minute", "Do 50 sit-ups", "Run on the spot 3 minutes"],
    };

    // --- 2. STATE VARIABLES ---
    let currentUser = null;
    let currentSubject = null;
    let currentYear = null;
    let allProgress = {};
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let currentScore = 0;

    // --- 3. GET HTML ELEMENTS ---
    const screens = document.querySelectorAll('.app-screen');
    const studentLoginScreen = document.getElementById('student-login-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const yearSelectScreen = document.getElementById('year-select-screen');
    const activityScreen = document.getElementById('activity-screen');
    const progressScreen = document.getElementById('progress-screen');

    const studentSelect = document.getElementById('student-select');
    const newStudentInput = document.getElementById('new-student-name');
    const loginButton = document.getElementById('login-button');
    const resetAllButton = document.getElementById('reset-all-progress');
    const studentNameDisplay = document.getElementById('student-name-display');
    const menuButtons = document.querySelectorAll('.menu-button');
    const yearButtons = document.querySelectorAll('.year-button');
    const logoutButton = document.getElementById('logout-button');
    const backToMenuButtons = document.querySelectorAll('.back-to-menu');
    
    const activityTitle = document.getElementById('activity-title');
    const activityContent = document.getElementById('activity-content');
    const activityResult = document.getElementById('activity-result');
    const activityNav = document.getElementById('activity-nav');
    const progressContent = document.getElementById('progress-content');


    // --- 4. HELPER FUNCTIONS ---

    function showScreen(screenId) {
        screens.forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
    }

    function loadProgress() {
        const progressString = localStorage.getItem('homeschoolAppProgress');
        if (progressString) {
            allProgress = JSON.parse(progressString);
        } else {
            allProgress = {};
        }
        updateStudentDropdown();
    }

    function saveProgress() {
        localStorage.setItem('homeschoolAppProgress', JSON.stringify(allProgress));
    }

    function updateStudentDropdown() {
        studentSelect.innerHTML = '<option value="">-- Select --</option>';
        const studentNames = Object.keys(allProgress);
        studentNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            studentSelect.appendChild(option);
        });
    }
    
    function updateProgress(subject, year, score, total) {
        if (!allProgress[currentUser]) {
            allProgress[currentUser] = {};
        }
        
        const key = `${subject}_year${year}`;
        if (!allProgress[currentUser][key]) {
            allProgress[currentUser][key] = [];
        }

        const entry = {
            score: score,
            total: total,
            timestamp: new Date().toISOString()
        };
        
        allProgress[currentUser][key].push(entry);
        saveProgress();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- 5. QUIZ & ACTIVITY LOGIC ---

    // -- MATH --
    function startMathQuiz() {
        currentQuiz = shuffleArray([...math_data[currentYear]]);
        currentQuestionIndex = 0;
        currentScore = 0;
        activityTitle.textContent = `🧮 Math - Year ${currentYear}`;
        displayMathQuestion();
        showScreen('activity-screen');
    }

    function displayMathQuestion() {
        activityContent.innerHTML = '';
        activityResult.innerHTML = '';
        activityResult.className = '';
        activityNav.innerHTML = '';
        
        const [question, correct] = currentQuiz[currentQuestionIndex];
        
        activityContent.innerHTML = `<h3>Q${currentQuestionIndex + 1}: ${question}?</h3>`;
        
        let wrongs = answer_pool.filter(a => a !== correct);
        wrongs = shuffleArray(wrongs).slice(0, 2);
        let options = shuffleArray([...wrongs, correct]);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'menu-buttons';
        
        options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'app-button math-option-button';
            button.textContent = opt;
            button.onclick = () => checkMathAnswer(opt, correct);
            optionsDiv.appendChild(button);
        });
        
        activityContent.appendChild(optionsDiv);
    }
    
    function checkMathAnswer(choice, correct) {
        document.querySelectorAll('.math-option-button').forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.textContent) === correct) {
                btn.style.backgroundColor = '#d4edda';
            }
        });
    
        if (choice === correct) {
            activityResult.textContent = '✅ Correct!';
            activityResult.className = 'correct';
            currentScore++;
        } else {
            activityResult.textContent = `❌ Wrong. The correct answer was ${correct}.`;
            activityResult.className = 'wrong';
        }
        
        const nextButton = document.createElement('button');
        nextButton.className = 'app-button';
        
        if (currentQuestionIndex < currentQuiz.length - 1) {
            nextButton.textContent = 'Next Question →';
            nextButton.onclick = () => {
                currentQuestionIndex++;
                displayMathQuestion();
            };
        } else {
            nextButton.textContent = 'Finish Quiz 🎉';
            nextButton.onclick = endMathQuiz;
        }
        activityNav.innerHTML = '';
        activityNav.appendChild(nextButton);
    }
    
    function endMathQuiz() {
        activityTitle.textContent = 'Math Quiz Complete!';
        activityContent.innerHTML = `<h2>🎉 You scored ${currentScore}/${currentQuiz.length}!</h2>`;
        activityResult.innerHTML = '';
        activityResult.className = '';
        
        updateProgress('math', currentYear, currentScore, currentQuiz.length);
        
        const backButton = document.createElement('button');
        backButton.className = 'app-button-secondary';
        backButton.textContent = 'Back to Menu';
        backButton.onclick = () => showScreen('main-menu-screen');
        activityNav.innerHTML = '';
        activityNav.appendChild(backButton);
    }

    // -- SPELLING --
    function startSpellingQuiz() {
        currentQuiz = shuffleArray([...spelling_words[currentYear]]);
        currentQuestionIndex = 0;
        currentScore = 0;
        activityTitle.textContent = `✏️ Spelling - Year ${currentYear}`;
        displaySpellingQuestion();
        showScreen('activity-screen');
    }
    
    function displaySpellingQuestion() {
        activityContent.innerHTML = '';
        activityResult.innerHTML = '';
        activityResult.className = '';
        activityNav.innerHTML = '';
        
        const word = currentQuiz[currentQuestionIndex];
        
        let scrambled = [...word].sort(() => 0.5 - Math.random()).join('');
        if (scrambled === word) {
             scrambled = [...word].reverse().join('');
        }
        
        activityContent.innerHTML = `
            <h3>Unscramble this word:</h3>
            <p style="font-size: 2rem; letter-spacing: 5px; font-weight: bold; text-align: center; margin: 20px 0; color: #0056b3;">
                ${scrambled}
            </p>
            <label for="spelling-guess" class="app-label">Your guess:</label>
            <input type="text" id="spelling-guess" class="spelling-input">
        `;
        
        const checkButton = document.createElement('button');
        checkButton.className = 'app-button';
        checkButton.textContent = 'Check Answer';
        checkButton.onclick = () => checkSpellingAnswer(word);
        activityNav.appendChild(checkButton);

        document.getElementById('spelling-guess').onkeyup = (e) => {
            if (e.key === 'Enter') {
                checkButton.click();
            }
        };
    }
    
    function checkSpellingAnswer(correctWord) {
        const guess = document.getElementById('spelling-guess').value.trim().toLowerCase();
        
        if (guess === correctWord.toLowerCase()) {
            activityResult.textContent = '✅ Correct!';
            activityResult.className = 'correct';
            currentScore++;
        } else {
            activityResult.textContent = `❌ Nope. The word was '${correctWord}'.`;
            activityResult.className = 'wrong';
        }

        document.getElementById('spelling-guess').disabled = true;

        const nextButton = document.createElement('button');
        nextButton.className = 'app-button';
        
        if (currentQuestionIndex < currentQuiz.length - 1) {
            nextButton.textContent = 'Next Word →';
            nextButton.onclick = () => {
                currentQuestionIndex++;
                displaySpellingQuestion();
            };
        } else {
            nextButton.textContent = 'Finish Practice 🎉';
            nextButton.onclick = endSpellingQuiz;
        }
        activityNav.innerHTML = '';
        activityNav.appendChild(nextButton);
    }
    
    function endSpellingQuiz() {
        activityTitle.textContent = 'Spelling Practice Complete!';
        activityContent.innerHTML = `<h2>🎉 You got ${currentScore}/${currentQuiz.length} correct!</h2>`;
        activityResult.innerHTML = '';
        activityResult.className = '';
        
        updateProgress('spelling', currentYear, currentScore, currentQuiz.length);
        
        const backButton = document.createElement('button');
        backButton.className = 'app-button-secondary';
        backButton.textContent = 'Back to Menu';
        backButton.onclick = () => showScreen('main-menu-screen');
        activityNav.innerHTML = '';
        activityNav.appendChild(backButton);
    }
    
    // -- PE --
    function startPEActivity() {
        const tasks = pe_tasks[currentYear];
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        
        activityTitle.textContent = `🤸 PE - Year ${currentYear}`;
        activityContent.innerHTML = `
            <h3>Your Task:</h3>
            <p style="font-size: 1.5rem; text-align: center; margin: 30px 0;">
                ${task}
            </p>
        `;
        activityResult.innerHTML = '';
        activityResult.className = '';
        activityNav.innerHTML = '';
        
        const finishButton = document.createElement('button');
        finishButton.className = 'app-button';
        finishButton.textContent = 'I Finished! 🏅';
        finishButton.onclick = endPEActivity;
        activityNav.appendChild(finishButton);
        
        showScreen('activity-screen');
    }
    
    function endPEActivity() {
        activityTitle.textContent = 'Activity Complete!';
        activityContent.innerHTML = `<h2>🏅 Great job! Keep active!</h2>`;
        activityNav.innerHTML = '';
        
        updateProgress('pe', currentYear, 1, 1);
        
        const backButton = document.createElement('button');
        backButton.className = 'app-button-secondary';
        backButton.textContent = 'Back to Menu';
        backButton.onclick = () => showScreen('main-menu-screen');
        activityNav.appendChild(backButton);
    }
    
    // -- PROGRESS --
    function displayProgress() {
        progressContent.innerHTML = '';
        const userProgress = allProgress[currentUser];
        
        if (!userProgress || Object.keys(userProgress).length === 0) {
            progressContent.innerHTML = '<p>You have no progress recorded yet. Go complete an activity!</p>';
            showScreen('progress-screen');
            return;
        }
        
        for (const key in userProgress) {
            const [subject, year] = key.split('_year');
            const attempts = userProgress[key];
            
            let subjectHTML = `<h4>📚 ${subject.charAt(0).toUpperCase() + subject.slice(1)} - Year ${year}</h4>`;
            subjectHTML += '<ul>';
            
            attempts.forEach(entry => {
                const date = new Date(entry.timestamp);
                const niceTime = date.toLocaleString();
                const percentage = entry.total > 0 ? ((entry.score / entry.total) * 100).toFixed(0) : 0;
                
                subjectHTML += `
                    <li>
                        <strong>Score: ${entry.score}/${entry.total} (${percentage}%)</strong>
                        <br>
                        <span style="font-size: 0.9rem; color: #555;">${niceTime}</span>
                    </li>
                `;
            });
            
            subjectHTML += '</ul>';
            progressContent.innerHTML += subjectHTML;
        }
        
        showScreen('progress-screen');
    }
    

    // --- 6. EVENT LISTENERS ---

    // -- LOGIN SCREEN --
    loginButton.onclick = () => {
        let selectedUser = studentSelect.value;
        const newUser = newStudentInput.value.trim();
        
        if (newUser) {
            currentUser = newUser;
        } else if (selectedUser) {
            currentUser = selectedUser;
        } else {
            alert('Please select a student or enter a new name.');
            return;
        }
        
        if (!allProgress[currentUser]) {
            allProgress[currentUser] = {};
            saveProgress();
            updateStudentDropdown();
        }
        
        studentNameDisplay.textContent = currentUser;
        newStudentInput.value = '';
        studentSelect.value = '';
        showScreen('main-menu-screen');
    };
    
    resetAllButton.onclick = () => {
        if (confirm('⚠️ WARNING!\nAre you sure you want to reset ALL progress for ALL students? This cannot be undone.')) {
            allProgress = {};
            saveProgress();
            updateStudentDropdown();
            alert('All progress has been reset.');
        }
    };

    // -- MAIN MENU --
    logoutButton.onclick = () => {
        currentUser = null;
        showScreen('student-login-screen');
    };
    
    menuButtons.forEach(button => {
        button.onclick = () => {
            currentSubject = button.dataset.subject;
            
            if (currentSubject === 'progress') {
                displayProgress();
            } else {
                showScreen('year-select-screen');
            }
        };
    });

    // -- YEAR SELECT SCREEN --
    yearButtons.forEach(button => {
        button.onclick = () => {
            currentYear = button.dataset.year;
            
            if (currentSubject === 'math') {
                startMathQuiz();
            } else if (currentSubject === 'spelling') {
                startSpellingQuiz();
            } else if (currentSubject === 'pe') {
                startPEActivity();
            }
        };
    });
    
    // -- BACK BUTTONS --
    backToMenuButtons.forEach(button => {
        button.onclick = () => showScreen('main-menu-screen');
    });

    // --- 7. INITIALIZE THE APP ---
    loadProgress();
    showScreen('student-login-screen');
    
});