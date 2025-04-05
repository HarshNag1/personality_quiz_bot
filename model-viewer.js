// Import required libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';

class ModelViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.controls = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.morphTargetDictionary = null;
        this.morphTargetInfluences = null;
        this.isLoading = true;

        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(0, 1.6, 1); // Position camera closer to face
        this.camera.lookAt(0, 1.6, 0);

        // Setup lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 2, 2);
        this.scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-1, 1, 1);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 2, -2);
        this.scene.add(rimLight);

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 1.8;
        this.controls.minPolarAngle = Math.PI / 2.5;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.rotateSpeed = 0.5;
        this.controls.target.set(0, 1.6, 0);

        // Show loading message
        this.showLoadingMessage();

        // Load model
        this.loadModel();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start animation loop
        this.animate();
    }

    showLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'model-loading';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 1.2em;
            text-align: center;
            background: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
        `;
        loadingDiv.innerHTML = 'Loading 3D Model...';
        this.container.appendChild(loadingDiv);
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        // Load a more realistic avatar model
        loader.load(
            'https://models.readyplayer.me/6475c19df85e632a69c3d87a.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);

                // Setup animations
                this.mixer = new THREE.AnimationMixer(this.model);
                
                // Find the head mesh for morph targets
                this.model.traverse((node) => {
                    if (node.isMesh && node.morphTargetDictionary) {
                        this.morphTargetDictionary = node.morphTargetDictionary;
                        this.morphTargetInfluences = node.morphTargetInfluences;
                    }
                });

                // Center and position model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.x = -center.x;
                this.model.position.z = -center.z;
                this.model.position.y = 0;

                // Remove loading message
                const loadingDiv = document.getElementById('model-loading');
                if (loadingDiv) {
                    loadingDiv.remove();
                }
                
                this.isLoading = false;
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                const loadingDiv = document.getElementById('model-loading');
                if (loadingDiv) {
                    loadingDiv.innerHTML = `Loading 3D Model... ${percent}%`;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
                const loadingDiv = document.getElementById('model-loading');
                if (loadingDiv) {
                    loadingDiv.innerHTML = 'Error loading model. Please refresh the page.';
                }
            }
        );
    }

    updateMorphTargets(expression) {
        if (!this.morphTargetInfluences || !this.morphTargetDictionary) return;

        // Reset all morph targets
        for (let i = 0; i < this.morphTargetInfluences.length; i++) {
            this.morphTargetInfluences[i] = 0;
        }

        // Map visemes to morph targets
        const morphTargets = {
            'A': ['viseme_A', 'mouthOpen'],
            'B': ['viseme_B', 'mouthSmile'],
            'C': ['viseme_C', 'mouthShrugUpper'],
            'D': ['viseme_D', 'mouthFunnel'],
            'E': ['viseme_E', 'mouthPucker'],
            'F': ['viseme_F', 'mouthShrugLower'],
            'G': ['viseme_G', 'jawOpen'],
            'H': ['viseme_H', 'tongueOut']
        };

        if (expression in morphTargets) {
            morphTargets[expression].forEach(target => {
                if (target in this.morphTargetDictionary) {
                    this.morphTargetInfluences[this.morphTargetDictionary[target]] = 1;
                }
            });
        }
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }

        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

export default ModelViewer;