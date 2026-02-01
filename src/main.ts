import * as THREE from 'three';

/**
 * BlastZone3D - Main Entry Point
 * 
 * This is a minimal starter template. The actual game implementation
 * will be built according to the Product Design specifications.
 */

class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;

  constructor() {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Initialize camera (high-angle isometric view as per spec)
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Replace loading screen with canvas
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
      app.appendChild(this.renderer.domElement);
    }

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Add temporary placeholder cube (will be replaced with game grid)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start game loop
    this.animate();

    console.log('🎮 BlastZone3D initialized');
    console.log('📋 Awaiting Product Design specifications...');
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Game());
} else {
  new Game();
}
