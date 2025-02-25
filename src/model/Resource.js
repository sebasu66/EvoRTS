/**
 * Resource class for EvoRTS
 * Represents resources that can be gathered by units
 */
export default class Resource {
  constructor(type, x, y, quantity = 100) {
    this.type = type; // 'energy' or 'matter'
    this.x = x;
    this.y = y;
    this.quantity = quantity;
    this.maxQuantity = quantity;
    this.regenerationRate = type === 'energy' ? 0.1 : 0.05; // Energy regenerates faster than matter
    this.depleted = false;
  }

  /**
   * Update resource state
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   */
  update(deltaTime) {
    // Regenerate resources over time if not fully depleted
    if (this.quantity < this.maxQuantity && !this.depleted) {
      this.quantity += this.regenerationRate * (deltaTime / 1000);
      if (this.quantity > this.maxQuantity) {
        this.quantity = this.maxQuantity;
      }
    }

    // Mark as depleted if quantity is very low
    if (this.quantity <= 0.5) {
      this.depleted = true;
    }
  }

  /**
   * Extract resources from this node
   * @param {number} amount - Amount to extract
   * @return {number} - Actual amount extracted
   */
  extract(amount) {
    if (this.depleted) return 0;
    
    const extractAmount = Math.min(amount, this.quantity);
    this.quantity -= extractAmount;
    
    // Check if resource is now depleted
    if (this.quantity <= 0.5) {
      this.depleted = true;
      this.quantity = 0;
    }
    
    return extractAmount;
  }

  /**
   * Calculate visual radius based on quantity
   * for rendering purposes
   */
  getVisualRadius() {
    // Scale radius between 5 and 15 based on quantity
    const minRadius = 5;
    const maxRadius = 15;
    const ratio = this.quantity / this.maxQuantity;
    return minRadius + ratio * (maxRadius - minRadius);
  }

  /**
   * Get color for this resource type
   */
  getColor() {
    return this.type === 'energy' ? 0x00ffff : 0xffaa00;
  }
}