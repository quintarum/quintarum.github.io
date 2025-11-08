/**
 * Quiz system for testing comprehension of TDS concepts
 * Provides interactive quizzes with multiple choice questions,
 * answer validation, progress tracking, and certificate generation
 */

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'symmetry' | 'anomalies' | 'reversibility' | 'energy' | 'physics';
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
  passingScore: number;
}

interface QuizAttempt {
  quizId: string;
  answers: Map<string, number>;
  score: number;
  passed: boolean;
  timestamp: number;
  timeSpent: number;
}

interface QuizProgress {
  quizId: string;
  attempts: number;
  bestScore: number;
  completed: boolean;
  certificateEarned: boolean;
}

export class QuizSystem {
  private quizzes: Map<string, Quiz>;
  private currentQuiz: Quiz | null;
  private currentQuestionIndex: number;
  private answers: Map<string, number>;
  private startTime: number;
  
  // DOM elements
  private container: HTMLDivElement | null;
  private questionContainer: HTMLDivElement | null;
  private optionsContainer: HTMLDivElement | null;
  private feedbackContainer: HTMLDivElement | null;
  private progressContainer: HTMLDivElement | null;

  constructor() {
    this.quizzes = new Map();
    this.currentQuiz = null;
    this.currentQuestionIndex = 0;
    this.answers = new Map();
    this.startTime = 0;
    
    this.container = null;
    this.questionContainer = null;
    this.optionsContainer = null;
    this.feedbackContainer = null;
    this.progressContainer = null;
    
    this.initializeDOM();
    this.loadQuizDatabase();
  }

