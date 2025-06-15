import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { log } from 'three/src/nodes/TSL.js';

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

  onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        this.moveLeft = true;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        this.moveRight = true;
    }
};

onKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        this.moveLeft = false;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        this.moveRight = false;
    }
};

  private scene: THREE.Scene | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private orbitControls: OrbitControls | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private initialCameraPosition = new THREE.Vector3(0, 5, 25);
  private cameraOffset = new THREE.Vector3(0, 6, -12); // position behind car
  private cameraLookAtOffset = new THREE.Vector3(0, 2, 0); // where camera looks on the car
  private isCameraFollowing = true;

  private planets: THREE.Mesh[] = [];
  private animationFrameId: number | null = null;

  private car: THREE.Object3D | null = null;
  private desertSphere: THREE.Mesh | null = null;
  private clock = new THREE.Clock();

  // car movement props
  private moveLeft = false;
  private moveRight = false;
  private carSpeed = .2;
  private carTurnSpeed = 0.075;

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
    // this.addDesertFloor();
    this.addBackgroundGradient();
    this.addDesertPlane();
    this.addDustEffect();


    this.animateScene();

    // Listen for key events
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  ngOnDestroy(): void {
    if (this.mount.nativeElement && this.renderer) {
      this.mount.nativeElement.removeChild(this.renderer.domElement);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.orbitControls?.dispose();
  }

  maxCarTurn: number = 0.4;
  
  animateScene = () => {
    // if (!this.scene || !this.camera || !this.renderer) return;

    // this.animationFrameId = requestAnimationFrame(this.animateScene);

    // this.planets.forEach(planet => {
    //   planet.rotation.y += 0.005;
    //   planet.rotation.x += 0.005;
    // });

    // this.orbitControls?.update();
    // this.renderer!.render(this.scene!, this.camera!);

    if (!this.scene || !this.camera || !this.renderer) return;

    this.animationFrameId = requestAnimationFrame(this.animateScene);

    const elapsed = this.clock.getElapsedTime();

    // Rotate desert slowly
    // if (this.desertSphere) {
    //     this.desertSphere.rotation.z += 0.0005;
    // }

    // Animate car wheels / dust later here...

    // Camera animation
    // if (elapsed > 20 && elapsed < 25) {
    //     // Slowly interpolate camera to side view
    //     const t = (elapsed - 10) / 10;
    //     this.camera!.position.lerp(new THREE.Vector3(10, 3, 0), 0.02); // move right
    //     this.orbitControls!.target.lerp(new THREE.Vector3(0, 1, 0), 0.02); // aim at car center
    // }

    this.handleAnimateCarTurn();

    if (this.car) {
      const carPosition = new THREE.Vector3();
      this.car!.getWorldPosition(carPosition);

      // carQuat position currently unncessary, quaternion position tracks rotation
      // const carQuatPosition = new THREE.Quaternion();
      // this.car.getWorldQuaternion(carQuatPosition);

      const cameraOffsetFromCar = new THREE.Vector3(0, 3, 12);
      const offsetCameraPosition = carPosition.clone().add(cameraOffsetFromCar);
      this.camera.position.lerp(offsetCameraPosition, 0.1);

      // must not only update lookAt for the camera, but also the target/lookAt for the orbit controls, since orbit controls have been enabled.
      
      // introduce carPositionOffset to make camera look more toward horizon
      const cameraLookAtOffsetFromCar = new THREE.Vector3(0, 5.5, 1);
      const cameraLookAtWithOffset = carPosition.clone().add(cameraLookAtOffsetFromCar);
      
      this.camera.lookAt(cameraLookAtWithOffset);
      this.orbitControls?.target.copy(cameraLookAtWithOffset);
    }

    this.orbitControls?.update();
    this.renderer!.render(this.scene!, this.camera!);
  };

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.set(this.initialCameraPosition.x, this.initialCameraPosition.y, this.initialCameraPosition.z);
    this.scene!.add(this.camera);
  }
  


  
  loadCarModel() {
    const loader = new GLTFLoader();
    loader.load('models/ae86/toyota_AE86.glb', (gltf) => {
      // declare car model and adjust model scale and rotate, as car is facing toward by default when created in blender.
      const carModel = gltf.scene;
      const carScale: number = 0.4;
      carModel.scale.set(carScale, carScale, carScale);
      carModel.rotation.y = Math.PI; // turn 180 degrees forward

      // create carGroup object to place carModel in so that rotations and directions do not need to be inverted/whatever all over the scene.
      let carGroup: THREE.Object3D = new THREE.Object3D();
      carGroup.add(carModel);
      carGroup.position.set(0, -8.00, 8);
      this.car = carGroup;

      // add correctly oriented carGroup with rotated carModel contained as car for scene animations and cameras to interact with.
      this.scene?.add(this.car);
    });
  }

  addDesertPlane() {
    const geometry = new THREE.PlaneGeometry(1000, 1000, 4, 4);

    const material = new THREE.MeshToonMaterial({
        color: 0xffcc66, // desert sand color
        gradientMap: null // optional, can add gradient texture if desired
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2; // make it horizontal
    plane.position.y = -8.1; // adjust to match car Y position

    this.scene!.add(plane);
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
    dust.position.set(-3.1, -8.2, 8.6); // rear left wheel (adjust!)
    this.scene!.add(dust);

    // Store reference for animation if desired
}
























































  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true  });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.mount.nativeElement.appendChild(this.renderer.domElement);
  }

  setOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera!, this.renderer!.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.1;
    this.orbitControls.target.set(0, 0, 0);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    // const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene!.add(ambientLight);
  }
  
  addPointLight() {
    const pointLight = new THREE.PointLight(0xffffff, 2500, 0, 1.5);
    pointLight.position.set(0, 10, 100);
    this.scene!.add(pointLight);
  }

  addPlanets() {                                    // [x, y, z] - x = 5 left , y = 5 up, z = -5 out
    const planet1 = this.createPlanet(1, '#00ffff', [4, 0, 0], 'planet-textures/dope-planet-texture-23.png');
    // const planet2 = this.createPlanet(1.5,  '#ff00ff', [-4, 0, 0], 'planet-textures/dope-planet-texture-7.png');
    // const planet3 = this.createPlanet(3, 'yellow', [0, 5, 0], 'planet-textures/purple-planet-texture-1.png');
    this.planets = [planet1];
    this.scene!.add(planet1);
  }

  
  // addDesertFloor() {
  //   const geometry = new THREE.SphereGeometry(4000, 640, 640);
  //   const material = new THREE.MeshToonMaterial({
  //       color: 0xffcc66,  // desert sand color
  //       // flatShading: true
  //   });

  //   this.desertSphere = new THREE.Mesh(geometry, material);
  //   this.desertSphere.rotation.x = Math.PI / 2; // align ground
  //   this.desertSphere.position.set(0,-4008,0)
  //   this.scene!.add(this.desertSphere);
  // }
  
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


  private handleAnimateCarTurn(): void {
    // Move car forward + left/right
    if (this.car) {
      // Move forward constantly
      this.car.position.z -= this.carSpeed;

      // Move left/right
      if (this.moveLeft) {
        // mover car to the left smoothly, quickly at first and then slower until maxCarTurn
        if (this.car.rotation.y <= this.maxCarTurn / 2) {
          this.car.rotation.y += 0.03;
        } else if (this.car.rotation.y < this.maxCarTurn) {
          this.car.rotation.y += 0.015;
        } else {
          this.car.rotation.y = this.maxCarTurn;
        }
      } else if (this.moveRight) {
        // mover car to the left smoothly, quickly at first and then slower until maxCarTurn
        if (this.car.rotation.y >= -(this.maxCarTurn / 2)) {
          this.car.rotation.y -= 0.03;
        } else if (this.car.rotation.y > -this.maxCarTurn) {
          this.car.rotation.y -= 0.015;
        } else {
          this.car.rotation.y = -this.maxCarTurn;
        }
      } else {
        // smoothly return car to center over time
        if (this.car.rotation.y > 0.1) {
          this.car.rotation.y -= 0.1;
        } else if (this.car.rotation.y < -0.1) {
          this.car.rotation.y += 0.1;
        }
      }
    }
  }
}
