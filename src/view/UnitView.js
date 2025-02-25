/**
 * UnitView class for EvoRTS
 * Handles the visual representation of units in the game
 */
export default class UnitView {
  /**
   * Constructor for UnitView
   * @param {Phaser.Scene} scene - The Phaser scene
   */
  constructor(scene) {
    this.scene = scene;
    this.unitSprites = new Map();
    this.healthBars = new Map();
    this.useVectorGraphics = false;
    
    // Try to load unit assets
    this.scene.load.image('worker', 'assets/worker.png');
    
    // Check if images are available after loading
    this.scene.load.on('complete', () => {
      this.checkImageAvailability();
    });
    
    // Also check for immediate failures
    this.scene.load.on('loaderror', (fileObj) => {
      if (fileObj.key === 'worker') {
        console.log('Worker sprite not found, using vector graphics instead');
        this.useVectorGraphics = true;
      }
    });
    
    // Generate a texture for worker units as fallback
    this.generateWorkerTexture();
  }
  
  /**
   * Generate vector graphics texture for worker units
   */
  generateWorkerTexture() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Player unit style (blue)
    graphics.fillStyle(0x3498db);
    graphics.fillCircle(16, 16, 14);
    graphics.fillStyle(0x2980b9);
    graphics.fillCircle(16, 16, 8);
    graphics.lineStyle(2, 0xecf0f1);
    graphics.strokeCircle(16, 16, 14);
    
    // Create texture from graphics
    graphics.generateTexture('worker_vector', 32, 32);
    
    // Enemy unit style (red)
    graphics.clear();
    graphics.fillStyle(0xe74c3c);
    graphics.fillCircle(16, 16, 14);
    graphics.fillStyle(0xc0392b);
    graphics.fillCircle(16, 16, 8);
    graphics.lineStyle(2, 0xecf0f1);
    graphics.strokeCircle(16, 16, 14);
    
    // Create texture from graphics
    graphics.generateTexture('enemy_vector', 32, 32);
    
