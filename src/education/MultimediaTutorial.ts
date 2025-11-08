/**
 * Multimedia Tutorial System
 * Supports text, video, and animated demonstrations for educational content
 */

interface TutorialContent {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'video' | 'interactive' | 'animated';
  content: string | AnimatedDemo;
  duration?: number;
  prerequisites?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface AnimatedDemo {
  frames: Array<{
    description: string;
    parameters: Record<string, unknown>;
    duration: number;
  }>;
  loop: boolean;
}

interface VideoTutorial {
  url: string;
  thumbnail?: string;
  subtitles?: string;
  chapters?: Array<{ time: number; title: string }>;
}

interface TutorialProgress {
  [tutorialId: string]: {
    completed: boolean;
    progress: number;
    lastAccessed: number;
  };
}

export class MultimediaTutorial {
  private tutorials: Map<string, TutorialContent>;
  private currentTutorial: TutorialContent | null;
  private container: HTMLDivElement | null;
  private videoPlayer: HTMLVideoElement | null;
  private progress: TutorialProgress;
  private isPlaying: boolean;

  constructor() {
    this.tutorials = new Map();
    this.currentTutorial = null;
    this.container = null;
    this.videoPlayer = null;
    this.isPlaying = false;
    this.progress = this.loadProgress();

    this.initializeDOM();
    this.loadTutorialLibrary();
  }

