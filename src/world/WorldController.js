import WorldModel from './WorldModel.js';
import WorldView from './WorldView.js';

export default class WorldController {
    constructor(canvas) {
        this.canvas = canvas;
        this.model = new WorldModel();
        this.view = new WorldView(canvas);
        
        // Camera state
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            moveSpeed: 5,
            zoomSpeed: 0.1,
            minZoom: 0.5,
            maxZoom: 2
        };

        // Input state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };

        this.isDragging = false;
        this.lastMousePos = null;

        this.setupControls();
    }

    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = false;
            }
        });

        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right mouse button
                this.isDragging = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.lastMousePos) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                
                this.camera.x -= dx / this.camera.zoom;
                this.camera.y -= dy / this.camera.zoom;
                
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoom = this.camera.zoom - (e.deltaY * this.camera.zoomSpeed / 100);
            this.camera.zoom = Math.max(this.camera.minZoom, 
                                      Math.min(this.camera.maxZoom, zoom));
        });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    async initialize() {
        console.log("Initializing world...");
        this.model.generateWorld();
    }

    update(deltaTime) {
        // Update camera position based on keyboard input
        if (this.keys.w) this.camera.y -= this.camera.moveSpeed;
        if (this.keys.s) this.camera.y += this.camera.moveSpeed;
        if (this.keys.a) this.camera.x -= this.camera.moveSpeed;
        if (this.keys.d) this.camera.x += this.camera.moveSpeed;

        // Update model
        // ... any world state updates ...
    }

    render() {
        this.view.render(this.model, this.camera);
    }
}
