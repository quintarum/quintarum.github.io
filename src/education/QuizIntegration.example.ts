/**
 * Example integration of Quiz system into the main application
 * This file demonstrates how to integrate the quiz system with the UI
 */

import { QuizSystem } from './Quiz.js';

/**
 * Initialize and integrate quiz system
 */
export function initializeQuizSystem(): QuizSystem {
  const quizSystem = new QuizSystem();
  
  // Create quiz menu in the UI
  createQuizMenu(quizSystem);
  
  // Add quiz button to info panel or education section
  addQuizButton(quizSystem);
  
  return quizSystem;
}

/**
 * Create quiz selection menu
 */
function createQuizMenu(quizSystem: QuizSystem): void {
  const menuContainer = document.createElement('div');
  menuContainer.className = 'quiz-menu';
  menuContainer.innerHTML = `
    <div class="quiz-menu-header">
      <h3>📚 Test Your Knowledge</h3>
      <p>Take quizzes to test your understanding of TDS concepts</p>
    </div>
    <div class="quiz-menu-stats"></div>
    <div class="quiz-menu-list"></div>
  `;
  
  // Add to info panel or create separate section
  const infoPanel = document.querySelector('.info-panel-content');
  if (infoPanel) {
    infoPanel.appendChild(menuContainer);
  }
  
  // Populate quiz list
  updateQuizMenu(quizSystem, menuContainer);
}

/**
 * Update quiz menu with available quizzes and progress
 */
function updateQuizMenu(quizSystem: QuizSystem, container: HTMLElement): void {
  const statsContainer = container.querySelector('.quiz-menu-stats');
  const listContainer = container.querySelector('.quiz-menu-list');
  
  if (!statsContainer || !listContainer) return;
  
  // Show overall statistics
  const stats = quizSystem.getOverallStatistics();
  statsContainer.innerHTML = `
    <div class="quiz-stats-grid">
      <div class="quiz-stat">
        <div class="stat-value">${stats.completedQuizzes}/${stats.totalQuizzes}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="quiz-stat">
        <div class="stat-value">${stats.averageScore}%</div>
        <div class="stat-label">Avg Score</div>
      </div>
      <div class="quiz-stat">
        <div class="stat-value">${stats.certificatesEarned}</div>
        <div class="stat-label">Certificates</div>
      </div>
    </div>
  `;
  
  // Group quizzes by difficulty
  const beginnerQuizzes = quizSystem.getQuizzesByDifficulty('beginner');
  const intermediateQuizzes = quizSystem.getQuizzesByDifficulty('intermediate');
  const advancedQuizzes = quizSystem.getQuizzesByDifficulty('advanced');
  
  listContainer.innerHTML = `
    ${createQuizSection('Beginner', beginnerQuizzes, quizSystem)}
    ${createQuizSection('Intermediate', intermediateQuizzes, quizSystem)}
    ${createQuizSection('Advanced', advancedQuizzes, quizSystem)}
  `;
  
  // Bind click handlers
  listContainer.querySelectorAll('.quiz-item-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const quizId = (e.target as HTMLElement).dataset.quizId;
      if (quizId) {
        quizSystem.startQuiz(quizId);
      }
    });
  });
}

/**
 * Create quiz section HTML
 */
function createQuizSection(
  difficulty: string,
  quizzes: any[],
  quizSystem: QuizSystem
): string {
  if (quizzes.length === 0) return '';
  
  const quizItems = quizzes.map(quiz => {
    const progress = quizSystem.getProgress(quiz.id);
    const completed = progress?.completed ? '✓' : '';
    const bestScore = progress?.bestScore || 0;
    const attempts = progress?.attempts || 0;
    
    return `
      <div class="quiz-item ${progress?.completed ? 'completed' : ''}">
        <div class="quiz-item-header">
          <h4>${quiz.title} ${completed}</h4>
          <span class="quiz-difficulty">${quiz.difficulty}</span>
        </div>
        <p class="quiz-item-description">${quiz.description}</p>
        <div class="quiz-item-meta">
          <span>${quiz.questions.length} questions</span>
          <span>Passing: ${quiz.passingScore}%</span>
          ${progress ? `<span>Best: ${bestScore}%</span>` : ''}
          ${attempts > 0 ? `<span>${attempts} attempts</span>` : ''}
        </div>
        <button class="quiz-item-button" data-quiz-id="${quiz.id}">
          ${progress?.completed ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      </div>
    `;
  }).join('');
  
  return `
    <div class="quiz-section">
      <h3 class="quiz-section-title">${difficulty}</h3>
      <div class="quiz-section-items">
        ${quizItems}
      </div>
    </div>
  `;
}

