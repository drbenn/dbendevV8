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
  @HostListener('window:resize', ['$event'])
	onResize(event: any) {
      if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
	// 	console.log(event);
  //   const divWidth: number = this.rendererContainer.nativeElement.clientWidth;
  //   const aspectRatio: number = 4/3;
  //   this.renderer.setSize(divWidth, divWidth / aspectRatio);
  //   // this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight);
  //     if (this.camera && this.camera.position) {
  //       this.camera.position.z = 1000;
  // }
  }

  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private planets: THREE.Mesh[] = [];
  private animationFrameId: number | null = null;

  constructor() {
    this.animateCamera = this.animateCamera.bind(this);
  }

  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.setOrbitControls();
    this.addBackground();
    this.addAmbientLight();
    this.addPointLight();
    this.addPlanets();
    this.addStars();
    this.animateScene();

    // original resize
    // const handleResize = () => {
    //     if (this.camera && this.renderer) {
    //         this.camera.aspect = window.innerWidth / window.innerHeight;
    //         this.camera.updateProjectionMatrix();
    //         this.renderer.setSize(window.innerWidth, window.innerHeight);
    //     }
    // };
    // window.addEventListener('resize', handleResize);
  }

  ngOnDestroy(): void {
    // window.removeEventListener('resize', handleResize);
    if (this.mount.nativeElement && this.renderer) {
      this.mount.nativeElement.removeChild(this.renderer.domElement);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls?.dispose();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(this.initialCameraPosition.x, this.initialCameraPosition.y, this.initialCameraPosition.z);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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

  addBackground() {
    const canvas = this.renderer!.domElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#000046');
        this.renderer!.setClearColor('gradient');
    } else {
        this.renderer!.setClearColor('#000006'); // general background of space
    }
  }
  addAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene!.add(ambientLight);
  }
  
  addPointLight() {
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 5, 5);
    this.scene!.add(pointLight);
  }

  addStars() {
    const starCount = 2000;
    const starVertices = [];

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000; // depth
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
    this.scene!.add(stars);
  }

  addPlanets() {                                    // [x, y, z] - x = 5 left , y = 5 up, z = -5 out
    const planet1 = this.createPlanet(1, '#00ffff', [4, 0, 0]);
    const planet2 = this.createPlanet(1.5, '#ff00ff', [-4, 0, 0]);
    const planet3 = this.createPlanet(2, 'yellow', [0, 5, 0]);
    this.planets = [planet1, planet2, planet3];
    this.scene!.add(planet1, planet2, planet3);
  }

  createPlanet(radius: number, color: string, position: [number, number, number]): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,     // brightness of planet
      roughness: 0.2,             // affects shine
      metalness: 0.1,             // level of shine
      wireframe: true,
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    return planet;
  }

  animateScene = () => {
    if (!this.scene || !this.camera || !this.renderer) return;

    this.animationFrameId = requestAnimationFrame(this.animateScene);

    this.planets.forEach(planet => {
      planet.rotation.y += 0.005;
      planet.rotation.x += 0.005;
    });

    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };

  handlePlanetClick() {
    const ctx = this.renderer!.domElement.getContext('2d')
    console.log(ctx);
    const domEl = this.renderer!.domElement;
    console.log(domEl);
    
    
    if (this.isTransitioning) return;
    this.currentPlanetIndex = (this.currentPlanetIndex + 1) % this.targetPositions.length;
    this.animateCamera(this.targetPositions[this.currentPlanetIndex], this.targetLookAt[this.currentPlanetIndex]);
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
        console.log('progress: ', progress)
        

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
            // this.controls?.reset();  // will return to original scene camera location
        }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  logCamera() {
    console.log(this.camera?.position);
    
  }

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

}
