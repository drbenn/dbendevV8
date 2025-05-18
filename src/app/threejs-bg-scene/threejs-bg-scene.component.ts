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
    this.brightenPlanetsWithAmbientLight();
    this.addStars();
    this.animateScene();
    this.createSpaceCloud();

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

  brightenPlanetsWithAmbientLight(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    this.scene!.add(ambientLight);
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

  // Basic add stars as points
  // addStars() {
  //   const starCount = 20000;
  //   const starVertices = [];

  //   for (let i = 0; i < starCount; i++) {
  //     const x = (Math.random() - 0.5) * 2000;
  //     const y = (Math.random() - 0.5) * 2000;
  //     const z = (Math.random() - 0.5) * 2000; // depth
  //     starVertices.push(x, y, z);
  //   }

  //   const starsGeometry = new THREE.BufferGeometry();
  //   starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

  //   const starsMaterial = new THREE.PointsMaterial({
  //       color: 0xaaaaaa,
  //       size: 2,
  //       sizeAttenuation: true,
  //   });

  //   const stars = new THREE.Points(starsGeometry, starsMaterial);
  //   this.scene!.add(stars);
  // }

  // more enhanced add stars with png texture and glow
  private addStars(): void {
    const starCount = 10000;
    const starVertices = [];
    const starColors = []; // For individual star colors
    const starSizes = [];

    const color = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);

      color.setHSL(Math.random(), 1.0, Math.random() * 0.5 + 0.5); // Vary star colors
      starColors.push(color.r, color.g, color.b);

      starSizes.push(Math.random() * 2 + 1); // Vary star sizes
    }

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starTexture = new THREE.TextureLoader().load('star-glow-2.png'); // Create a soft, circular glow texture

    const starsMaterial = new THREE.PointsMaterial({
      map: starTexture,
    size: 20,                           // Adjust base size
      blending: THREE.AdditiveBlending, // Creates a glow effect
      transparent: true,
      alphaTest: 0.06,                  // Helps with sharp edges in the texture
      sizeAttenuation: true,
      vertexColors: true,               // Use the color attribute
      fog: true
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene!.add(stars);
  }

  // basic material add planets
  addPlanets() {                                    // [x, y, z] - x = 5 left , y = 5 up, z = -5 out
    const planet1 = this.createPlanet(1, '#00ffff', [4, 0, 0], 'planet-textures/dope-planet-texture-11.png');
    const planet2 = this.createPlanet(1.5,  '#ff00ff', [-4, 0, 0], 'planet-textures/dope-planet-texture-15.png');
    const planet3 = this.createPlanet(3, 'yellow', [0, 5, 0], 'planet-textures/dope-planet-texture-5.png');
    this.planets = [planet1, planet2, planet3];
    this.scene!.add(planet1, planet2, planet3);
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
      emissiveIntensity: 0.5,     // brightness of planet
      roughness: 0.2,             // affects shine
      metalness: 0.1,             // level of shine
      wireframe: false,
      map: planetTexture
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);


    
    return planet;
  }

// createPlanet(radius: number, color: string, position: [number, number, number]): THREE.Mesh {
//   const geometry = new THREE.SphereGeometry(radius, 32, 32);
//   const textureLoader = new THREE.TextureLoader();
//   const planetTexture = textureLoader.load('grad-1.png');
//   const material = new THREE.MeshToonMaterial({
//     color: color,
//     emissive: color,
//     emissiveIntensity: 0.5,
//     wireframe: false,
//     // gradientMap: this.createToonGradientTexture(),
//     map: planetTexture, // Add the texture here
//     // You can optionally add a "toon shading" texture (gradient map) here
//     // gradientMap: this.createToonGradientTexture(),
//   });
//   const planet = new THREE.Mesh(geometry, material);
//   planet.position.set(...position);
//   return planet;
// }