/**
 * Add quiz button to main UI
 */
function addQuizButton(quizSystem: QuizSystem): void {
  // Add to info panel tabs or create separate button
  const tabsContainer = document.querySelector('.info-panel-tabs');
  if (tabsContainer) {
    const quizTab = document.createElement('button');
    quizTab.className = 'info-tab';
    quizTab.textContent = '📚 Quizzes';
    quizTab.addEventListener('click', () => {
      // Show quiz menu
      const quizMenu = document.querySelector('.quiz-menu');
      if (quizMenu) {
        (quizMenu as HTMLElement).style.display = 'block';
      }
    });
    tabsContainer.appendChild(quizTab);
  }
  
  // Or add to education section
  const educationSection = document.querySelector('.education-section');
  if (educationSection) {
    const quizButton = document.createElement('button');
    quizButton.className = 'education-button quiz-button';
    quizButton.innerHTML = `
      <span class="button-icon">📚</span>
      <span class="button-text">Take a Quiz</span>
    `;
    quizButton.addEventListener('click', () => {
      // Show quiz selection or start default quiz
      const beginnerQuizzes = quizSystem.getQuizzesByDifficulty('beginner');
      if (beginnerQuizzes.length > 0) {
        quizSystem.startQuiz(beginnerQuizzes[0].id);
      }
    });
    educationSection.appendChild(quizButton);
  }
}

/**
 * Add quiz shortcuts to keyboard handler
 */
export function addQuizKeyboardShortcuts(
  quizSystem: QuizSystem,
  keyboardHandler: any
): void {
  // Q key to open quiz menu
  keyboardHandler.register('q', () => {
    const quizMenu = document.querySelector('.quiz-menu');
    if (quizMenu) {
      (quizMenu as HTMLElement).style.display = 'block';
    }
  }, 'Open quiz menu');
  
  // Shift+Q to start beginner quiz
  keyboardHandler.register('shift+q', () => {
    const beginnerQuizzes = quizSystem.getQuizzesByDifficulty('beginner');
    if (beginnerQuizzes.length > 0) {
      quizSystem.startQuiz(beginnerQuizzes[0].id);
    }
  }, 'Start beginner quiz');
}

/**
 * Show quiz completion notification
 */
export function showQuizCompletionNotification(
  quizTitle: string,
  score: number,
  passed: boolean
): void {
  const notification = document.createElement('div');
  notification.className = `quiz-notification ${passed ? 'success' : 'info'}`;
  notification.innerHTML = `
    <div class="notification-icon">${passed ? '🎉' : '📚'}</div>
    <div class="notification-content">
      <div class="notification-title">${quizTitle}</div>
      <div class="notification-message">
        ${passed ? `Congratulations! You scored ${score}%` : `You scored ${score}%. Keep learning!`}
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

/**
 * Example: Add quiz recommendations based on user activity
 */
export function recommendQuiz(quizSystem: QuizSystem, userActivity: any): string | null {
  // If user has been exploring symmetry features, recommend symmetry quiz
  if (userActivity.symmetryInteractions > 10) {
    const progress = quizSystem.getProgress('symmetry-basics');
    if (!progress?.completed) {
      return 'symmetry-basics';
    }
  }
  
  // If user has been creating anomalies, recommend anomaly quiz
  if (userActivity.anomaliesCreated > 5) {
    const progress = quizSystem.getProgress('anomaly-dynamics');
    if (!progress?.completed) {
      return 'anomaly-dynamics';
    }
  }
  
  // If user has been using time controls, recommend reversibility quiz
  if (userActivity.timeControlUsage > 10) {
    const progress = quizSystem.getProgress('reversibility-energy');
    if (!progress?.completed) {
      return 'reversibility-energy';
    }
  }
  
  return null;
}