  /**
   * Initialize DOM elements for quiz interface
   */
  private initializeDOM(): void {
    this.container = document.createElement('div');
    this.container.className = 'quiz-container';
    this.container.style.display = 'none';
    this.container.innerHTML = `
      <div class="quiz-header">
        <h2 class="quiz-title"></h2>
        <p class="quiz-description"></p>
        <div class="quiz-progress"></div>
        <button class="quiz-close" title="Close Quiz">×</button>
      </div>
      <div class="quiz-content">
        <div class="quiz-question"></div>
        <div class="quiz-options"></div>
        <div class="quiz-feedback"></div>
      </div>
      <div class="quiz-navigation">
        <button class="quiz-btn quiz-prev" disabled>Previous</button>
        <button class="quiz-btn quiz-submit">Submit Answer</button>
        <button class="quiz-btn quiz-next" disabled>Next Question</button>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Cache DOM references
    this.questionContainer = this.container.querySelector('.quiz-question') as HTMLDivElement;
    this.optionsContainer = this.container.querySelector('.quiz-options') as HTMLDivElement;
    this.feedbackContainer = this.container.querySelector('.quiz-feedback') as HTMLDivElement;
    this.progressContainer = this.container.querySelector('.quiz-progress') as HTMLDivElement;
    
    // Bind event listeners
    const closeBtn = this.container.querySelector('.quiz-close');
    const prevBtn = this.container.querySelector('.quiz-prev');
    const submitBtn = this.container.querySelector('.quiz-submit');
    const nextBtn = this.container.querySelector('.quiz-next');
    
    closeBtn?.addEventListener('click', () => this.close());
    prevBtn?.addEventListener('click', () => this.previousQuestion());
    submitBtn?.addEventListener('click', () => this.submitAnswer());
    nextBtn?.addEventListener('click', () => this.nextQuestion());
  }

  /**
   * Load quiz question database
   */
  private loadQuizDatabase(): void {
    // Beginner Quiz: Symmetry Basics
    this.quizzes.set('symmetry-basics', {
      id: 'symmetry-basics',
      title: 'Symmetry Basics Quiz',
      description: 'Test your understanding of fundamental symmetry concepts in TDS',
      difficulty: 'beginner',
      passingScore: 70,
      questions: [
        {
          id: 'sym-q1',
          question: 'What is the fundamental property of nodes in the TDS lattice?',
          options: [
            'Temperature',
            'Symmetry state',
            'Mass',
            'Velocity'
          ],
          correctAnswer: 1,
          explanation: 'In TDS, symmetry state is the fundamental property. Each node can be symmetric, broken, or anomalous.',
          difficulty: 'beginner',
          category: 'symmetry'
        },
        {
          id: 'sym-q2',
          question: 'What does a higher symmetry strength parameter do?',
          options: [
            'Makes the lattice more chaotic',
            'Creates more anomalies',
            'Creates more stable, ordered patterns',
            'Speeds up the simulation'
          ],
          correctAnswer: 2,
          explanation: 'Higher symmetry strength makes nodes prefer symmetric states, leading to more stable and ordered patterns.',
          difficulty: 'beginner',
          category: 'symmetry'
        },
        {
          id: 'sym-q3',
          question: 'How do nodes interact in the TDS lattice?',
          options: [
            'They are completely independent',
            'They only interact with distant nodes',
            'They interact with their neighboring nodes',
            'They interact randomly'
          ],
          correctAnswer: 2,
          explanation: 'Nodes interact primarily with their immediate neighbors, creating local patterns that can propagate through the lattice.',
          difficulty: 'beginner',
          category: 'symmetry'
        },
        {
          id: 'sym-q4',
          question: 'What do the colors in the visualization represent?',
          options: [
            'Temperature of nodes',
            'Age of nodes',
            'Different symmetry states',
            'Random decoration'
          ],
          correctAnswer: 2,
          explanation: 'Colors represent different symmetry states: symmetric (balanced), broken (asymmetric), and anomaly (disrupted).',
          difficulty: 'beginner',
          category: 'symmetry'
        },
        {
          id: 'sym-q5',
          question: 'What is the symmetry ratio metric?',
          options: [
            'The speed of the simulation',
            'The percentage of nodes in symmetric state',
            'The total energy of the system',
            'The number of anomalies'
          ],
          correctAnswer: 1,
          explanation: 'The symmetry ratio shows what percentage of the lattice is in a symmetric state, indicating overall order.',
          difficulty: 'beginner',
          category: 'symmetry'
        }
      ]
    });

    // Intermediate Quiz: Anomaly Dynamics
    this.quizzes.set('anomaly-dynamics', {
      id: 'anomaly-dynamics',
      title: 'Anomaly Dynamics Quiz',
      description: 'Test your knowledge of anomaly formation and propagation',
      difficulty: 'intermediate',
      passingScore: 75,
      questions: [
        {
          id: 'anom-q1',
          question: 'What are anomalies in the TDS framework?',
          options: [
            'Errors in the simulation',
            'Local disruptions in symmetry that can propagate',
            'Random noise',
            'Visual effects only'
          ],
          correctAnswer: 1,
          explanation: 'Anomalies are local disruptions in symmetry that represent informational disturbances and can propagate through the lattice.',
          difficulty: 'intermediate',
          category: 'anomalies'
        },
        {
          id: 'anom-q2',
          question: 'How do anomalies propagate through the lattice?',
          options: [
            'They teleport randomly',
            'They spread to neighboring nodes in wave-like patterns',
            'They stay in one place',
            'They disappear immediately'
          ],
          correctAnswer: 1,
          explanation: 'Anomalies propagate to neighboring nodes in wave-like patterns, demonstrating reversible information flow.',
          difficulty: 'intermediate',
          category: 'anomalies'
        },
        {
          id: 'anom-q3',
          question: 'What does the anomaly probability parameter control?',
          options: [
            'The speed of anomaly propagation',
            'The color of anomalies',
            'The rate of spontaneous anomaly formation',
            'The size of anomalies'
          ],
          correctAnswer: 2,
          explanation: 'Anomaly probability controls how often spontaneous anomalies form, affecting system dynamics and chaos.',
          difficulty: 'intermediate',
          category: 'anomalies'
        },
        {
          id: 'anom-q4',
          question: 'How do anomalies affect energy distribution?',
          options: [
            'They have no effect on energy',
            'They create local energy variations',
            'They destroy energy',
            'They create infinite energy'
          ],
          correctAnswer: 1,
          explanation: 'Anomalies create local energy variations while maintaining overall energy conservation in the system.',
          difficulty: 'intermediate',
          category: 'anomalies'
        },
        {
          id: 'anom-q5',
          question: 'What visual effects indicate anomaly propagation?',
          options: [
            'Only color changes',
            'Ripples, halos, and particle trails',
            'Flashing lights',
            'No visual effects'
          ],
          correctAnswer: 1,
          explanation: 'Ripples, halos, and particle trails visualize anomaly propagation, making the dynamics easier to understand.',
          difficulty: 'intermediate',
          category: 'anomalies'
        }
      ]
    });

    // Advanced Quiz: Time Reversibility and Energy
    this.quizzes.set('reversibility-energy', {
      id: 'reversibility-energy',
      title: 'Time Reversibility & Energy Conservation Quiz',
      description: 'Advanced concepts in TDS dynamics',
      difficulty: 'advanced',
      passingScore: 80,
      questions: [
        {
          id: 'rev-q1',
          question: 'What does time reversibility mean in TDS?',
          options: [
            'The simulation can run faster',
            'You can recover exact previous states by running backward',
            'Time flows in circles',
            'The simulation remembers everything'
          ],
          correctAnswer: 1,
          explanation: 'Time reversibility means the dynamics are fully symmetric in time - running backward recovers exact previous states.',
          difficulty: 'advanced',
          category: 'reversibility'
        },
        {
          id: 'rev-q2',
          question: 'What is conserved in TDS dynamics?',
          options: [
            'The number of nodes',
            'The total energy',
            'The simulation speed',
            'The color scheme'
          ],
          correctAnswer: 1,
          explanation: 'Total energy is conserved in TDS, representing the conservation of information in the system.',
          difficulty: 'advanced',
          category: 'energy'
        },
        {
          id: 'rev-q3',
          question: 'Why is time reversibility important in TDS?',
          options: [
            'It makes the simulation look cool',
            'It ensures no information is lost',
            'It speeds up computation',
            'It is not important'
          ],
          correctAnswer: 1,
          explanation: 'Time reversibility ensures information conservation, a fundamental principle distinguishing TDS from many other models.',
          difficulty: 'advanced',
          category: 'reversibility'
        },
        {
          id: 'rev-q4',
          question: 'What drives the dynamics in TDS?',
          options: [
            'Random forces',
            'Energy gradients',
            'External fields',
            'User input'
          ],
          correctAnswer: 1,
          explanation: 'Energy gradients drive the dynamics, with nodes evolving toward lower energy configurations while maintaining reversibility.',
          difficulty: 'advanced',
          category: 'energy'
        },
        {
          id: 'rev-q5',
          question: 'How does TDS maintain energy conservation during anomaly propagation?',
          options: [
            'By destroying anomalies',
            'By redistributing energy without loss',
            'By adding external energy',
            'It does not conserve energy'
          ],
          correctAnswer: 1,
          explanation: 'Energy is redistributed among nodes during anomaly propagation, but the total energy remains constant.',
          difficulty: 'advanced',
          category: 'energy'
        }
      ]
    });

    // Physics Problems Quiz
    this.quizzes.set('physics-problems', {
      id: 'physics-problems',
      title: 'Physics Problems Quiz',
      description: 'Understanding how TDS addresses unsolved physics problems',
      difficulty: 'advanced',
      passingScore: 75,
      questions: [
        {
          id: 'phys-q1',
          question: 'Which of these is an unsolved problem that TDS attempts to address?',
          options: [
            'How to boil water',
            'Dark matter and dark energy',
            'How to build computers',
            'Weather prediction'
          ],
          correctAnswer: 1,
          explanation: 'TDS offers new perspectives on dark matter/energy through its framework of reversible dynamics and symmetry.',
          difficulty: 'advanced',
          category: 'physics'
        },
        {
          id: 'phys-q2',
          question: 'What is the matter-antimatter asymmetry problem?',
          options: [
            'Why matter and antimatter look different',
            'Why there is more matter than antimatter in the universe',
            'Why antimatter is expensive',
            'Why matter exists'
          ],
          correctAnswer: 1,
          explanation: 'The asymmetry problem asks why the universe contains much more matter than antimatter, despite their symmetric creation.',
          difficulty: 'advanced',
          category: 'physics'
        },
        {
          id: 'phys-q3',
          question: 'How does TDS approach the quantum measurement problem?',
          options: [
            'By ignoring quantum mechanics',
            'Through reversible informational dynamics',
            'By using classical physics only',
            'It does not address this problem'
          ],
          correctAnswer: 1,
          explanation: 'TDS addresses measurement through reversible informational dynamics, offering a new perspective on wave function collapse.',
          difficulty: 'advanced',
          category: 'physics'
        },
        {
          id: 'phys-q4',
          question: 'What is the black hole information paradox?',
          options: [
            'Black holes are too dark to see',
            'Information appears to be destroyed in black holes',
            'Black holes contain too much information',
            'We cannot measure black holes'
          ],
          correctAnswer: 1,
          explanation: 'The paradox arises because quantum mechanics forbids information destruction, but black holes seem to destroy it.',
          difficulty: 'advanced',
          category: 'physics'
        },
        {
          id: 'phys-q5',
          question: 'What advantage does TDS claim over the Standard Model?',
          options: [
            'It is simpler to calculate',
            'It provides a unified framework based on information and reversibility',
            'It requires less mathematics',
            'It is older and more established'
          ],
          correctAnswer: 1,
          explanation: 'TDS offers a unified informational framework with reversibility at its core, potentially explaining phenomena the Standard Model struggles with.',
          difficulty: 'advanced',
          category: 'physics'
        }
      ]
    });
  }

  /**
   * Start a quiz
   */
  startQuiz(quizId: string): void {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) {
      console.warn(`Quiz "${quizId}" not found`);
      return;
    }
    
    this.currentQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.answers = new Map();
    this.startTime = Date.now();
    
    if (this.container) {
      this.container.style.display = 'block';
      
      // Update header
      const titleEl = this.container.querySelector('.quiz-title');
      const descEl = this.container.querySelector('.quiz-description');
      if (titleEl) titleEl.textContent = quiz.title;
      if (descEl) descEl.textContent = quiz.description;
    }
    
    this.showQuestion(0);
  }

  /**
   * Close quiz
   */
  close(): void {
    if (this.currentQuiz && this.answers.size > 0) {
      if (!confirm('Are you sure you want to close? Your progress will be lost.')) {
        return;
      }
    }
    
    if (this.container) {
      this.container.style.display = 'none';
    }
    
    this.currentQuiz = null;
    this.currentQuestionIndex = 0;
    this.answers = new Map();
  }

  /**
   * Show a specific question
   */
  private showQuestion(index: number): void {
    if (!this.currentQuiz || index < 0 || index >= this.currentQuiz.questions.length) {
      return;
    }
    
    const question = this.currentQuiz.questions[index];
    this.currentQuestionIndex = index;
    
    // Update question text
    if (this.questionContainer) {
      this.questionContainer.innerHTML = `
        <div class="question-number">Question ${index + 1} of ${this.currentQuiz.questions.length}</div>
        <div class="question-text">${question.question}</div>
        <div class="question-meta">
          <span class="difficulty-badge difficulty-${question.difficulty}">${question.difficulty}</span>
          <span class="category-badge">${question.category}</span>
        </div>
      `;
    }
    
    // Update options
    if (this.optionsContainer) {
      this.optionsContainer.innerHTML = '';
      question.options.forEach((option, i) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'quiz-option';
        optionEl.innerHTML = `
          <input type="radio" name="answer" id="option-${i}" value="${i}">
          <label for="option-${i}">${option}</label>
        `;
        this.optionsContainer?.appendChild(optionEl);
        
        // Pre-select if already answered
        const savedAnswer = this.answers.get(question.id);
        if (savedAnswer === i) {
          const radio = optionEl.querySelector('input') as HTMLInputElement;
          if (radio) radio.checked = true;
        }
      });
    }
    
    // Clear feedback
    if (this.feedbackContainer) {
      this.feedbackContainer.innerHTML = '';
      this.feedbackContainer.style.display = 'none';
    }
    
    // Update progress
    this.updateProgress();
    
    // Update navigation buttons
    this.updateNavigationButtons();
  }

  /**
   * Submit answer for current question
   */
  private submitAnswer(): void {
    if (!this.currentQuiz) return;
    
    const question = this.currentQuiz.questions[this.currentQuestionIndex];
    const selectedOption = this.container?.querySelector('input[name="answer"]:checked') as HTMLInputElement;
    
    if (!selectedOption) {
      this.showFeedback('Please select an answer', 'warning');
      return;
    }
    
    const selectedAnswer = parseInt(selectedOption.value);
    this.answers.set(question.id, selectedAnswer);
    
    // Validate answer
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Show feedback
    if (isCorrect) {
      this.showFeedback(
        `<strong>Correct!</strong> ${question.explanation}`,
        'success'
      );
    } else {
      this.showFeedback(
        `<strong>Incorrect.</strong> The correct answer is: "${question.options[question.correctAnswer]}". ${question.explanation}`,
        'error'
      );
    }
    
    // Disable options after submission
    const options = this.container?.querySelectorAll('input[name="answer"]');
    options?.forEach(opt => {
      (opt as HTMLInputElement).disabled = true;
    });
    
    // Update navigation
    this.updateNavigationButtons();
  }

  /**
   * Show feedback message
   */
  private showFeedback(message: string, type: 'success' | 'error' | 'warning'): void {
    if (!this.feedbackContainer) return;
    
    this.feedbackContainer.innerHTML = `
      <div class="feedback-message feedback-${type}">
        ${message}
      </div>
    `;
    this.feedbackContainer.style.display = 'block';
  }

  /**
   * Move to next question
   */
  private nextQuestion(): void {
    if (!this.currentQuiz) return;
    
    if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
      this.showQuestion(this.currentQuestionIndex + 1);
    } else {
      this.finishQuiz();
    }
  }

  /**
   * Move to previous question
   */
  private previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.showQuestion(this.currentQuestionIndex - 1);
    }
  }

  /**
   * Update navigation buttons state
   */
  private updateNavigationButtons(): void {
    if (!this.container || !this.currentQuiz) return;
    
    const prevBtn = this.container.querySelector('.quiz-prev') as HTMLButtonElement;
    const submitBtn = this.container.querySelector('.quiz-submit') as HTMLButtonElement;
    const nextBtn = this.container.querySelector('.quiz-next') as HTMLButtonElement;
    
    const question = this.currentQuiz.questions[this.currentQuestionIndex];
    const hasAnswer = this.answers.has(question.id);
    
    // Previous button
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestionIndex === 0;
    }
    
    // Submit button
    if (submitBtn) {
      submitBtn.disabled = hasAnswer;
      submitBtn.style.display = hasAnswer ? 'none' : 'inline-block';
    }
    
    // Next button
    if (nextBtn) {
      nextBtn.disabled = !hasAnswer;
      nextBtn.style.display = hasAnswer ? 'inline-block' : 'none';
      
      const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
      nextBtn.textContent = isLastQuestion ? 'Finish Quiz' : 'Next Question';
    }
  }

  /**
   * Update progress indicator
   */
  private updateProgress(): void {
    if (!this.progressContainer || !this.currentQuiz) return;
    
    const totalQuestions = this.currentQuiz.questions.length;
    const answeredQuestions = this.answers.size;
    const progressPercent = (answeredQuestions / totalQuestions) * 100;
    
    this.progressContainer.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progressPercent}%"></div>
      </div>
      <div class="progress-text">
        ${answeredQuestions} of ${totalQuestions} questions answered
      </div>
    `;
  }