  /**
   * Initialize DOM elements
   */
  private initializeDOM(): void {
    this.container = document.createElement('div');
    this.container.className = 'multimedia-tutorial-container hidden';
    this.container.id = 'multimedia-tutorial';

    this.container.innerHTML = `
      <div class="tutorial-modal">
        <div class="tutorial-header">
          <h3 class="tutorial-title"></h3>
          <button class="tutorial-close-btn" id="close-tutorial">×</button>
        </div>
        <div class="tutorial-content-area">
          <div class="tutorial-text-content" id="text-content"></div>
          <div class="tutorial-video-content hidden" id="video-content">
            <video class="tutorial-video" controls></video>
            <div class="video-chapters" id="video-chapters"></div>
          </div>
          <div class="tutorial-interactive-content hidden" id="interactive-content">
            <canvas class="tutorial-canvas" id="tutorial-canvas"></canvas>
            <div class="interactive-controls" id="interactive-controls"></div>
          </div>
          <div class="tutorial-animated-content hidden" id="animated-content">
            <div class="animation-display" id="animation-display"></div>
            <div class="animation-controls">
              <button class="anim-btn" id="anim-play">▶</button>
              <button class="anim-btn" id="anim-pause">⏸</button>
              <button class="anim-btn" id="anim-restart">↻</button>
              <div class="anim-progress">
                <div class="anim-progress-bar" id="anim-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tutorial-footer">
          <div class="tutorial-progress-info">
            <span class="progress-label">Progress:</span>
            <div class="progress-bar-container">
              <div class="progress-bar" id="tutorial-progress"></div>
            </div>
            <span class="progress-percentage" id="progress-percentage">0%</span>
          </div>
          <div class="tutorial-navigation">
            <button class="tutorial-nav-btn" id="prev-tutorial">← Previous</button>
            <button class="tutorial-nav-btn primary" id="next-tutorial">Next →</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const closeBtn = document.getElementById('close-tutorial');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const prevBtn = document.getElementById('prev-tutorial');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousTutorial());
    }

    const nextBtn = document.getElementById('next-tutorial');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextTutorial());
    }

    // Animation controls
    const playBtn = document.getElementById('anim-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.playAnimation());
    }

    const pauseBtn = document.getElementById('anim-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseAnimation());
    }

    const restartBtn = document.getElementById('anim-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartAnimation());
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.container?.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  /**
   * Load tutorial library from assets
   */
  private loadTutorialLibrary(): void {
    // Define built-in tutorials
    const tutorials: TutorialContent[] = [
      {
        id: 'intro-tds',
        title: 'Introduction to TDS',
        description: 'Learn the basics of the Theory of Dynamic Symmetry',
        type: 'text',
        content: `
          <h4>What is the Theory of Dynamic Symmetry?</h4>
          <p>The Theory of Dynamic Symmetry (TDS) is a theoretical framework that describes 
          the origin of matter and fields through an informational approach based on 
          symmetry dynamics in a discrete lattice structure.</p>
          
          <h4>Key Concepts</h4>
          <ul>
            <li><strong>Discrete Lattice:</strong> Space is modeled as a grid of interconnected nodes</li>
            <li><strong>Symmetry States:</strong> Nodes can be symmetric, asymmetric, or anomalous</li>
            <li><strong>Reversible Dynamics:</strong> All processes can be reversed in time</li>
            <li><strong>Information Conservation:</strong> Total information is preserved</li>
          </ul>
          
          <h4>Why Study TDS?</h4>
          <p>TDS offers a unique perspective on fundamental physics, potentially addressing 
          unsolved problems like dark matter, matter-antimatter asymmetry, and quantum measurement.</p>
        `,
        difficulty: 'beginner',
      },
      {
        id: 'lattice-basics',
        title: 'Understanding the Lattice',
        description: 'Explore how the lattice structure works',
        type: 'interactive',
        content: 'interactive-lattice-demo',
        difficulty: 'beginner',
      },
      {
        id: 'symmetry-breaking',
        title: 'Symmetry Breaking',
        description: 'Learn about symmetry breaking and anomalies',
        type: 'animated',
        content: {
          frames: [
            {
              description: 'Initial symmetric state - all nodes are balanced',
              parameters: { symmetryStrength: 0.9, anomalyProbability: 0 },
              duration: 2000,
            },
            {
              description: 'Introducing an anomaly - symmetry is broken',
              parameters: { symmetryStrength: 0.9, anomalyProbability: 0.1 },
              duration: 3000,
            },
            {
              description: 'Anomaly propagates through the lattice',
              parameters: { symmetryStrength: 0.5, anomalyProbability: 0.2 },
              duration: 3000,
            },
            {
              description: 'System reaches new equilibrium',
              parameters: { symmetryStrength: 0.6, anomalyProbability: 0.1 },
              duration: 2000,
            },
          ],
          loop: true,
        },
        difficulty: 'intermediate',
      },
      {
        id: 'time-reversibility',
        title: 'Time Reversibility',
        description: 'Understand reversible dynamics in TDS',
        type: 'text',
        content: `
          <h4>What is Time Reversibility?</h4>
          <p>In TDS, all processes are time-reversible, meaning the system can evolve 
          both forward and backward in time while maintaining information conservation.</p>
          
          <h4>Why is this Important?</h4>
          <ul>
            <li>Ensures information is never lost</li>
            <li>Allows analysis of cause and effect</li>
            <li>Enables exploration of system history</li>
            <li>Provides insights into fundamental physics</li>
          </ul>
          
          <h4>Try It Yourself</h4>
          <p>Use the timeline controls to play the simulation forward and backward. 
          Notice how the system retraces its exact path when reversed.</p>
        `,
        difficulty: 'intermediate',
      },
      {
        id: 'energy-flow',
        title: 'Energy and Information Flow',
        description: 'Visualize how energy flows through the lattice',
        type: 'animated',
        content: {
          frames: [
            {
              description: 'Energy concentrated in one region',
              parameters: { interactionRange: 1.5, timeStep: 0.1 },
              duration: 2000,
            },
            {
              description: 'Energy begins to spread',
              parameters: { interactionRange: 2.5, timeStep: 0.1 },
              duration: 3000,
            },
            {
              description: 'Energy distributed across lattice',
              parameters: { interactionRange: 3.5, timeStep: 0.1 },
              duration: 3000,
            },
          ],
          loop: true,
        },
        difficulty: 'advanced',
      },
    ];

    tutorials.forEach((tutorial) => {
      this.tutorials.set(tutorial.id, tutorial);
    });
  }

  /**
   * Open a specific tutorial
   */
  open(tutorialId: string): void {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      console.warn(`Tutorial not found: ${tutorialId}`);
      return;
    }

    this.currentTutorial = tutorial;
    this.renderTutorial(tutorial);

    if (this.container) {
      this.container.classList.remove('hidden');
    }

    // Update progress
    this.updateProgress(tutorialId, 0);
  }

  /**
   * Render tutorial content
   */
  private renderTutorial(tutorial: TutorialContent): void {
    // Update title
    const titleEl = this.container?.querySelector('.tutorial-title');
    if (titleEl) {
      titleEl.textContent = tutorial.title;
    }

    // Hide all content areas
    const contentAreas = [
      'text-content',
      'video-content',
      'interactive-content',
      'animated-content',
    ];
    contentAreas.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
      }
    });

    // Show appropriate content
    switch (tutorial.type) {
      case 'text':
        this.renderTextContent(tutorial);
        break;
      case 'video':
        this.renderVideoContent(tutorial);
        break;
      case 'interactive':
        this.renderInteractiveContent(tutorial);
        break;
      case 'animated':
        this.renderAnimatedContent(tutorial);
        break;
    }

    // Update progress display
    this.updateProgressDisplay(tutorial.id);
  }

  /**
   * Render text content
   */
  private renderTextContent(tutorial: TutorialContent): void {
    const contentEl = document.getElementById('text-content');
    if (contentEl && typeof tutorial.content === 'string') {
      contentEl.innerHTML = tutorial.content;
      contentEl.classList.remove('hidden');
    }
  }

  /**
   * Render video content
   */
  private renderVideoContent(tutorial: TutorialContent): void {
    const contentEl = document.getElementById('video-content');
    const videoEl = contentEl?.querySelector('.tutorial-video') as HTMLVideoElement;

    if (contentEl && videoEl && typeof tutorial.content === 'string') {
      // Assume content is a video URL or video tutorial object
      const videoData: VideoTutorial = JSON.parse(tutorial.content);

      videoEl.src = videoData.url;
      if (videoData.subtitles) {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.src = videoData.subtitles;
        track.srclang = 'en';
        track.label = 'English';
        videoEl.appendChild(track);
      }

      // Render chapters if available
      if (videoData.chapters) {
        const chaptersEl = document.getElementById('video-chapters');
        if (chaptersEl) {
          chaptersEl.innerHTML = videoData.chapters
            .map(
              (chapter) => `
            <button class="chapter-btn" data-time="${chapter.time}">
              ${this.formatTime(chapter.time)} - ${chapter.title}
            </button>
          `
            )
            .join('');

          // Add chapter navigation
          chaptersEl.querySelectorAll('.chapter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              const time = parseFloat((e.target as HTMLElement).dataset.time || '0');
              videoEl.currentTime = time;
              videoEl.play();
            });
          });
        }
      }

      contentEl.classList.remove('hidden');
      this.videoPlayer = videoEl;
    }
  }

  /**
   * Render interactive content
   */
  private renderInteractiveContent(tutorial: TutorialContent): void {
    const contentEl = document.getElementById('interactive-content');
    if (contentEl) {
      // Interactive content would integrate with the main simulation
      // For now, show a placeholder
      contentEl.innerHTML = `
        <div class="interactive-placeholder">
          <p>Interactive demonstration: ${tutorial.description}</p>
          <p>This would integrate with the main simulation canvas.</p>
        </div>
      `;
      contentEl.classList.remove('hidden');
    }
  }

  /**
   * Render animated content
   */
  private renderAnimatedContent(tutorial: TutorialContent): void {
    const contentEl = document.getElementById('animated-content');
    const displayEl = document.getElementById('animation-display');

    if (contentEl && displayEl && typeof tutorial.content !== 'string') {
      const demo = tutorial.content as AnimatedDemo;

      // Show first frame
      if (demo.frames.length > 0) {
        displayEl.innerHTML = `
          <div class="animation-frame">
            <h4>Animation: ${tutorial.title}</h4>
            <p class="frame-description">${demo.frames[0].description}</p>
            <div class="frame-visualization">
              <p>Frame 1 of ${demo.frames.length}</p>
            </div>
          </div>
        `;
      }

      contentEl.classList.remove('hidden');
    }
  }

  /**
   * Play animation
   */
  private playAnimation(): void {
    if (!this.currentTutorial || typeof this.currentTutorial.content === 'string') {
      return;
    }

    this.isPlaying = true;
    const demo = this.currentTutorial.content as AnimatedDemo;
    let currentFrame = 0;

    const playFrame = () => {
      if (!this.isPlaying || currentFrame >= demo.frames.length) {
        if (demo.loop && this.isPlaying) {
          currentFrame = 0;
        } else {
          this.isPlaying = false;
          return;
        }
      }

      const frame = demo.frames[currentFrame];
      const displayEl = document.getElementById('animation-display');

      if (displayEl) {
        displayEl.innerHTML = `
          <div class="animation-frame">
            <p class="frame-description">${frame.description}</p>
            <div class="frame-visualization">
              <p>Frame ${currentFrame + 1} of ${demo.frames.length}</p>
            </div>
          </div>
        `;
      }

      // Update progress bar
      const progressBar = document.getElementById('anim-progress-bar');
      if (progressBar) {
        const progress = ((currentFrame + 1) / demo.frames.length) * 100;
        progressBar.style.width = `${progress}%`;
      }

      currentFrame++;

      if (this.isPlaying) {
        setTimeout(playFrame, frame.duration);
      }
    };

    playFrame();
  }

  /**
   * Pause animation
   */
  private pauseAnimation(): void {
    this.isPlaying = false;
  }

  /**
   * Restart animation
   */
  private restartAnimation(): void {
    this.pauseAnimation();
    const progressBar = document.getElementById('anim-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    setTimeout(() => this.playAnimation(), 100);
  }

  /**
   * Navigate to previous tutorial
   */
  private previousTutorial(): void {
    if (!this.currentTutorial) return;

    const tutorialIds = Array.from(this.tutorials.keys());
    const currentIndex = tutorialIds.indexOf(this.currentTutorial.id);

    if (currentIndex > 0) {
      this.open(tutorialIds[currentIndex - 1]);
    }
  }

  /**
   * Navigate to next tutorial
   */
  private nextTutorial(): void {
    if (!this.currentTutorial) return;

    const tutorialIds = Array.from(this.tutorials.keys());
    const currentIndex = tutorialIds.indexOf(this.currentTutorial.id);

    if (currentIndex < tutorialIds.length - 1) {
      this.open(tutorialIds[currentIndex + 1]);
    } else {
      // Mark as completed
      this.markCompleted(this.currentTutorial.id);
      this.close();
    }
  }

  /**
   * Close tutorial
   */
  close(): void {
    if (this.container) {
      this.container.classList.add('hidden');
    }

    // Stop video if playing
    if (this.videoPlayer) {
      this.videoPlayer.pause();
      this.videoPlayer = null;
    }

    // Stop animation if playing
    this.pauseAnimation();

    this.currentTutorial = null;
  }

  /**
   * Update progress
   */
  private updateProgress(tutorialId: string, progressValue: number): void {
    if (!this.progress[tutorialId]) {
      this.progress[tutorialId] = {
        completed: false,
        progress: 0,
        lastAccessed: Date.now(),
      };
    }

    this.progress[tutorialId].progress = progressValue;
    this.progress[tutorialId].lastAccessed = Date.now();

    this.saveProgress();
  }

  /**
   * Mark tutorial as completed
   */
  private markCompleted(tutorialId: string): void {
    if (!this.progress[tutorialId]) {
      this.progress[tutorialId] = {
        completed: false,
        progress: 0,
        lastAccessed: Date.now(),
      };
    }

    this.progress[tutorialId].completed = true;
    this.progress[tutorialId].progress = 100;

    this.saveProgress();
  }

  /**
   * Update progress display
   */
  private updateProgressDisplay(tutorialId: string): void {
    const progressData = this.progress[tutorialId];
    const progressBar = document.getElementById('tutorial-progress');
    const progressText = document.getElementById('progress-percentage');

    if (progressBar && progressData) {
      progressBar.style.width = `${progressData.progress}%`;
    }

    if (progressText && progressData) {
      progressText.textContent = `${progressData.progress}%`;
    }
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): TutorialProgress {
    try {
      const stored = localStorage.getItem('tds_tutorial_progress');
      return stored ? (JSON.parse(stored) as TutorialProgress) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem('tds_tutorial_progress', JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Could not save tutorial progress:', e);
    }
  }

  /**
   * Format time in MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get all tutorials
   */
  getTutorials(): TutorialContent[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * Get tutorials by difficulty
   */
  getTutorialsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): TutorialContent[] {
    return this.getTutorials().filter((t) => t.difficulty === difficulty);
  }

  /**
   * Get tutorial progress
   */
  getProgress(tutorialId: string): { completed: boolean; progress: number } | null {
    return this.progress[tutorialId] || null;
  }

  /**
   * Reset all progress
   */
  resetProgress(): void {
    this.progress = {};
    this.saveProgress();
  }
}
