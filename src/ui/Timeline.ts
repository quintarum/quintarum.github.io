// @ts-nocheck
/* eslint-disable */
/**
 * Timeline Component
 * Manages playback controls, history scrubbing, and bookmarks
 */
export class Timeline {
  constructor(simulation) {
    this.simulation = simulation;
    this.maxHistory = 1000;
    this.bookmarks = [];
    this.isPlaying = false;
    this.playbackDirection = 1; // 1 for forward, -1 for backward
    this.playbackSpeed = 1.0;
    
    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    const timelineContainer = document.getElementById('timeline-container');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = `
      <div class="timeline-panel">
        <div class="timeline-controls">
          <div class="playback-buttons">
            <button id="reverse-btn" class="timeline-btn" title="Play Backward">
              <span class="btn-icon">⏪</span>
            </button>
            <button id="step-back-btn" class="timeline-btn" title="Step Backward">
              <span class="btn-icon">⏮</span>
            </button>
            <button id="play-pause-btn" class="timeline-btn primary" title="Play/Pause">
              <span class="btn-icon" id="play-icon">▶</span>
            </button>
            <button id="step-forward-btn" class="timeline-btn" title="Step Forward">
              <span class="btn-icon">⏭</span>
            </button>
            <button id="fast-forward-btn" class="timeline-btn" title="Play Forward">
              <span class="btn-icon">⏩</span>
            </button>
          </div>

          <div class="time-info">
            <div class="time-display">
              <span class="time-label">Time:</span>
              <span id="current-time" class="time-value">0.00</span>
              <span class="time-separator">/</span>
              <span id="max-time" class="time-value">0.00</span>
            </div>
            <div class="direction-indicator" id="direction-indicator">
              <span class="direction-arrow">→</span>
              <span class="direction-label">Forward</span>
            </div>
          </div>

          <div class="timeline-actions">
            <button id="bookmark-btn" class="timeline-btn" title="Add Bookmark">
              <span class="btn-icon">🔖</span>
            </button>
            <button id="clear-history-btn" class="timeline-btn" title="Clear History">
              <span class="btn-icon">🗑</span>
            </button>
            <div class="speed-control">
              <label for="speed-slider">Speed:</label>
              <input 
                type="range" 
                id="speed-slider" 
                min="0.1" 
                max="5" 
                step="0.1" 
                value="1.0"
                class="speed-slider"
              />
              <span id="speed-value" class="speed-value">1.0x</span>
            </div>
          </div>
        </div>

        <div class="timeline-scrubber-container">
          <div class="timeline-track" id="timeline-track">
            <div class="timeline-progress" id="timeline-progress"></div>
            <div class="timeline-bookmarks" id="timeline-bookmarks"></div>
            <input 
              type="range" 
              id="timeline-scrubber" 
              min="0" 
              max="0" 
              value="0" 
              class="timeline-scrubber"
            />
          </div>
        </div>

        <div class="bookmarks-panel" id="bookmarks-panel">
          <div class="bookmarks-header">
            <h4>Bookmarks</h4>
            <button id="toggle-bookmarks-btn" class="toggle-btn">▼</button>
          </div>
          <div class="bookmarks-list" id="bookmarks-list">
            <p class="empty-message">No bookmarks yet. Click 🔖 to add one!</p>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Playback controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const reverseBtn = document.getElementById('reverse-btn');
    const fastForwardBtn = document.getElementById('fast-forward-btn');
    const stepBackBtn = document.getElementById('step-back-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    }

    if (reverseBtn) {
      reverseBtn.addEventListener('click', () => this.playBackward());
    }

    if (fastForwardBtn) {
      fastForwardBtn.addEventListener('click', () => this.playForward());
    }

    if (stepBackBtn) {
      stepBackBtn.addEventListener('click', () => this.stepBackward());
    }

    if (stepForwardBtn) {
      stepForwardBtn.addEventListener('click', () => this.stepForward());
    }

    // Timeline scrubber
    const scrubber = document.getElementById('timeline-scrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => this.seek(parseInt(e.target.value)));
      scrubber.addEventListener('mousedown', () => this.pause());
    }

    // Speed control
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => this.setSpeed(parseFloat(e.target.value)));
    }

    // Bookmark controls
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => this.addBookmark());
    }

    const toggleBookmarksBtn = document.getElementById('toggle-bookmarks-btn');
    if (toggleBookmarksBtn) {
      toggleBookmarksBtn.addEventListener('click', () => this.toggleBookmarksPanel());
    }

    // Clear history
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.stepBackward();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            this.simulation.reset();
          }
          break;
      }
    });
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    this.updatePlayIcon();
    
    if (this.simulation) {
      this.simulation.start();
    }
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayIcon();
    
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  playForward() {
    this.playbackDirection = 1;
    this.updateDirectionIndicator();
    this.play();
  }

  playBackward() {
    this.playbackDirection = -1;
    this.updateDirectionIndicator();
    
    if (this.simulation) {
      this.simulation.reverse();
    }
    
    this.isPlaying = true;
    this.updatePlayIcon();
  }

  stepForward() {
    this.pause();
    if (this.simulation) {
      this.simulation.step(this.simulation.params.timeStep);
    }
    this.update();
  }

  stepBackward() {
    this.pause();
    if (this.simulation && this.simulation.history.length > 0) {
      this.simulation.restorePreviousState();
    }
    this.update();
  }

  seek(timeIndex) {
    if (!this.simulation) return;

    const history = this.simulation.history;
    if (timeIndex >= 0 && timeIndex < history.length) {
      this.simulation.restoreState(timeIndex);
      this.update();
    }
  }

  setSpeed(speed) {
    this.playbackSpeed = speed;
    
    const speedValue = document.getElementById('speed-value');
    if (speedValue) {
      speedValue.textContent = `${speed.toFixed(1)}x`;
    }

    if (this.simulation) {
      this.simulation.setPlaybackSpeed(speed);
    }
  }

  addBookmark(description = null) {
    if (!this.simulation) return;

    const currentTime = this.simulation.time;
    const currentIndex = this.simulation.history.length - 1;

    if (!description) {
      description = prompt('Enter bookmark description:', `Bookmark at t=${currentTime.toFixed(2)}`);
      if (!description) return;
    }

    const bookmark = {
      id: Date.now(),
      time: currentTime,
      index: currentIndex,
      description: description,
      timestamp: new Date().toLocaleString()
    };

    this.bookmarks.push(bookmark);
    this.renderBookmarks();
    this.renderBookmarkMarkers();
  }

  removeBookmark(bookmarkId) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
    this.renderBookmarks();
    this.renderBookmarkMarkers();
  }

  jumpToBookmark(bookmarkId) {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      this.seek(bookmark.index);
    }
  }

  renderBookmarks() {
    const bookmarksList = document.getElementById('bookmarks-list');
    if (!bookmarksList) return;

    if (this.bookmarks.length === 0) {
      bookmarksList.innerHTML = '<p class="empty-message">No bookmarks yet. Click 🔖 to add one!</p>';
      return;
    }

    bookmarksList.innerHTML = this.bookmarks.map(bookmark => `
      <div class="bookmark-item" data-id="${bookmark.id}">
        <div class="bookmark-info">
          <div class="bookmark-description">${bookmark.description}</div>
          <div class="bookmark-meta">
            <span class="bookmark-time">t=${bookmark.time.toFixed(2)}</span>
            <span class="bookmark-timestamp">${bookmark.timestamp}</span>
          </div>
        </div>
        <div class="bookmark-actions">
          <button class="bookmark-action-btn jump-btn" data-id="${bookmark.id}" title="Jump to bookmark">
            ↗
          </button>
          <button class="bookmark-action-btn delete-btn" data-id="${bookmark.id}" title="Delete bookmark">
            ✕
          </button>
        </div>
      </div>
    `).join('');

    // Attach event listeners to bookmark actions
    bookmarksList.querySelectorAll('.jump-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.jumpToBookmark(id);
      });
    });

    bookmarksList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.removeBookmark(id);
      });
    });
  }

  renderBookmarkMarkers() {
    const bookmarksContainer = document.getElementById('timeline-bookmarks');
    if (!bookmarksContainer || !this.simulation) return;

    const maxIndex = this.simulation.history.length - 1;
    if (maxIndex <= 0) return;

    bookmarksContainer.innerHTML = this.bookmarks.map(bookmark => {
      const position = (bookmark.index / maxIndex) * 100;
      return `
        <div 
          class="bookmark-marker" 
          style="left: ${position}%"
          title="${bookmark.description}"
          data-id="${bookmark.id}"
        ></div>
      `;
    }).join('');

    // Add click handlers to markers
    bookmarksContainer.querySelectorAll('.bookmark-marker').forEach(marker => {
      marker.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.jumpToBookmark(id);
      });
    });
  }

  toggleBookmarksPanel() {
    const panel = document.getElementById('bookmarks-list');
    const toggleBtn = document.getElementById('toggle-bookmarks-btn');
    
    if (panel && toggleBtn) {
      const isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? '▼' : '▲';
    }
  }

  clearHistory() {
    if (confirm('Clear simulation history? This will remove all bookmarks.')) {
      if (this.simulation) {
        this.simulation.clearHistory();
      }
      this.bookmarks = [];
      this.renderBookmarks();
      this.renderBookmarkMarkers();
      this.update();
    }
  }

  update() {
    if (!this.simulation) return;

    const currentTime = this.simulation.time;
    const historyLength = this.simulation.history.length;
    const currentIndex = historyLength - 1;

    // Update time display
    const currentTimeEl = document.getElementById('current-time');
    const maxTimeEl = document.getElementById('max-time');
    
    if (currentTimeEl) {
      currentTimeEl.textContent = currentTime.toFixed(2);
    }
    
    if (maxTimeEl && historyLength > 0) {
      const maxTime = this.simulation.history[historyLength - 1].time || currentTime;
      maxTimeEl.textContent = maxTime.toFixed(2);
    }

    // Update scrubber
    const scrubber = document.getElementById('timeline-scrubber');
    if (scrubber) {
      scrubber.max = Math.max(0, historyLength - 1);
      scrubber.value = currentIndex;
    }

    // Update progress bar
    const progress = document.getElementById('timeline-progress');
    if (progress && historyLength > 1) {
      const percentage = (currentIndex / (historyLength - 1)) * 100;
      progress.style.width = `${percentage}%`;
    }

    // Update bookmark markers
    this.renderBookmarkMarkers();
  }

  updatePlayIcon() {
    const playIcon = document.getElementById('play-icon');
    if (playIcon) {
      playIcon.textContent = this.isPlaying ? '⏸' : '▶';
    }

    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.title = this.isPlaying ? 'Pause' : 'Play';
    }
  }

  updateDirectionIndicator() {
    const indicator = document.getElementById('direction-indicator');
    if (!indicator) return;

    const arrow = indicator.querySelector('.direction-arrow');
    const label = indicator.querySelector('.direction-label');

    if (this.playbackDirection === 1) {
      arrow.textContent = '→';
      label.textContent = 'Forward';
      indicator.classList.remove('backward');
    } else {
      arrow.textContent = '←';
      label.textContent = 'Backward';
      indicator.classList.add('backward');
    }
  }

  getBookmarks() {
    return [...this.bookmarks];
  }

  loadBookmarks(bookmarks) {
    this.bookmarks = bookmarks;
    this.renderBookmarks();
    this.renderBookmarkMarkers();
  }
}