    // Base texture (square building)
    graphics.clear();
    graphics.fillStyle(0x34495e);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x2c3e50);
    graphics.fillRect(4, 4, 24, 24);
    graphics.lineStyle(2, 0xecf0f1);
    graphics.strokeRect(0, 0, 32, 32);
    
    // Create texture from graphics
    graphics.generateTexture('base_vector', 32, 32);
    
    // Energy resource (blue diamond)
    graphics.clear();
    graphics.fillStyle(0x00bfff);
    graphics.beginPath();
    graphics.moveTo(16, 0);
    graphics.lineTo(32, 16);
    graphics.lineTo(16, 32);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fill();
    graphics.lineStyle(2, 0xecf0f1);
    graphics.strokePath();
    
    // Create texture from graphics
    graphics.generateTexture('energy_vector', 32, 32);
    
    // Matter resource (orange hexagon)
    graphics.clear();
    graphics.fillStyle(0xf39c12);
    
    // Draw hexagon
    const sides = 6;
    const size = 14;
    graphics.beginPath();
    graphics.moveTo(16 + size, 16);
    for (let i = 1; i <= sides; i++) {
      const angle = i * 2 * Math.PI / sides;
      graphics.lineTo(
        16 + size * Math.cos(angle),
        16 + size * Math.sin(angle)
      );
    }
    graphics.closePath();
    graphics.fill();
    graphics.lineStyle(2, 0xecf0f1);
    graphics.strokePath();
    
    // Create texture from graphics
    graphics.generateTexture('matter_vector', 32, 32);
  }
  
  /**
   * Check if images were successfully loaded
   */
  checkImageAvailability() {
    // Check if worker texture exists
    if (!this.scene.textures.exists('worker')) {
      console.log('Worker sprite not found, using vector graphics instead');
      this.useVectorGraphics = true;
    }
    
    // Update existing sprites if needed
    if (this.useVectorGraphics) {
      for (const [id, sprite] of this.unitSprites.entries()) {
        if (id.startsWith('player')) {
          sprite.setTexture('worker_vector');
        } else if (id.startsWith('enemy')) {
          sprite.setTexture('enemy_vector');
        }
      }
    }
  }

  /**
   * Create a visual representation for a unit
   * @param {BaseUnit} unit - The unit model to create a sprite for
   */
  createUnitSprite(unit) {
    // Determine which texture to use
    let textureKey;
    if (this.useVectorGraphics) {
      textureKey = unit.id.startsWith('player') ? 'worker_vector' : 'enemy_vector';
    } else {
      textureKey = 'worker';
    }
    
    // Create the unit sprite
    const sprite = this.scene.add.sprite(unit.x, unit.y, textureKey);
    sprite.setScale(0.5);
    
    // Create direction arrow
    const arrowColor = unit.id.startsWith('player') ? 0x44aaff : 0xff4444;
    const directionArrow = this.scene.add.graphics();
    directionArrow.fillStyle(arrowColor, 1);
    directionArrow.lineStyle(2, 0xffffff, 0.8);
    
    // Draw triangle arrow
    directionArrow.beginPath();
    directionArrow.moveTo(0, -12);
    directionArrow.lineTo(-6, 0);
    directionArrow.lineTo(6, 0);
    directionArrow.closePath();
    directionArrow.fillPath();
    directionArrow.strokePath();
    
    directionArrow.x = unit.x;
    directionArrow.y = unit.y;
    directionArrow.rotation = unit.direction;
    
    // Create health bar
    const healthBarWidth = 30;
    const healthBarHeight = 4;
    const healthBarBackground = this.scene.add.rectangle(
      unit.x, 
      unit.y - 20, 
      healthBarWidth, 
      healthBarHeight, 
      0x000000
    );
    const healthBar = this.scene.add.rectangle(
      unit.x - healthBarWidth / 2, 
      unit.y - 20, 
      healthBarWidth * (unit.health / unit.maxHealth), 
      healthBarHeight, 
      0x00ff00
    );
    healthBar.setOrigin(0, 0.5);
    
    // Store references
    this.unitSprites.set(unit.id, {
      sprite: sprite,
      arrow: directionArrow
    });
    this.healthBars.set(unit.id, { background: healthBarBackground, bar: healthBar });
    
    return sprite;
  }

  /**
   * Update a unit's visual representation
   * @param {BaseUnit} unit - The unit model to update
   */
  updateUnitSprite(unit) {
    const spriteData = this.unitSprites.get(unit.id);
    if (!spriteData) {
      return this.createUnitSprite(unit);
    }
    
    const sprite = spriteData.sprite;
    const arrow = spriteData.arrow;
    
    // Update position
    sprite.x = unit.x;
    sprite.y = unit.y;
    
    // Update direction arrow
    if (arrow) {
      arrow.x = unit.x;
      arrow.y = unit.y;
      arrow.rotation = unit.direction;
      
      // Make arrow more visible when moving
      if (unit.isMoving) {
        arrow.alpha = 1;
      } else {
        arrow.alpha = 0.6;
      }
    }
    
    // Update health bar
    const healthBarData = this.healthBars.get(unit.id);
    if (healthBarData) {
      const { background, bar } = healthBarData;
      background.x = unit.x;
      background.y = unit.y - 20;
      
      bar.x = unit.x - 15; // Half of health bar width
      bar.y = unit.y - 20;
      bar.width = 30 * (unit.health / unit.maxHealth);
      
      // Update health bar color based on health percentage
      if (unit.health / unit.maxHealth > 0.6) {
        bar.fillColor = 0x00ff00; // Green
      } else if (unit.health / unit.maxHealth > 0.3) {
        bar.fillColor = 0xffff00; // Yellow
      } else {
        bar.fillColor = 0xff0000; // Red
      }
    }
    
    // Visual indicators for unit state based on current state
    switch (unit.currentState) {
      case 'gathering':
        sprite.setTint(0xffff00); // Yellow for gathering
        break;
      case 'attacking':
        sprite.setTint(0xff0000); // Red for attacking
        break;
      case 'moving':
        sprite.setTint(0xaaddff); // Light blue for moving
        break;
      case 'depositing':
        sprite.setTint(0x00ffaa); // Teal for depositing resources
        break;
      default:
        sprite.setTint(0xffffff); // White for idle/default
    }
    
    // Update status label if status display is enabled
    if (window.showUnitStatus) {
      this.updateStatusLabel(unit);
    } else if (unit.stateLabel) {
      // Remove the label if status display is disabled
      unit.stateLabel.destroy();
      unit.stateLabel = null;
    }
    
    return sprite;
  }
  
  /**
   * Create or update the status label for a unit
   * @param {BaseUnit} unit - The unit to update the status label for
   */
  updateStatusLabel(unit) {
    // Format the status text based on unit state
    let statusText = unit.currentState.charAt(0).toUpperCase() + unit.currentState.slice(1);
    
    // Add inventory info if gathering or depositing
    if (unit.currentState === 'gathering' || unit.currentState === 'depositing') {
      statusText += ` (E:${unit.inventory.energy} M:${unit.inventory.matter})`;
    }
    
    // Add health info
    statusText += ` [${Math.floor(unit.health)}HP]`;
    
    // Create or update the status label
    if (!unit.stateLabel) {
      unit.stateLabel = this.scene.add.text(unit.x, unit.y - 30, statusText, {
        fontSize: '10px',
        backgroundColor: '#000000',
        padding: { x: 3, y: 2 },
        color: '#ffffff'
      });
      unit.stateLabel.setOrigin(0.5, 0.5);
      unit.stateLabel.setDepth(100);
    } else {
      unit.stateLabel.setText(statusText);
      unit.stateLabel.x = unit.x;
      unit.stateLabel.y = unit.y - 30;
    }
    
    // Ensure proper visibility
    if (window.showUnitStatus) {
      unit.stateLabel.setVisible(true);
    } else {
      unit.stateLabel.setVisible(false);
    }
  }

  /**
   * Remove a unit's visual representation
   * @param {string} unitId - The ID of the unit to remove
   */
  removeUnitSprite(unitId) {
    const spriteData = this.unitSprites.get(unitId);
    if (spriteData) {
      if (spriteData.sprite) spriteData.sprite.destroy();
      if (spriteData.arrow) spriteData.arrow.destroy();
      this.unitSprites.delete(unitId);
    }
    
    const healthBarData = this.healthBars.get(unitId);
    if (healthBarData) {
      healthBarData.background.destroy();
      healthBarData.bar.destroy();
      this.healthBars.delete(unitId);
    }
    
    // Also remove status label if it exists
    const unit = this.scene.game.gameController?.units.get(unitId);
    if (unit && unit.stateLabel) {
      unit.stateLabel.destroy();
      unit.stateLabel = null;
    }
  }
  
  /**
   * Draw selection circle around a unit and show detailed information
   * @param {string} unitId - The ID of the selected unit
   */
  selectUnit(unitId) {
    this.clearSelection();
    
    const unit = this.scene.game.gameController.units.get(unitId);
    const spriteData = this.unitSprites.get(unitId);
    
    if (spriteData && spriteData.sprite && unit) {
      const sprite = spriteData.sprite;
      
      // Selection circle around unit
      this.selectionCircle = this.scene.add.circle(
        sprite.x, 
        sprite.y, 
        sprite.width / 2 + 5, 
        0x0088ff, 
        0.5
      );
      
      // Vision range circle
      this.visionCircle = this.scene.add.circle(
        sprite.x,
        sprite.y,
        unit.visionRange,
        unit.id.startsWith('player') ? 0x00aaff : 0xff6666,
        0.15
      );
      this.visionCircle.setStrokeStyle(1, unit.id.startsWith('player') ? 0x0088ff : 0xff4444, 0.5);
      
      // Store the selected unit ID
      this.selectedUnitId = unitId;
      
      // Show unit details in the status panel
      this.showDetailedUnitInfo(unit);
    }
  }
  
  /**
   * Show detailed information about a unit in the side panel
   * @param {BaseUnit} unit - The unit to show details for
   */
  showDetailedUnitInfo(unit) {
    // Get the status content element
    const statusContent = document.getElementById('status-content');
    if (!statusContent) return;
    
    // Find unit's status element or create a new container for selected unit details
    let detailsElement = document.getElementById('selected-unit-details');
    if (!detailsElement) {
      detailsElement = document.createElement('div');
      detailsElement.id = 'selected-unit-details';
      detailsElement.style.position = 'absolute';
      detailsElement.style.top = '0';
      detailsElement.style.left = '0';
      detailsElement.style.width = '100%';
      detailsElement.style.backgroundColor = '#1e1e1e';
      detailsElement.style.padding = '10px';
      detailsElement.style.borderBottom = '1px solid #444';
      detailsElement.style.display = 'none';
      statusContent.appendChild(detailsElement);
    }
    
    // Force activate status tab
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.log-tab, .status-tab').forEach(tab => tab.classList.remove('active'));
    
    const statusTabButton = document.querySelector('.tab-button[data-tab="status"]');
    if (statusTabButton) statusTabButton.classList.add('active');
    document.getElementById('status-content').classList.add('active');
    
    // Build HTML for unit details
    let html = `
      <div style="margin-bottom: 8px; font-weight: bold; color: ${unit.id.startsWith('player') ? '#4a8' : '#e55'};">
        ${unit.id}
      </div>
      <div style="display: flex; flex-wrap: wrap; margin-bottom: 8px;">
        <div style="flex: 1; min-width: 120px;">
          <div>Health: ${Math.floor(unit.health)}/${unit.maxHealth}</div>
          <div>State: ${unit.currentState}</div>
          <div>Position: (${Math.floor(unit.x)}, ${Math.floor(unit.y)})</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div>Speed: ${unit.speed}</div>
          <div>Attack: ${unit.attackPower}</div>
          <div>Defense: ${unit.defense}</div>
        </div>
      </div>
      <div style="display: flex; margin-bottom: 8px;">
        <div style="flex: 1;">
          <div>Vision: ${unit.visionRange}</div>
          <div>Capacity: ${unit.carryingCapacity}</div>
        </div>
        <div style="flex: 1; color: #00ccff;">
          <div>Energy: ${unit.inventory.energy}</div>
          <div>Matter: ${unit.inventory.matter}</div>
        </div>
      </div>
    `;
    
    // If the unit is moving, show the target
    if (unit.isMoving && unit.targetPosition) {
      html += `<div style="margin-top: 5px; color: #aaa;">Target: (${Math.floor(unit.targetPosition.x)}, ${Math.floor(unit.targetPosition.y)})</div>`;
    }
    
    // Update and show the details
    detailsElement.innerHTML = html;
    detailsElement.style.display = 'block';
    
    // Make selected unit globally available for reference
    window.selectedUnit = unit;
  }
  
  /**
   * Clear current selection
   */
  clearSelection() {
    if (this.selectionCircle) {
      this.selectionCircle.destroy();
      this.selectionCircle = null;
    }
    this.selectedUnitId = null;
  }
  
  /**
   * Update selection circle position
   */
  updateSelection() {
    if (this.selectionCircle && this.selectedUnitId) {
      const spriteData = this.unitSprites.get(this.selectedUnitId);
      if (spriteData && spriteData.sprite) {
        this.selectionCircle.x = spriteData.sprite.x;
        this.selectionCircle.y = spriteData.sprite.y;
      }
    }
  }
}