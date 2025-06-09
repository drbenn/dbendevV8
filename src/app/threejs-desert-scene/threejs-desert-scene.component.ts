import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'threejs-desert-scene',
  imports: [],
  templateUrl: './threejs-desert-scene.component.html',
  styleUrl: './threejs-desert-scene.component.scss'
})
export class ThreejsDesertSceneComponent implements OnInit, OnDestroy {
  @ViewChild('mount', { static: true }) mount!: ElementRef<HTMLDivElement>;
  @HostListener('window:resize', ['$event'])
	onResize(event: any) {
      if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  private scene: THREE.Scene | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private initialCameraPosition = new THREE.Vector3(0, 5, 25);
  private planets: THREE.Mesh[] = [];
  private animationFrameId: number | null = null;

  private car: THREE.Object3D | null = null;
  private desertSphere: THREE.Mesh | null = null;
  private clock = new THREE.Clock();

  constructor() {}
  
  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.setOrbitControls();
    // this.addBackground();
    this.addAmbientLight();
    this.addPointLight();
    // this.addPlanets();

    this.loadCarModel();
    this.addDesertFloor();
    this.addBackgroundGradient();
    this.addDustEffect();


    this.animateScene();
  }

  ngOnDestroy(): void {
    if (this.mount.nativeElement && this.renderer) {
      this.mount.nativeElement.removeChild(this.renderer.domElement);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls?.dispose();
  }

  animateScene = () => {
    // if (!this.scene || !this.camera || !this.renderer) return;

    // this.animationFrameId = requestAnimationFrame(this.animateScene);

    // this.planets.forEach(planet => {
    //   planet.rotation.y += 0.005;
    //   planet.rotation.x += 0.005;
    // });

    // this.controls?.update();
    // this.renderer!.render(this.scene!, this.camera!);

    if (!this.scene || !this.camera || !this.renderer) return;

    this.animationFrameId = requestAnimationFrame(this.animateScene);

    const elapsed = this.clock.getElapsedTime();

    // Rotate desert slowly
    if (this.desertSphere) {
        this.desertSphere.rotation.z += 0.0005;
    }

    // Animate car wheels / dust later here...

    // Camera animation
    if (elapsed > 10 && elapsed < 20) {
        // Slowly interpolate camera to side view
        const t = (elapsed - 10) / 10;
        this.camera!.position.lerp(new THREE.Vector3(10, 3, 0), 0.02); // move right
        this.controls!.target.lerp(new THREE.Vector3(0, 1, 0), 0.02); // aim at car center
    }

    this.controls?.update();
    this.renderer!.render(this.scene!, this.camera!);
  };




  loadCarModel() {
    const loader = new GLTFLoader();
    const scale: number = 0.75;
    const degreesY: number = 180;
    const degreesToRadiansY: number = (degreesY * Math.PI)/180
    loader.load('models/ae86/toyota_AE86.glb', (gltf) => {
      this.car = gltf.scene;
      this.car.scale.set(scale, scale, scale); // adjust scale
      this.car.position.set(0, -8, 0); // center of scene
      this.car.rotateY (degreesToRadiansY);
      this.car.rotateX(-0.01);
      this.scene!.add(this.car);
    });
  }


  addBackgroundGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 512;

    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#f0e68c'); // light orange (horizon)
    // gradient.addColorStop(1, '#ffe4b5'); // sand near bottom
    gradient.addColorStop(1, '#ff00ff');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 512);

    const bgTexture = new THREE.CanvasTexture(canvas);
    this.scene!.background = bgTexture;
}

addDustEffect() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = (Math.random()) * 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.5,
    });

    const dust = new THREE.Points(particleGeometry, particleMaterial);
    dust.position.set(-3.2, -8.2, 4.4); // rear left wheel (adjust!)
    this.scene!.add(dust);

    // Store reference for animation if desired
}






















































  createCamera() {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.set(this.initialCameraPosition.x, this.initialCameraPosition.y, this.initialCameraPosition.z);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true  });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.mount.nativeElement.appendChild(this.renderer.domElement);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.camera!, this.renderer!.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 0, 0);
  }

  // bg for scene...pretty much black with mild offset
  addBackground() {
    const canvas = this.renderer!.domElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#000046');
        this.renderer!.setClearColor('gradient');
    } else {
        this.renderer!.setClearColor('#0000FF00'); // general background of space
    }
  }

    addAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    // const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene!.add(ambientLight);
  }
  
  addPointLight() {
    const pointLight = new THREE.PointLight(0xffffff, 500);
    pointLight.position.set(0, 10, 10);
    this.scene!.add(pointLight);
  }

  addPlanets() {                                    // [x, y, z] - x = 5 left , y = 5 up, z = -5 out
    const planet1 = this.createPlanet(1, '#00ffff', [4, 0, 0], 'planet-textures/dope-planet-texture-23.png');
    // const planet2 = this.createPlanet(1.5,  '#ff00ff', [-4, 0, 0], 'planet-textures/dope-planet-texture-7.png');
    // const planet3 = this.createPlanet(3, 'yellow', [0, 5, 0], 'planet-textures/purple-planet-texture-1.png');
    this.planets = [planet1];
    this.scene!.add(planet1);
  }

  
  addDesertFloor() {
    const geometry = new THREE.SphereGeometry(4000, 640, 640);
    const material = new THREE.MeshToonMaterial({
        color: 0xffcc66,  // desert sand color
        // flatShading: true
    });

    this.desertSphere = new THREE.Mesh(geometry, material);
    this.desertSphere.rotation.x = Math.PI / 2; // align ground
    this.desertSphere.position.set(0,-4008,0)
    this.scene!.add(this.desertSphere);
  }
  
  createPlanet(radius: number, color: string, position: [number, number, number], texturePath: string): THREE.Mesh {
    // height and width segments provides the number of vertexes for the planet, less = chunkier, smooth is reach around 30
    const heightSegments: number = 30;
    const widthSegments: number = 30;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

      // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load(texturePath); // Load the texture from the path

    const material = new THREE.MeshStandardMaterial({
      // color: color,
      // emissive: color,
      emissiveIntensity: 1,     // brightness of planet
      roughness: 0.5,             // affects shine
      metalness: 0.1,             // level of shine
      wireframe: false,
      map: planetTexture,
      transparent: false,
      opacity: 1.0
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);

    return planet;
  }
}
