class SinJimGame {
    constructor() {
        this.team1Name = '';
        this.team2Name = '';
        this.selectedCategories = [];
        this.currentTeam = 1;
        this.team1Score = 0;
        this.team2Score = 0;
        this.usedQuestions = new Set();
        
        this.availableCategories = [
            { name: 'التاريخ', icon: '🏛️', emoji: '🏺' },
            { name: 'الجغرافيا', icon: '🌍', emoji: '🗺️' },
            { name: 'العلوم', icon: '🔬', emoji: '⚗️' },
            { name: 'الرياضة', icon: '⚽', emoji: '🏆' },
            { name: 'الأدب', icon: '📚', emoji: '✍️' },
            { name: 'السينما', icon: '🎬', emoji: '🎭' },
            { name: 'التكنولوجيا', icon: '💻', emoji: '🤖' },
            { name: 'الطبخ', icon: '🍳', emoji: '👨‍🍳' },
            { name: 'الفن', icon: '🎨', emoji: '🖌️' },
            { name: 'الموسيقى', icon: '🎵', emoji: '🎼' },
            { name: 'الطبيعة', icon: '🌿', emoji: '🌳' },
            { name: 'الاختراعات', icon: '💡', emoji: '⚙️' },
            { name: 'الدين', icon: '🕌', emoji: '☪️' },
            { name: 'الاقتصاد', icon: '💰', emoji: '📈' },
            { name: 'الصحة', icon: '🏥', emoji: '⚕️' },
            { name: 'السياسة', icon: '🏛️', emoji: '🗳️' }
        ];
        
        // Use the questions data from the separate data.js file
        this.questions = questionsData;
        
        this.init();
    }
    
    init() {
        this.createCategorySelection();
        this.bindEvents();
    }
    
    createCategorySelection() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';
        
