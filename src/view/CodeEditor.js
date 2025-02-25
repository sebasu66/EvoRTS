/**
 * CodeEditor class for EvoRTS
 * Creates and manages the code editor interface
 */
export default class CodeEditor {
  constructor(gameController) {
    this.gameController = gameController;
    this.editor = null;
    this.currentBehavior = 'onIdle';
    
    // Default code templates
    this.defaultCode = {
      onIdle: `function onIdle() {
  // This code runs when a unit has no other task
  // Available API methods:
  // - this.moveTo(x, y) - Move to coordinates
  // - this.gather(resourceNode) - Gather from a resource
  // - this.attack(target) - Attack a target
  // - this.returnToBase() - Return to base
  
  // Example: Random movement
  const randomX = this.x + (Math.random() * 100 - 50);
  const randomY = this.y + (Math.random() * 100 - 50);
  this.moveTo(randomX, randomY);
}`,
      onResourceSpotted: `function onResourceSpotted(resourceType, position) {
  // This code runs when a unit spots a resource
  // Parameters:
  // - resourceType: 'energy' or 'matter'
  // - position: {x, y} coordinates of the resource
  
  // Example: Move to resource if inventory not full
  if (!this.inventory.isFull()) {
    this.moveTo(position.x, position.y);
  } else {
    this.returnToBase();
  }
}`,
      onEnemySpotted: `function onEnemySpotted(enemyType, position) {
  // This code runs when a unit spots an enemy
  // Parameters:
  // - enemyType: type of enemy spotted
  // - position: {x, y} coordinates of the enemy
  
  // Example: Attack if healthy, flee if not
  if (this.health > this.maxHealth / 2) {
    this.moveTo(position.x, position.y);
  } else {
    const dx = this.x - position.x;
    const dy = this.y - position.y;
    this.moveTo(this.x + dx, this.y + dy);
  }
}`,
      onDamaged: `function onDamaged(amount, attacker) {
  // This code runs when a unit takes damage
  // Parameters:
  // - amount: amount of damage taken
  // - attacker: the entity that caused the damage
  
  // Example: Retreat when damaged
  if (attacker) {
    const dx = this.x - attacker.x;
    const dy = this.y - attacker.y;
    this.moveTo(this.x + dx, this.y + dy);
  }
}`
    };
    
    this.setupInterface();
  }
  
  /**
   * Set up the code editor interface
   */
  setupInterface() {
    // Use the existing code panel container
    const container = document.getElementById('code-panel-container');
    container.style.backgroundColor = '#1e1e1e';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    
    // Create header with behavior selector
    const header = document.createElement('div');
    header.style.padding = '10px';
    header.style.backgroundColor = '#333';
    header.style.borderBottom = '1px solid #555';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    container.appendChild(header);
    
    // Create behavior selector
    const selector = document.createElement('select');
    selector.style.backgroundColor = '#444';
    selector.style.color = '#fff';
    selector.style.border = 'none';
    selector.style.padding = '5px';
    selector.style.borderRadius = '3px';
    
    // Add behavior options
    for (const behavior in this.defaultCode) {
      const option = document.createElement('option');
      option.value = behavior;
      option.textContent = behavior;
      selector.appendChild(option);
    }
    
    // Handle behavior change
    selector.addEventListener('change', () => {
      this.setCurrentBehavior(selector.value);
    });
    
    header.appendChild(selector);
    
    // Create run button
    const runButton = document.createElement('button');
    runButton.textContent = 'Apply Code';
    runButton.style.backgroundColor = '#4a8';
    runButton.style.color = '#fff';
    runButton.style.border = 'none';
    runButton.style.padding = '5px 10px';
    runButton.style.borderRadius = '3px';
    runButton.style.cursor = 'pointer';
    
    runButton.addEventListener('click', () => {
      this.applyCode();
    });
    
    header.appendChild(runButton);
    
    // Create editor element
    const editorElement = document.createElement('div');
    editorElement.id = 'code-editor';
    editorElement.style.flex = '1';
    container.appendChild(editorElement);
    
    // Initialize CodeMirror editor when the script is loaded
    this.loadCodeMirror().then(() => {
      this.initializeEditor();
    });
    
    // Create status bar
    const statusBar = document.createElement('div');
    statusBar.id = 'code-status';
    statusBar.style.padding = '5px 10px';
    statusBar.style.backgroundColor = '#333';
    statusBar.style.color = '#aaa';
    statusBar.style.fontSize = '12px';
    statusBar.textContent = 'Ready';
    container.appendChild(statusBar);
    
    this.statusBar = statusBar;
  }
  
