// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYYal5piOOTkxjtqzbdlGc-cNlVuBsvQU",
  authDomain: "quizle-bc190.firebaseapp.com",
  projectId: "quizle-bc190",
  storageBucket: "quizle-bc190.appspot.com",
  messagingSenderId: "357098909278",
  appId: "1:357098909278:web:e564bf9d65384bedc3cecf",
  measurementId: "G-DJPEJWKRBB"
};
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

async function createLeaderboard(leaderboard_array, table, item) {
    await db.collection("Users").orderBy(item, "desc").limit(100).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            leaderboard_array.push({"username": doc.data().username, "highscore": doc.data()[item]});
        });
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });

    for (const [index, item] of leaderboard_array.entries()) {
        let tr = document.createElement('tr');
        let rank = document.createElement('td');
        rank.textContent = index + 1;
        let username = document.createElement('td');
        username.textContent = item.username;
        let highscore = document.createElement('td');
        highscore.textContent = item.highscore;
        tr.appendChild(rank);
        tr.appendChild(username);
        tr.appendChild(highscore);
        table.appendChild(tr);
    }

    const rows = table.getElementsByTagName('tr');
    const arr_rows = Array.from(table.getElementsByTagName('tr'));

    displayPage(table, 1, arr_rows);
}

function displayPage(table, page, rows) {
    const rowsPerPage = 8;
    // Hide all rows
    for (let row of rows) {
        row.style.display = 'none';
    }

    let startRow = (page - 1) * rowsPerPage;
    let endRow = startRow + rowsPerPage;
    for (let i = startRow; i < endRow; i++) {
        if (rows[i]) {
            rows[i].style.display = "";
        }
    }

    table.closest('div').querySelector('.pagination').replaceChildren();
    for (let i = 0; i < rows.length; i+=rowsPerPage) {
        let pageNumber = i / rowsPerPage + 1;
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.textContent = pageNumber;
        if (pageNumber === page) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            displayPage(table, pageNumber, rows);
        });
        li.appendChild(button);
        table.closest('div').querySelector('.pagination').appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login');
    const createAccountForm = document.querySelector('#createAccount');
    const loginContainer = document.getElementById('login-container');
    const createAccountContainer = document.getElementById('signup-container');
    const logoutButton = document.getElementById('logout-button');

    const homeButton = document.getElementById('home-btn');
    const leaderboardButton = document.getElementById('leaderboard-btn');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const quizContainer = document.getElementById('quiz-container');
    const questionContainer = document.getElementById('question');
    const answersContainer = document.getElementById('answers');
    const resultContainer = document.getElementById('result');
    const progressContainer = document.getElementById('progress');
    const currentScoreDisplay = document.getElementById('currentScore');
    const displayName = document.getElementById('display-name');
    const menuHighScoreDisplay = document.getElementById('menu-highscore');
    const highScoreDisplay = document.getElementById('highScore');
    const gameSetupDiv = document.getElementById('game-setup');
    const quizDiv = document.getElementById('quiz');
    const categorySelect = document.getElementById('category');
    const amountInput = document.getElementById('amount');
    const difficultySelect = document.getElementById('difficulty');
    const startButton = document.getElementById('start-btn');
    const quit = document.getElementById('quit');
    const quitButton = document.getElementById('quit-btn');
    const leaderboard_10_div = document.getElementById('leaderboard-10');
    const leaderboard_20_div = document.getElementById('leaderboard-20');
    const leaderboard_25_div = document.getElementById('leaderboard-25');
    const leaderboard_50_div = document.getElementById('leaderboard-50');
    const lb_10s_btn = document.getElementById('10s');
    const lb_20s_btn = document.getElementById('20s');
    const lb_25s_btn = document.getElementById('25s');
    const lb_50s_btn = document.getElementById('50s');
    const table_10 = document.querySelector('#leaderboard-10 tbody');
    const table_20 = document.querySelector('#leaderboard-20 tbody');
    const table_25 = document.querySelector('#leaderboard-25 tbody');
    const table_50 = document.querySelector('#leaderboard-50 tbody');

    // User variables
    let highScore_10 = 0;
    let highScore_20 = 0;
    let highScore_25 = 0;
    let highScore_50 = 0;
    let username = "";
    let question_amount = "10";

    // Game Variables
    let currentQuestions = [];
    let score = 0;
    let questionIndex = 0;
    let questionStartTime;
    const baseScorePerQuestion = 1000;
    const penaltyPerSecond = 10;

    let leaderboard_10 = [];
    let leaderboard_20 = [];
    let leaderboard_25 = [];
    let leaderboard_50 = [];

    // Switch to Create Account
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        console.log("Create Account")
        e.preventDefault();
        loginContainer.style.display = "none";
        createAccountContainer.style.display = "block";
    });
    // Switch to Login
    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginContainer.style.display = "block";
        createAccountContainer.style.display = "none";
    });

    // Get User
    const getUser = (user_id) => {
        console.log("getUser")
        db.collection("Users").where("user_id", "==", user_id).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
                // get user's highscore from doc.data()
                username = doc.data().username;
                highScore_10 = doc.data().highscore_10;
                highScore_20 = doc.data().highscore_20;
                highScore_25 = doc.data().highscore_25;
                highScore_50 = doc.data().highscore_50;
                displayName.innerText = `${username}`;
                updateMenuHighScore();                                     
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }
    
    //Login submit
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.querySelector("#login #email").value;
        const password = document.querySelector("#login #password").value;
        // Perform Login
        auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
            console.log('User sign in successful');
            setFormMessage(loginForm, "success", "");
            getUser(userCredential.user.uid);
        }).catch((error) => { 
            var errorCode = error.code;
            var errorMessage = error.message;
            setFormMessage(loginForm, "error", errorMessage);
        });
        
    });
    // Create Account submit
    createAccountForm.addEventListener("submit", e => { 
        e.preventDefault();
        const username = document.querySelector("#createAccount #username").value;
        const email = document.querySelector("#createAccount #email").value;
        const password = document.querySelector("#createAccount #password").value;
        const confirmPassword = document.querySelector("#createAccount #confirmPassword").value;
        // Perform Create account
        db.collection("Users").doc(username).get().then((doc) => {
            if (doc.exists) {
                console.log("Username already exists");
                setFormMessage(createAccountForm, "error", "Username already exists");
            } else {
                if (password === confirmPassword && password.length > 0) {
                    auth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
                        console.log('User is created');
                        console.log(userCredential);
                        setFormMessage(createAccountForm, "success", "");
                        // Add user to database
                        db.collection("Users").doc(username).set({
                            username: username,
                            user_id: userCredential.user.uid,
                            email: email,
                            highscore_10: 0,
                            highscore_20: 0,
                            highscore_25: 0,
                            highscore_50: 0,
                        }).then(() => {
                            console.log("Document successfully written!");
                        }).catch((error) => {
                            var errorMessage = error.message;
                            console.log("error:" + errorMessage);
                            setFormMessage(createAccountForm, "error", errorMessage);
                        });
                    }).catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log("error:" + errorMessage);
                        setFormMessage(createAccountForm, "error", errorMessage);
                    });
                }
                else {
                    console.log("Passwords do not match")
                    setFormMessage(createAccountForm, "error", "Passwords do not match");
                }
            }
        });
    });

    // Logout
    logoutButton.addEventListener("click", e => {
        e.preventDefault();
        auth.signOut().then(() => {
            // Sign-out successful.
            console.log("Sign-out successful");
            // Clear everything to default
        }).catch((error) => {
            // An error happened.
            console.log("An error happened");
        });
    });

    // firebase event listener for the user state
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            createAccountContainer.style.display = "none";
            loginContainer.style.display = "none";
            quizContainer.style.display = "block";
            logoutButton.style.display = "block";
            // Get user's highscore and info from database
            getUser(user.uid);
            // Get Leaderboards
            createLeaderboard(leaderboard_10, table_10, "highscore_10");
            createLeaderboard(leaderboard_20, table_20, "highscore_20");
            createLeaderboard(leaderboard_25, table_25, "highscore_25");
            createLeaderboard(leaderboard_50, table_50, "highscore_50");
            
        } else {
            // User is signed out
            loginContainer.style.display = "block";
            quizContainer.style.display = "none";
            logoutButton.style.display = "none";
            gameSetupDiv.style.display = 'block';
            quizDiv.style.display = 'none';
        }
      });

    // Navbar event listeners
    homeButton.addEventListener('click', () => {
        console.log("home   ");
        quizContainer.style.display = "block";
        leaderboardContainer.style.display = "none";
    });

    leaderboardButton.addEventListener('click', () => {
        quizContainer.style.display = "none";
        leaderboardContainer.style.display = "block";
    });

    function updateMenuHighScore() {
        menuHighScoreDisplay.innerText = `High Score: ${question_amount === "10" ? highScore_10 :
                                                    question_amount === "20" ? highScore_20 :
                                                    question_amount === "25" ? highScore_25 :
                                                    highScore_50}`;
    }
    
    // Leaderboard event listeners for search
    document.getElementById('search-10').addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const container = e.target.parentElement;
        const table = container.querySelector('table');
        const rows = table.getElementsByTagName('tr');
        let filteredRows_10 = [];
        for (let i = 0; i < rows.length; i++) {
            let username = rows[i].getElementsByTagName('td')[1];
            if (username) {
                let usernameValue = username.textContent || username.innerText;
                if (usernameValue.toLowerCase().indexOf(searchValue) > -1) {
                    filteredRows_10.push(rows[i]);
                    //rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }
        displayPage(table, 1, filteredRows_10);
    });
    document.getElementById('search-20').addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const container = e.target.parentElement;
        const table = container.querySelector('table');
        console.log(table)
        const rows = table.getElementsByTagName('tr');
        let filteredRows_20 = [];
        for (let i = 0; i < rows.length; i++) {
            let username = rows[i].getElementsByTagName('td')[1];
            if (username) {
                let usernameValue = username.textContent || username.innerText;
                if (usernameValue.toLowerCase().indexOf(searchValue) > -1) {
                    filteredRows_20.push(rows[i]);
                    //rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }
        displayPage(table, 1, filteredRows_20);
    });
    document.getElementById('search-25').addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const container = e.target.parentElement;
        const table = container.querySelector('table');
        const rows = table.getElementsByTagName('tr');
        let filteredRows_25 = [];
        for (let i = 0; i < rows.length; i++) {
            let username = rows[i].getElementsByTagName('td')[1];
            if (username) {
                let usernameValue = username.textContent || username.innerText;
                if (usernameValue.toLowerCase().indexOf(searchValue) > -1) {
                    filteredRows_25.push(rows[i]);
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }
        displayPage(table, 1, filteredRows_25);
    });
    document.getElementById('search-50').addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const container = e.target.parentElement;
        const table = container.querySelector('table');
        const rows = table.getElementsByTagName('tr');
        let filteredRows_50 = [];
        for (let i = 0; i < rows.length; i++) {
            let username = rows[i].getElementsByTagName('td')[1];
            if (username) {
                let usernameValue = username.textContent || username.innerText;
                if (usernameValue.toLowerCase().indexOf(searchValue) > -1) {
                    filteredRows_50.push(rows[i]);
                    //rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }
        displayPage(table, 1, filteredRows_50);
    });

    lb_10s_btn.addEventListener('click', () => {
        changeActive(lb_10s_btn);
        leaderboard_10_div.style.display = 'block';
        leaderboard_20_div.style.display = 'none';
        leaderboard_25_div.style.display = 'none';
        leaderboard_50_div.style.display = 'none';
    });
    lb_20s_btn.addEventListener('click', () => {
        changeActive(lb_20s_btn);
        leaderboard_10_div.style.display = 'none';
        leaderboard_20_div.style.display = 'block';
        leaderboard_25_div.style.display = 'none';
        leaderboard_50_div.style.display = 'none';
    });
    lb_25s_btn.addEventListener('click', () => {
        changeActive(lb_25s_btn);
        leaderboard_10_div.style.display = 'none';
        leaderboard_20_div.style.display = 'none';
        leaderboard_25_div.style.display = 'block';
        leaderboard_50_div.style.display = 'none';
    });
    lb_50s_btn.addEventListener('click', () => {
        changeActive(lb_50s_btn);
        leaderboard_10_div.style.display = 'none';
        leaderboard_20_div.style.display = 'none';
        leaderboard_25_div.style.display = 'none';
        leaderboard_50_div.style.display = 'block';
    });

    quitButton.addEventListener('click', () => {
        restart();
    });

    function changeActive (btn) {
        let buttons = document.querySelectorAll('#type button');
        for (let button of buttons) {
            button.classList.remove('active');
        }
        btn.classList.add('active');
    }

    // Game Functions Start Here
    function fetchCategories() {
        fetch('https://opentdb.com/api_category.php').then(response => response.json()).then(data => {
            data.trivia_categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        });
    }

    function startGame() {
        const category = categorySelect.value;
        const amount = amountInput.value;
        const difficulty = difficultySelect.value;
        fetchQuestions(amount, category, difficulty);
        question_amount = amount;
        highScoreDisplay.innerText = `High Score: ${question_amount === "10" ? highScore_10 :
                                                    question_amount === "20" ? highScore_20 :
                                                    question_amount === "25" ? highScore_25 :
                                                    highScore_50}`;
        currentScoreDisplay.innerText = `Current Score: 0`;
        gameSetupDiv.style.display = 'none';
        quizDiv.style.display = 'block';
    }

    function fetchQuestions(amount, category, difficulty) {
        let url = `https://opentdb.com/api.php?amount=${amount}`;
        if (category) url += `&category=${category}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        //url += `&type=multiple`;
        quitButton.style.display = '';

        fetch(url).then(response => response.json()).then(data => {
            currentQuestions = data.results;
            questionIndex = 0;
            score = 0;
            displayQuestion();
        }).catch(error => alert('Error:' + error));
    }

    function displayQuestion() {
        if (questionIndex < currentQuestions.length) {
            let currentQuestion = currentQuestions[questionIndex];
            questionContainer.innerHTML = decodeHTML(currentQuestion.question);
            displayAnswers(currentQuestion);
            updateProgress();
            questionStartTime = Date.now();
        } else {
            updateHighScore();
            showResults();
            quitButton.style.display = 'none';
        }
    }

    function displayAnswers(question) {
        answersContainer.innerHTML = '';
        const answers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(answers);

        answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerHTML = decodeHTML(answer);
            button.className = 'answer-btn';
            button.addEventListener('click', () => selectAnswer(button, question.correct_answer, answers));
            answersContainer.appendChild(button);
        });
    }

    function selectAnswer(selectedButton, correctAnswer, answers) {
        const timeTaken = (Date.now() - questionStartTime) / 1000;
        let scoreForThisQuestion = Math.max(baseScorePerQuestion - Math.floor(timeTaken) * penaltyPerSecond, 0);

        disableButtons();
        let correctButton;
        answers.forEach(answer => {
            if (decodeHTML(answer) === decodeHTML(correctAnswer)) {
                correctButton = [...answersContainer.childNodes].find(button => button.innerHTML === decodeHTML(correctAnswer));
            }
        });

        if (decodeHTML(selectedButton.innerHTML) === decodeHTML(correctAnswer)) {
            score += scoreForThisQuestion;
            selectedButton.classList.add('correct');
            resultContainer.innerText = `Correct! + ${scoreForThisQuestion} Points`;
        } else {
            selectedButton.classList.add('incorrect');
            correctButton.classList.add('correct');
            resultContainer.innerText = `Wrong! The correct answer was: ${decodeHTML(correctAnswer)}`;
        }

        updateCurrentScore();
        setTimeout(() => {
            questionIndex++;
            displayQuestion();
            resultContainer.innerText = '';
        }, 2000);
    }

    function updateCurrentScore() {
        currentScoreDisplay.innerText = `Current Score: ${score}`;
    }

    function disableButtons() {
        const buttons = answersContainer.getElementsByClassName('answer-btn');
        for (let button of buttons) {
            button.disabled = true;
        }
    }

    function showResults() {
        questionContainer.innerText = 'Quiz Finished!';
        answersContainer.innerHTML = '';
        resultContainer.innerText = `Your final score is ${score}`;
        updateHighScoreDisplay();
        progressContainer.innerText = '';
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Return to home';
        restartButton.addEventListener('click', () => {
            restart();
        });
        answersContainer.appendChild(restartButton);
    }

    function restart() {
        quizDiv.style.display = 'none';
        gameSetupDiv.style.display = 'block';
        fetchCategories();
        updateMenuHighScore();
    }

    function updateHighScore() {
        if (question_amount === "10") {
            if (score > highScore_10) {
                highScore_10 = score;
                db.collection("Users").doc(username).update({
                    highscore_10: highScore_10
                }).then(() => {
                    console.log("Document successfully written!");
                }).catch((error) => {
                    var errorMessage = error.message;
                    console.log("error:" + errorMessage);
                });
            }
        } 
        else if (question_amount === "20") {
            if (score > highScore_20) {
                highScore_20 = score;
                db.collection("Users").doc(username).update({
                    highscore_20: highScore_20
                }).then(() => {
                    console.log("Document successfully written!");
                }).catch((error) => {
                    var errorMessage = error.message;
                    console.log("error:" + errorMessage);
                });
            }
        } 
        else if (question_amount === "25") {
            if (score > highScore_25) {
                highScore_25 = score;
                db.collection("Users").doc(username).update({
                    highscore_25: highScore_25
                }).then(() => {
                    console.log("Document successfully written!");
                }).catch((error) => {
                    var errorMessage = error.message;
                    console.log("error:" + errorMessage);
                });
            }
        } 
        else if (question_amount === "50") {
            if (score > highScore_50) {
                highScore_50 = score;
                db.collection("Users").doc(username).update({
                    highscore_50: highScore_50
                }).then(() => {
                    console.log("Document successfully written!");
                }).catch((error) => {
                    var errorMessage = error.message;
                    console.log("error:" + errorMessage);
                });
            }
        }
    }

    function updateHighScoreDisplay() {
        highScoreDisplay.innerText = `High Score: ${question_amount === "10" ? highScore_10 : 
                                                    question_amount === "20" ? highScore_20 : 
                                                    question_amount === "25" ? highScore_25 : 
                                                    highScore_50}`;
        //highScoreDisplay.innerText = `High Score: ${highScore}`;
        console.log(question_amount);
        console.log(highScoreDisplay.innerText, highScore_10)
    }

    function updateProgress() {
        progressContainer.innerText = `Question ${questionIndex + 1}/${currentQuestions.length}`;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function decodeHTML(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    amountInput.addEventListener('change', () => {
        question_amount = amountInput.value;
        updateMenuHighScore();
    });

    startButton.addEventListener('click', startGame);

    fetchCategories();

    let leaderboard_rows = document.querySelectorAll('table tbody tr');

});