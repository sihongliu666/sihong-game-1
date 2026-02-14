/**
 * DOM-based dialogue and island panel overlay system.
 *
 * Two modes:
 *  - 'npc': bottom dialogue box with portrait and typewriter text
 *  - 'island': centered parchment scroll panel with resume content
 *
 * Supports both keyboard (Space/Enter/Esc) and touch (tap) interactions.
 */
export default class Dialogue {
  /**
   * @param {Phaser.Game} game - The Phaser game instance (used to emit events)
   */
  constructor(game) {
    this.game = game;
    this.overlay = null;
    this.isOpen = false;
    this.currentType = null;

    // Typewriter state
    this.typewriterTimer = null;
    this.fullText = '';
    this.charIndex = 0;
    this.textElement = null;
    this.typewriterDone = false;

    // NPC dialogue state
    this.dialogueLines = [];
    this.lineIndex = 0;

    // Bound handlers
    this._onKeyDown = this._handleKeyDown.bind(this);
  }

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------

  /**
   * Show a dialogue or island panel.
   */
  show(config) {
    if (this.isOpen) this.hide();

    this.isOpen = true;
    this.currentType = config.type;

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'dialogue-overlay';

    if (config.type === 'npc') {
      this._buildNPCDialogue(config);
    } else if (config.type === 'island') {
      this._buildIslandPanel(config);
    }

    document.body.appendChild(this.overlay);
    document.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * Close the overlay and return control to the game.
   */
  hide() {
    if (!this.isOpen) return;

    this._clearTypewriter();
    document.removeEventListener('keydown', this._onKeyDown);

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.overlay = null;
    this.isOpen = false;
    this.currentType = null;
    this.dialogueLines = [];
    this.lineIndex = 0;

    // Emit event so scenes know dialogue closed
    this.game.events.emit('dialogue-closed');
  }

  // ---------------------------------------------------------------
  // NPC Dialogue
  // ---------------------------------------------------------------

  _buildNPCDialogue(config) {
    this.overlay.classList.add('dialogue-overlay--npc');

    this.dialogueLines = config.content || [];
    this.lineIndex = 0;

    const box = document.createElement('div');
    box.className = 'dialogue-box';

    // Portrait (left side)
    if (config.portrait) {
      const portraitEl = document.createElement('div');
      portraitEl.className = 'dialogue-portrait';

      const img = document.createElement('img');
      img.src = `assets/portraits/${config.portrait}.png`;
      img.alt = config.title;
      portraitEl.appendChild(img);
      box.appendChild(portraitEl);
    }

    // Text area (right side)
    const textArea = document.createElement('div');
    textArea.className = 'dialogue-content';

    const nameEl = document.createElement('div');
    nameEl.className = 'speaker-name';
    nameEl.textContent = config.title || '';
    textArea.appendChild(nameEl);

    const textEl = document.createElement('div');
    textEl.className = 'dialogue-text';
    textArea.appendChild(textEl);

    const promptEl = document.createElement('div');
    promptEl.className = 'dialogue-prompt';
    textArea.appendChild(promptEl);
    this.promptElement = promptEl;

    box.appendChild(textArea);
    this.overlay.appendChild(box);
    this.textElement = textEl;

    // Tap anywhere on the dialogue box or overlay to advance
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      this._advanceDialogue();
    });

    // Tap backdrop to close
    this.overlay.addEventListener('click', () => {
      this.hide();
    });

    // Start first line
    this._showLine(this.dialogueLines[0] || '');
  }

  _showLine(text) {
    this._clearTypewriter();
    this.fullText = text;
    this.charIndex = 0;
    this.typewriterDone = false;
    this.textElement.textContent = '';

    // Update prompt text
    const isLast = this.lineIndex >= this.dialogueLines.length - 1;
    if (this.promptElement) {
      this.promptElement.textContent = isLast ? 'Tap or [Space] to close' : 'Tap or [Space] for next ▸';
    }

    this.typewriterTimer = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.textElement.textContent += this.fullText[this.charIndex];
        this.charIndex++;
      } else {
        this._clearTypewriter();
        this.typewriterDone = true;
      }
    }, 30);
  }

  _advanceDialogue() {
    // If typewriter is still running, skip to full text
    if (!this.typewriterDone) {
      this._clearTypewriter();
      this.textElement.textContent = this.fullText;
      this.typewriterDone = true;
      return;
    }

    // Move to next line
    this.lineIndex++;
    if (this.lineIndex < this.dialogueLines.length) {
      this._showLine(this.dialogueLines[this.lineIndex]);
    } else {
      // Last line — close
      this.hide();
    }
  }

  // ---------------------------------------------------------------
  // Island Panel
  // ---------------------------------------------------------------

  _buildIslandPanel(config) {
    this.overlay.classList.add('dialogue-overlay--island');

    // Tap backdrop to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    const panel = document.createElement('div');
    panel.className = 'island-panel';

    // Close button (larger, more visible)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'island-panel-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide();
    });
    panel.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.textContent = config.title || 'Island';
    panel.appendChild(title);

    // Content
    const contentArea = document.createElement('div');
    contentArea.className = 'island-panel-content';
    this._renderIslandEntries(contentArea, config.content, config.islandKey);
    panel.appendChild(contentArea);

    // Close bar at the bottom (large tap target for mobile)
    const closeBar = document.createElement('div');
    closeBar.className = 'island-panel-close-bar';
    closeBar.textContent = 'Tap here or press Esc to close';
    closeBar.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide();
    });
    panel.appendChild(closeBar);

    this.overlay.appendChild(panel);
  }

  /**
   * Render the resume entries for an island.
   */
  _renderIslandEntries(container, data, islandKey) {
    if (!data || !data.entries) return;

    data.entries.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'island-item';

      if (islandKey === 'aboutMe') {
        card.innerHTML = `
          <h3>${this._esc(entry.title)}</h3>
          <p>${this._esc(entry.description)}</p>
        `;
      } else if (islandKey === 'education') {
        card.innerHTML = `
          <h3>${this._esc(entry.degree)}</h3>
          <p class="subtitle">${this._esc(entry.institution)} - ${this._esc(entry.year)}</p>
          <p>${this._esc(entry.details)}</p>
        `;
      } else if (islandKey === 'workExperience') {
        card.innerHTML = `
          <h3>${this._esc(entry.role)}</h3>
          <p class="subtitle">${this._esc(entry.company)} | ${this._esc(entry.period)}</p>
          <ul>${(entry.highlights || []).map(h => `<li>${this._esc(h)}</li>`).join('')}</ul>
        `;
      } else {
        card.innerHTML = `<p>${this._esc(JSON.stringify(entry))}</p>`;
      }

      container.appendChild(card);
    });
  }

  // ---------------------------------------------------------------
  // Keyboard handling
  // ---------------------------------------------------------------

  _handleKeyDown(e) {
    if (!this.isOpen) return;

    if (this.currentType === 'npc') {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this._advanceDialogue();
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    } else if (this.currentType === 'island') {
      if (e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        this.hide();
      }
    }
  }

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------

  _clearTypewriter() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  /** Simple HTML escape to prevent XSS from data. */
  _esc(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