  /**
   * Load CodeMirror library
   */
  loadCodeMirror() {
    return new Promise((resolve) => {
      // Check if CodeMirror is already loaded
      if (window.CodeMirror) {
        resolve();
        return;
      }
      
      // Load CodeMirror CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css';
      document.head.appendChild(cssLink);
      
      // Load theme CSS
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css';
      document.head.appendChild(themeLink);
      
      // Load CodeMirror JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js';
      script.onload = () => {
        // Load JavaScript mode
        const modeScript = document.createElement('script');
        modeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js';
        modeScript.onload = resolve;
        document.head.appendChild(modeScript);
      };
      document.head.appendChild(script);
    });
  }
  
  /**
   * Initialize the code editor with CodeMirror
   */
  initializeEditor() {
    if (!window.CodeMirror) {
      console.error('CodeMirror not loaded');
      return;
    }
    
    const editorElement = document.getElementById('code-editor');
    
    this.editor = CodeMirror(editorElement, {
      value: this.defaultCode[this.currentBehavior],
      mode: 'javascript',
      theme: 'monokai',
      lineNumbers: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Enter': () => this.applyCode(),
        'Cmd-Enter': () => this.applyCode()
      }
    });
    
    // Set editor size
    this.editor.setSize('100%', '100%');
  }
  
  /**
   * Set the current behavior being edited
   * @param {string} behavior - Behavior name
   */
  setCurrentBehavior(behavior) {
    if (this.defaultCode.hasOwnProperty(behavior)) {
      this.currentBehavior = behavior;
      
      if (this.editor) {
        // Save current code before switching
        this.defaultCode[this.currentBehavior] = this.editor.getValue();
        
        // Set new code
        this.editor.setValue(this.defaultCode[behavior]);
      }
    }
  }
  
  /**
   * Apply the current code to the game
   */
  applyCode() {
    if (!this.editor) return;
    
    const code = this.editor.getValue();
    
    try {
      // Create a function from the code
      const functionBody = code.replace(/function\s+\w+\s*\([^)]*\)\s*{/, '').replace(/}$/, '');
      const paramString = code.match(/function\s+\w+\s*\(([^)]*)\)/)[1];
      const params = paramString.split(',').map(p => p.trim());
      
      // Create the function
      const behaviorFunction = new Function(...params, functionBody);
      
      // Apply the code to the game controller
      this.gameController.setPlayerCode(this.currentBehavior, behaviorFunction);
      
      // Apply same code to all behavior types - apply to all units at once
      if (window.gameLogger) {
        window.gameLogger.log(`Applying ${this.currentBehavior} behavior to ALL units`, null, 'system');
      }
      
      // Get all behavior types and apply the same code to all of them
      for (const behavior in this.defaultCode) {
        if (behavior !== this.currentBehavior) {
          this.gameController.setPlayerCode(behavior, behaviorFunction);
        }
      }
      
      // Update status
      this.updateStatus('Code applied to ALL behaviors!', 'success');
      
      // Log to game console
      if (window.gameLogger) {
        window.gameLogger.log(`Updated ALL unit behaviors with the same code`, null, 'system');
      }
    } catch (error) {
      console.error('Error applying code:', error);
      this.updateStatus(`Error: ${error.message}`, 'error');
      
      // Log error to game console
      if (window.gameLogger) {
        window.gameLogger.log(`Error in ${this.currentBehavior}: ${error.message}`, null, 'system');
      }
    }
  }
  
  /**
   * Reset all code to defaults
   */
  resetToDefaults() {
    // Reset current behavior first
    if (this.editor) {
      this.editor.setValue(this.defaultCode[this.currentBehavior]);
    }
    
    // Apply each default behavior
    for (const behavior in this.defaultCode) {
      try {
        const code = this.defaultCode[behavior];
        const functionBody = code.replace(/function\s+\w+\s*\([^)]*\)\s*{/, '').replace(/}$/, '');
        const paramString = code.match(/function\s+\w+\s*\(([^)]*)\)/)[1];
        const params = paramString.split(',').map(p => p.trim());
        
        // Create and apply the function
        const behaviorFunction = new Function(...params, functionBody);
        this.gameController.setPlayerCode(behavior, behaviorFunction);
      } catch (error) {
        console.error(`Error resetting ${behavior}:`, error);
      }
    }
    
    this.updateStatus('All code reset to defaults', 'success');
  }
  
  /**
   * Update the status bar
   * @param {string} message - Status message
   * @param {string} type - Status type ('info', 'success', 'error')
   */
  updateStatus(message, type = 'info') {
    if (!this.statusBar) return;
    
    this.statusBar.textContent = message;
    
    // Set color based on type
    switch (type) {
      case 'success':
        this.statusBar.style.color = '#4a8';
        break;
      case 'error':
        this.statusBar.style.color = '#e55';
        break;
      default:
        this.statusBar.style.color = '#aaa';
    }
    
    // Reset after a delay
    setTimeout(() => {
      this.statusBar.textContent = 'Ready';
      this.statusBar.style.color = '#aaa';
    }, 3000);
  }
}