  /**
   * Finish quiz and show results
   */
  private finishQuiz(): void {
    if (!this.currentQuiz || !this.container) return;
    
    // Calculate score
    let correctAnswers = 0;
    this.currentQuiz.questions.forEach(question => {
      const userAnswer = this.answers.get(question.id);
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const totalQuestions = this.currentQuiz.questions.length;
    const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = scorePercent >= this.currentQuiz.passingScore;
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
    
    // Save attempt
    const attempt: QuizAttempt = {
      quizId: this.currentQuiz.id,
      answers: this.answers,
      score: scorePercent,
      passed,
      timestamp: Date.now(),
      timeSpent
    };
    this.saveAttempt(attempt);
    
    // Update progress
    this.updateQuizProgress(this.currentQuiz.id, scorePercent, passed);
    
    // Show results
    this.showResults(correctAnswers, totalQuestions, scorePercent, passed, timeSpent);
  }

  /**
   * Show quiz results
   */
  private showResults(correct: number, total: number, scorePercent: number, passed: boolean, timeSpent: number): void {
    if (!this.container || !this.currentQuiz) return;
    
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    
    const resultClass = passed ? 'result-pass' : 'result-fail';
    const resultMessage = passed 
      ? '🎉 Congratulations! You passed!' 
      : '📚 Keep learning and try again!';
    
    this.container.innerHTML = `
      <div class="quiz-results ${resultClass}">
        <div class="results-header">
          <h2>${this.currentQuiz.title}</h2>
          <div class="result-message">${resultMessage}</div>
        </div>
        <div class="results-stats">
          <div class="stat-item">
            <div class="stat-label">Score</div>
            <div class="stat-value">${scorePercent}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Correct Answers</div>
            <div class="stat-value">${correct} / ${total}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Time Spent</div>
            <div class="stat-value">${timeString}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Passing Score</div>
            <div class="stat-value">${this.currentQuiz.passingScore}%</div>
          </div>
        </div>
        <div class="results-actions">
          ${passed ? `
            <button class="quiz-btn quiz-btn-primary" id="generate-certificate">
              📜 Generate Certificate
            </button>
          ` : ''}
          <button class="quiz-btn" id="review-answers">Review Answers</button>
          <button class="quiz-btn" id="retake-quiz">Retake Quiz</button>
          <button class="quiz-btn" id="close-results">Close</button>
        </div>
      </div>
    `;
    
    // Bind result action buttons
    const certBtn = this.container.querySelector('#generate-certificate');
    const reviewBtn = this.container.querySelector('#review-answers');
    const retakeBtn = this.container.querySelector('#retake-quiz');
    const closeBtn = this.container.querySelector('#close-results');
    
    certBtn?.addEventListener('click', () => this.generateCertificate(scorePercent));
    reviewBtn?.addEventListener('click', () => this.reviewAnswers());
    retakeBtn?.addEventListener('click', () => {
      if (this.currentQuiz) {
        this.startQuiz(this.currentQuiz.id);
      }
    });
    closeBtn?.addEventListener('click', () => this.close());
  }

  /**
   * Review answers after completing quiz
   */
  private reviewAnswers(): void {
    if (!this.container || !this.currentQuiz) return;
    
    let reviewHTML = `
      <div class="quiz-review">
        <div class="review-header">
          <h2>Review Your Answers</h2>
          <button class="quiz-close" id="close-review">×</button>
        </div>
        <div class="review-content">
    `;
    
    this.currentQuiz.questions.forEach((question, index) => {
      const userAnswer = this.answers.get(question.id);
      const isCorrect = userAnswer === question.correctAnswer;
      const statusClass = isCorrect ? 'correct' : 'incorrect';
      const statusIcon = isCorrect ? '✓' : '✗';
      
      reviewHTML += `
        <div class="review-question ${statusClass}">
          <div class="review-question-header">
            <span class="review-status">${statusIcon}</span>
            <span class="review-number">Question ${index + 1}</span>
          </div>
          <div class="review-question-text">${question.question}</div>
          <div class="review-options">
            ${question.options.map((option, i) => {
              let optionClass = '';
              if (i === question.correctAnswer) optionClass = 'correct-answer';
              if (i === userAnswer && !isCorrect) optionClass = 'wrong-answer';
              if (i === userAnswer && isCorrect) optionClass = 'user-correct';
              
              return `<div class="review-option ${optionClass}">${option}</div>`;
            }).join('')}
          </div>
          <div class="review-explanation">
            <strong>Explanation:</strong> ${question.explanation}
          </div>
        </div>
      `;
    });
    
    reviewHTML += `
        </div>
        <div class="review-actions">
          <button class="quiz-btn" id="back-to-results">Back to Results</button>
        </div>
      </div>
    `;
    
    this.container.innerHTML = reviewHTML;
    
    // Bind buttons
    const closeBtn = this.container.querySelector('#close-review');
    const backBtn = this.container.querySelector('#back-to-results');
    
    closeBtn?.addEventListener('click', () => this.close());
    backBtn?.addEventListener('click', () => {
      // Recalculate and show results again
      if (this.currentQuiz) {
        let correctAnswers = 0;
        this.currentQuiz.questions.forEach(question => {
          const userAnswer = this.answers.get(question.id);
          if (userAnswer === question.correctAnswer) {
            correctAnswers++;
          }
        });
        const totalQuestions = this.currentQuiz.questions.length;
        const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = scorePercent >= this.currentQuiz.passingScore;
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        
        this.showResults(correctAnswers, totalQuestions, scorePercent, passed, timeSpent);
      }
    });
  }

  /**
   * Generate certificate for passing quiz
   */
  private generateCertificate(score: number): void {
    if (!this.currentQuiz) return;
    
    const userName = window.prompt('Enter your name for the certificate:') || 'Student';
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Create certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>TDS Quiz Certificate</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            background: white;
            width: 800px;
            padding: 60px;
            border: 20px solid #667eea;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          .certificate-header {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .certificate-title {
            font-size: 32px;
            color: #333;
            margin-bottom: 40px;
          }
          .certificate-body {
            font-size: 18px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 40px;
          }
          .recipient-name {
            font-size: 36px;
            color: #667eea;
            font-weight: bold;
            margin: 30px 0;
            border-bottom: 2px solid #667eea;
            display: inline-block;
            padding-bottom: 10px;
          }
          .quiz-details {
            font-size: 20px;
            color: #333;
            margin: 30px 0;
          }
          .score {
            font-size: 28px;
            color: #764ba2;
            font-weight: bold;
          }
          .certificate-footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
            font-size: 14px;
            color: #777;
          }
          .signature-line {
            border-top: 2px solid #333;
            padding-top: 10px;
            width: 200px;
          }
          .seal {
            font-size: 64px;
            color: #667eea;
            margin: 20px 0;
          }
          @media print {
            body { background: white; }
            .certificate { border: 10px solid #667eea; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="seal">🏆</div>
          <div class="certificate-header">Certificate of Achievement</div>
          <div class="certificate-title">Theory of Dynamic Symmetry</div>
          <div class="certificate-body">
            This is to certify that
          </div>
          <div class="recipient-name">${userName}</div>
          <div class="certificate-body">
            has successfully completed the
          </div>
          <div class="quiz-details">
            <strong>${this.currentQuiz.title}</strong>
            <br>
            with a score of <span class="score">${score}%</span>
          </div>
          <div class="certificate-body">
            Demonstrating comprehensive understanding of ${this.currentQuiz.difficulty} level concepts
            <br>
            in the Theory of Dynamic Symmetry
          </div>
          <div class="certificate-footer">
            <div>
              <div class="signature-line">Date</div>
              <div>${date}</div>
            </div>
            <div>
              <div class="signature-line">TDS Web Simulation</div>
              <div>Educational Platform</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    // Open certificate in new window
    const certWindow = window.open('', '_blank');
    if (certWindow) {
      certWindow.document.write(certificateHTML);
      certWindow.document.close();
      
      // Mark certificate as earned
      this.markCertificateEarned(this.currentQuiz.id);
    } else {
      alert('Please allow pop-ups to generate your certificate.');
    }
  }

  /**
   * Save quiz attempt to localStorage
   */
  private saveAttempt(attempt: QuizAttempt): void {
    try {
      const key = `tds_quiz_attempts_${attempt.quizId}`;
      const stored = localStorage.getItem(key);
      const attempts: any[] = stored ? JSON.parse(stored) : [];
      
      // Convert Map to array for storage
      const attemptToStore = {
        quizId: attempt.quizId,
        answers: Array.from(attempt.answers.entries()),
        score: attempt.score,
        passed: attempt.passed,
        timestamp: attempt.timestamp,
        timeSpent: attempt.timeSpent
      };
      
      attempts.push(attemptToStore);
      
      // Keep only last 10 attempts
      if (attempts.length > 10) {
        attempts.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Could not save quiz attempt:', e);
    }
  }

  /**
   * Update quiz progress
   */
  private updateQuizProgress(quizId: string, score: number, passed: boolean): void {
    try {
      const key = 'tds_quiz_progress';
      const stored = localStorage.getItem(key);
      const allProgress: Record<string, QuizProgress> = stored ? JSON.parse(stored) : {};
      
      const current = allProgress[quizId] || {
        quizId,
        attempts: 0,
        bestScore: 0,
        completed: false,
        certificateEarned: false
      };
      
      current.attempts++;
      current.bestScore = Math.max(current.bestScore, score);
      if (passed) {
        current.completed = true;
      }
      
      allProgress[quizId] = current;
      localStorage.setItem(key, JSON.stringify(allProgress));
    } catch (e) {
      console.warn('Could not update quiz progress:', e);
    }
  }

  /**
   * Mark certificate as earned
   */
  private markCertificateEarned(quizId: string): void {
    try {
      const key = 'tds_quiz_progress';
      const stored = localStorage.getItem(key);
      const allProgress: Record<string, QuizProgress> = stored ? JSON.parse(stored) : {};
      
      if (allProgress[quizId]) {
        allProgress[quizId].certificateEarned = true;
        localStorage.setItem(key, JSON.stringify(allProgress));
      }
    } catch (e) {
      console.warn('Could not mark certificate as earned:', e);
    }
  }

  /**
   * Get quiz progress
   */
  getProgress(quizId: string): QuizProgress | null {
    try {
      const key = 'tds_quiz_progress';
      const stored = localStorage.getItem(key);
      if (stored) {
        const allProgress: Record<string, QuizProgress> = JSON.parse(stored);
        return allProgress[quizId] || null;
      }
    } catch (e) {
      console.warn('Could not load quiz progress:', e);
    }
    return null;
  }

  /**
   * Get all quiz attempts for a quiz
   */
  getAttempts(quizId: string): QuizAttempt[] {
    try {
      const key = `tds_quiz_attempts_${quizId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const attempts = JSON.parse(stored);
        // Convert arrays back to Maps
        return attempts.map((a: any) => ({
          ...a,
          answers: new Map(a.answers)
        }));
      }
    } catch (e) {
      console.warn('Could not load quiz attempts:', e);
    }
    return [];
  }

  /**
   * Get all available quizzes
   */
  getAvailableQuizzes(): Quiz[] {
    return Array.from(this.quizzes.values());
  }

  /**
   * Get quizzes by difficulty
   */
  getQuizzesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Quiz[] {
    return this.getAvailableQuizzes().filter(quiz => quiz.difficulty === difficulty);
  }

  /**
   * Get overall statistics
   */
  getOverallStatistics(): {
    totalQuizzes: number;
    completedQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    certificatesEarned: number;
  } {
    const quizzes = this.getAvailableQuizzes();
    let completedCount = 0;
    let totalAttempts = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let certificatesCount = 0;
    
    quizzes.forEach(quiz => {
      const progress = this.getProgress(quiz.id);
      if (progress) {
        if (progress.completed) completedCount++;
        totalAttempts += progress.attempts;
        if (progress.bestScore > 0) {
          totalScore += progress.bestScore;
          scoreCount++;
        }
        if (progress.certificateEarned) certificatesCount++;
      }
    });
    
    return {
      totalQuizzes: quizzes.length,
      completedQuizzes: completedCount,
      totalAttempts,
      averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      certificatesEarned: certificatesCount
    };
  }
}