        this.availableCategories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.category = category.name;
            card.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
            `;
            card.addEventListener('click', () => this.toggleCategory(card, category));
            grid.appendChild(card);
        });
    }
    
    bindEvents() {
        // Team names inputs
        const team1Input = document.getElementById('team1Name');
        const team2Input = document.getElementById('team2Name');
        const continueBtn = document.getElementById('continueToCategories');
        
        [team1Input, team2Input].forEach(input => {
            input.addEventListener('input', () => {
                continueBtn.disabled = !team1Input.value.trim() || !team2Input.value.trim();
            });
        });
        
        continueBtn.addEventListener('click', () => this.proceedToCategories());
        
        // Game buttons
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('showAnswerBtn').addEventListener('click', () => this.showAnswer());
        document.getElementById('team1AnswerBtn').addEventListener('click', () => this.teamAnswered(1));
        document.getElementById('team2AnswerBtn').addEventListener('click', () => this.teamAnswered(2));
        document.getElementById('noAnswerBtn').addEventListener('click', () => this.noAnswer());
        document.getElementById('closeBtn').addEventListener('click', () => this.closeModal());
    }
    
    proceedToCategories() {
        this.team1Name = document.getElementById('team1Name').value.trim();
        this.team2Name = document.getElementById('team2Name').value.trim();
        
        document.getElementById('teamNamesScreen').style.display = 'none';
        document.getElementById('categorySelection').style.display = 'block';
    }
    
    toggleCategory(card, category) {
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            this.selectedCategories = this.selectedCategories.filter(c => c.name !== category.name);
        } else if (this.selectedCategories.length < 6) {
            card.classList.add('selected');
            this.selectedCategories.push(category);
        }
        
        document.getElementById('startGameBtn').disabled = this.selectedCategories.length !== 6;
    }
    
    startGame() {
        document.getElementById('categorySelection').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'block';
        document.getElementById('currentTeamIndicator').style.display = 'block';
        
        // Update team names in display
        document.getElementById('team1DisplayName').textContent = this.team1Name;
        document.getElementById('team2DisplayName').textContent = this.team2Name;
        document.getElementById('team1AnswerBtn').textContent = this.team1Name;
        document.getElementById('team2AnswerBtn').textContent = this.team2Name;
        
        this.createGameBoard();
        this.updateCurrentTeamIndicator();
    }
    
    createGameBoard() {
        const container = document.getElementById('boardContainer');
        container.innerHTML = '';
        
        this.selectedCategories.forEach(category => {
            const section = document.createElement('div');
            section.className = 'category-section';
            
            section.innerHTML = `
                <div class="points-column-left">
                    <div class="point-card" data-category="${category.name}" data-points="200" data-side="left">200</div>
                    <div class="point-card" data-category="${category.name}" data-points="400" data-side="left">400</div>
                    <div class="point-card" data-category="${category.name}" data-points="600" data-side="left">600</div>
                </div>
                <div class="category-center">
                    <div class="category-header">${category.name}</div>
                    <div class="category-emoji emoji-${category.name}">${category.emoji}</div>
                </div>
                <div class="points-column-right">
                    <div class="point-card" data-category="${category.name}" data-points="200" data-side="right">200</div>
                    <div class="point-card" data-category="${category.name}" data-points="400" data-side="right">400</div>
                    <div class="point-card" data-category="${category.name}" data-points="600" data-side="right">600</div>
                </div>
            `;
            
            container.appendChild(section);
        });
        
        // Bind click events to point cards
        document.querySelectorAll('.point-card').forEach(card => {
            card.addEventListener('click', () => this.showQuestion(card));
        });
    }
    
    showQuestion(card) {
        if (card.classList.contains('used')) return;
        
        const category = card.dataset.category;
        const points = parseInt(card.dataset.points);
        const side = card.dataset.side;
        
        // Find an unused question for this category and points
        const availableQuestions = this.questions[category][points];
        const questionKey = `${category}-${points}`;
        
        let questionIndex = 0;
        for (let i = 0; i < availableQuestions.length; i++) {
            const specificKey = `${questionKey}-${side}-${i}`;
            if (!this.usedQuestions.has(specificKey)) {
                questionIndex = i;
                this.usedQuestions.add(specificKey);
                break;
            }
        }
        
        const question = availableQuestions[questionIndex];
        
        document.getElementById('questionPoints').textContent = `${points} نقطة`;
        document.getElementById('questionText').textContent = question.q;
        document.getElementById('answerText').textContent = `الإجابة: ${question.a}`;
        
        // Reset modal state
        document.getElementById('initialButtons').style.display = 'flex';
        document.getElementById('answerSection').style.display = 'none';
        document.querySelector('.team-selection').style.display = 'none';
        
        this.currentQuestion = { category, points, card, question };
        document.getElementById('questionModal').style.display = 'block';
    }
    
    showAnswer() {
        document.getElementById('initialButtons').style.display = 'none';
        document.getElementById('answerSection').style.display = 'block';
        document.querySelector('.team-selection').style.display = 'block';
    }
    
    teamAnswered(teamNumber) {
        this.updateScore(teamNumber, this.currentQuestion.points);
        this.completeQuestion();
        this.closeModal();
    }
    
    noAnswer() {
        this.completeQuestion();
        this.closeModal();
    }
    
    completeQuestion() {
        this.currentQuestion.card.classList.add('used');
    }
    
    updateScore(team, points) {
        if (team === 1) {
            this.team1Score += points;
        } else {
            this.team2Score += points;
        }
        this.updateScoreDisplay();
    }
    
    updateScoreDisplay() {
        document.getElementById('team1Score').textContent = this.team1Score;
        document.getElementById('team2Score').textContent = this.team2Score;
    }
    
    switchTeam() {
        this.currentTeam = this.currentTeam === 1 ? 2 : 1;
        this.updateCurrentTeamIndicator();
        this.updateActiveTeam();
    }
    
    updateCurrentTeamIndicator() {
        const indicator = document.getElementById('currentTeamIndicator');
        indicator.textContent = `دور ${this.currentTeam === 1 ? this.team1Name : this.team2Name}`;
    }
    
    updateActiveTeam() {
        document.querySelectorAll('.team').forEach(team => team.classList.remove('active'));
        document.getElementById(`team${this.currentTeam}`).classList.add('active');
    }
    
    closeModal() {
        document.getElementById('questionModal').style.display = 'none';
        this.switchTeam();
    }
}

// Initialize game after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new SinJimGame();
});