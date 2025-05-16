import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'threejs-bg-scene',
  imports: [],
  templateUrl: './threejs-bg-scene.component.html',
  styleUrl: './threejs-bg-scene.component.scss'
})
export class ThreejsBgSceneComponent implements OnInit, OnDestroy {

  @ViewChild('mount', { static: true }) mount!: ElementRef<HTMLDivElement>;

  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private planets: THREE.Mesh[] = [];
  private animationFrameId: number | null = null;

  currentPlanetIndex = -1;
  isTransitioning = false;

  initialCameraPosition = new THREE.Vector3(0, 5, 15);
  targetPositions = [
    new THREE.Vector3(4, 0, 2),
    new THREE.Vector3(-4, 0, 2),
    new THREE.Vector3(0, 4, 2),
    new THREE.Vector3(0, 5, 15)
  ];
  targetLookAt = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ];

  constructor() {
        this.animateCamera = this.animateCamera.bind(this);
  }

  createPlanet(radius: number, color: string, position: [number, number, number]): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.2,
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    return planet;
  }

    animateCamera = (targetPosition: THREE.Vector3, targetLookAtPoint: THREE.Vector3) => {
        if (!this.camera || !this.controls) return;

        this.isTransitioning = true;
        const { position, quaternion } = this.camera;
        const startPosition = new THREE.Vector3().copy(position);
        const startQuaternion = this.camera.quaternion.clone();
        const targetQuaternion = new THREE.Quaternion();

        const dummy = new THREE.Object3D();
        dummy.position.copy(targetPosition);
        dummy.lookAt(targetLookAtPoint);
        targetQuaternion.copy(dummy.quaternion);

        let startTime = 0;
        const duration = 2000;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;
            const progress = Math.min(1, elapsed / duration);

            // position.lerpVectors(startPosition, targetPosition, progress);
            // quaternion.slerp(startQuaternion, targetQuaternion, progress);
            // this.controls!.target.lerp(targetLookAtPoint, targetLookAtPoint, progress);

            position.lerpVectors(startPosition, targetPosition, progress);
            quaternion.slerp(startQuaternion, progress);
            this.controls!.target.lerpVectors(this.controls!.target, targetLookAtPoint, progress); // Use lerpVectors

            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                this.isTransitioning = false;
                this.controls?.reset();
            }
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

  handlePlanetClick() {
    if (this.isTransitioning) return;

    this.currentPlanetIndex = (this.currentPlanetIndex + 1) % this.targetPositions.length;
    this.animateCamera(this.targetPositions[this.currentPlanetIndex], this.targetLookAt[this.currentPlanetIndex]);
  }

  ngOnInit(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(this.initialCameraPosition.x, this.initialCameraPosition.y, this.initialCameraPosition.z);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.mount.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 0, 0);

    const canvas = this.renderer.domElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(1, '#000046');
            this.renderer.setClearColor('gradient');
        } else {
            this.renderer.setClearColor('#000000');
        }

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);

    const planet1 = this.createPlanet(1, '#00ffff', [4, 0, 0]);
    const planet2 = this.createPlanet(1.5, '#ff00ff', [-4, 0, 0]);
    const planet3 = this.createPlanet(2, '#ffff00', [0, 4, 0]);
    this.planets = [planet1, planet2, planet3];
    this.scene.add(planet1, planet2, planet3);

    const starCount = 2000;
        const starVertices = [];

        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        const starsGeometry = new THREE.BufferGeometry();
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 2,
            sizeAttenuation: true,
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);

    const animate = () => {
      if (!this.scene || !this.camera || !this.renderer) return;

      this.animationFrameId = requestAnimationFrame(animate);

      this.planets.forEach(planet => {
        planet.rotation.y += 0.005;
        planet.rotation.x += 0.005;
      });

      this.controls?.update();
      this.renderer.render(this.scene, this.camera);
    };

    animate();

    const handleResize = () => {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    this.ngOnDestroy = () => {
      window.removeEventListener('resize', handleResize);
      if (this.mount.nativeElement && this.renderer) {
        this.mount.nativeElement.removeChild(this.renderer.domElement);
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.controls?.dispose();
    };
  }

  ngOnDestroy(): void {
        // Implemented in ngOnInit
  }






  //   private renderer = new THREE.WebGLRenderer();
//   private scene!: THREE.Scene;
//   private camera!: THREE.PerspectiveCamera;
//   private cube: any;
//   @ViewChild('rendererContainer') rendererContainer!: ElementRef;
//   @HostListener('window:resize', ['$event'])
// 	onResize(event: any) {
// 		console.log(event);
//     const divWidth: number = this.rendererContainer.nativeElement.clientWidth;
//     const aspectRatio: number = 4/3;
// this.renderer.setSize(divWidth, divWidth / aspectRatio);
// // this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight);
//   if (this.camera && this.camera.position) {
//     this.camera.position.z = 1000;

//   }
// 	}



//   constructor() {}

//   ngOnInit(): void {
//     // basic scene
//     // this.scene = new THREE.Scene();
//     // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000); // Field of View(deg)/ Aspect Ratio/ near clipping pane / far clipping pane
//     // this.camera.position.z = 1000;
    
//     // add wireframe box
//     // const geometry = new THREE.BoxGeometry(200, 200, 200);
//     // const material = new THREE.MeshBasicMaterial({color: 0x0000FF, wireframe: true});
//     // this.cube = new THREE.Mesh(geometry, material);

//     // this.scene.add(this.cube);
//     this.createScene()
//   }


// ngAfterViewInit() {
//   // this.createScene()
//     this.createNebulae(); // Function to generate nebulae
//     this.createPlanets(); // Function to create planets
//     this.startRendering();
//     // this.renderer.setSize(window.innerWidth, window.innerHeight);
//     this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight);
//     console.log(this.rendererContainer.nativeElement.clientHeight);
//     console.log(this.rendererContainer.nativeElement.clientWidth);

//     this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
//     this.animateCube();
// }

// private createScene(): void {
//   this.scene = new THREE.Scene();
//   this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 10000)
//   this.camera.position.z = 10;
//   this.renderer = new THREE.WebGLRenderer({ canvas: this.rendererContainer.nativeElement });
//   this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight);
// }

// animateCube() {
//     window.requestAnimationFrame(() => this.animateCube());
//     this.cube.rotation.x += 0.01;
//     this.cube.rotation.y += 0.02;
//     this.renderer.render(this.scene, this.camera);
// }


// private createNebulae(): void {
//     const particleCount = 20000;
//     const positions = new Float32Array(particleCount * 3);
//     const colors = new Float32Array(particleCount * 3);
//     const sizes = new Float32Array(particleCount);

//     const colorPalette = [
//       new THREE.Color(0x008080), // Teal
//       new THREE.Color(0x0000FF), // Blue
//       new THREE.Color(0x800080), // Purple
//       new THREE.Color(0xFF69B4), // Pink (for variation)
//     ];

//     for (let i = 0; i < particleCount; i++) {
//       const i3 = i * 3;
//       positions[i3] = (Math.random() - 0.5) * 200; // Random X in a volume
//       positions[i3 + 1] = (Math.random() - 0.5) * 200; // Random Y
//       positions[i3 + 2] = (Math.random() - 0.5) * 200; // Random Z

//       const color = colorPalette[Math.floor(Math.random() * colorPalette.length)].clone();
//       // You could add logic here to create gradients based on position
//       colors[i3] = color.r;
//       colors[i3 + 1] = color.g;
//       colors[i3 + 2] = color.b;

//       sizes[i] = Math.random() * 2 + 0.5; // Random size
//     }

//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
//     geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

//     const material = new THREE.PointsMaterial({
//       size: 0.1,
//       vertexColors: true,
//       opacity: 0.7,
//       transparent: true,
//       blending: THREE.AdditiveBlending,
//     });

//     const nebula = new THREE.Points(geometry, material);
//     this.scene.add(nebula);
//   }

//   private createPlanets(): void {
//     // ... planet creation logic (spheres, textures, materials, positioning)
//   }

//   private startRendering(): void {
//     const animate = () => {
//       requestAnimationFrame(animate);
//       // ... any animation updates
//       this.renderer.render(this.scene, this.camera);
//     };
//     animate();
//   }
}