// Optional: Function to create a basic toon gradient texture
createToonGradientTexture(): THREE.DataTexture {
  // const size = 16;
  // const data = new Uint8Array(size);

  // for (let i = 0; i < size; i++) {
  //   const v = Math.floor((i / size) * 255);
  //   data[i] = v;
  // }

  // const texture = new THREE.DataTexture(data, size, 1, THREE.RedFormat, THREE.UnsignedByteType);
  // texture.needsUpdate = true;
  // return texture;
  const size = 3;
  const data = new Uint8Array(size);

  data[0] = 0;   // Dark
  data[1] = 128; // Medium
  data[2] = 255; // Light

  const texture = new THREE.DataTexture(data, size, 1, THREE.RedFormat, THREE.UnsignedByteType);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter; // Important for sharp steps
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

  private cloudParticlesInitialDirection: boolean = true;
  animateScene = () => {
    if (!this.scene || !this.camera || !this.renderer) return;

    this.animationFrameId = requestAnimationFrame(this.animateScene);

    this.planets.forEach(planet => {
      planet.rotation.y += 0.005;
      planet.rotation.x += 0.005;
    });

    // Optionally update particle positions or the cloud's rotation here
    if (this.cloudParticles) {
      if (this.cloudParticlesInitialDirection) {
        this.cloudParticles.rotation.x += 0.00003;
        this.cloudParticles.rotation.y += 0.00003;
        this.cloudParticles.rotation.z += 0.00003;
        if (this.cloudParticles.rotation.x > 0.004) {
          this.cloudParticlesInitialDirection = false;
        }
      } else {
        this.cloudParticles.rotation.x -= 0.00003;
        this.cloudParticles.rotation.y -= 0.00003;
        this.cloudParticles.rotation.z -= 0.00003;
        if (this.cloudParticles.rotation.x < -0.004) {
          this.cloudParticlesInitialDirection = true;
        }
      }    
    }

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

  initialCameraPosition = new THREE.Vector3(0, 5, 25);
  targetPositions = [
    new THREE.Vector3(12, 0, -1),
    new THREE.Vector3(-8, 4, -2),
    new THREE.Vector3(0, 12, 8),
    new THREE.Vector3(0, 5, 15)
  ];
  targetLookAt = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ];

  cloudParticles!: THREE.Points;
  cloudMaterial!: THREE.ShaderMaterial;
  cloudGeometry!: THREE.BufferGeometry;



  async loadGradientTexture(): Promise<any> {
  const textureLoader = new THREE.TextureLoader();
  try {
    // Assuming you have an image file named 'teal-purple-blue-gradient.png' in your assets
    const texture = await textureLoader.loadAsync('teal-purple-blue-gradient-trans-2.png');
    return texture;
  } catch (error) {
    console.error('Error loading gradient texture:', error);
    return null;
  }
}

  async createSpaceCloud() {
    const numParticles = 80; // Increase for a denser cloud
    this.cloudGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const sizes = new Float32Array(numParticles);
    const alphas = new Float32Array(numParticles); // For individual particle opacity

    const mainColor = new THREE.Color(0xffffff); // Base color
    const cloudCenter = new THREE.Vector3(20, -50, -50); // Center of the cloud
    const cloudRadius = 5; // Overall size of the cloud

    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3;

      // 1. More Clustered Particle Distribution (Example: Spherical with some variation)
      const p = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize().multiplyScalar(cloudRadius * Math.random()); // Vary distance from center


      // 2. Apply the cloudCenter offset here
      positions[i3] = p.x + cloudCenter.x;
      positions[i3 + 1] = p.y + cloudCenter.y;
      positions[i3 + 2] = p.z + cloudCenter.z;

      // 3. Particle Size Variation
      sizes[i] = Math.random() * 2 + 20;    // 2 + 0.5 OG

      // 4. Initial Color (can be influenced by position later in the shader)
      mainColor.setHSL(Math.random() * 0.3 + 0.5, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5); // Teal-Purple-Blue range
      colors[i3] = mainColor.r;
      colors[i3 + 1] = mainColor.g;
      colors[i3 + 2] = mainColor.b;

      // 5. Initial Alpha (can be modulated by texture in the shader)
      alphas[i] = Math.random() * 0.8 + 10.2; // Some variation in base opacity        // ALSO BRIGHTNESS OF CLOUD 1.2 OG
    }

    this.cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.cloudGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.cloudGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.cloudGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1)); // Add alpha attribute

    const gradientTexture = await this.loadGradientTexture();

    this.cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: gradientTexture },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float alpha;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = textureColor;
          gl_FragColor.rgb *= vColor;
          gl_FragColor.a *= vAlpha; // Apply individual particle alpha

          // Use the brightness of the texture to fade out edges
          float brightness = dot(textureColor.rgb, vec3(0.299, 0.587, 0.114));
          gl_FragColor.a *= smoothstep(0.1, 0.8, brightness); // Adjust thresholds for fade
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    this.cloudParticles = new THREE.Points(this.cloudGeometry, this.cloudMaterial);
    this.scene!.add(this.cloudParticles);

    // You might want to animate the cloud's position or the particles over time
  }

}
