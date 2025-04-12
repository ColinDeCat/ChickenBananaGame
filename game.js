const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Game constants
const WIDTH = 800;
const HEIGHT = 600;
const PLAYER_SIZE = 50;
const CHICKEN_SIZE = 40;
const BANANA_SIZE = 10;
const PLAYER_SPEED = 5;
const BANANA_SPEED = 10;
const CHICKEN_SPEED = 2;

// Game variables
let scene, camera, renderer;
let player, bow, arrow;
let chickens = [];
let score = 0;
let arrowFlying = false;
let currentArrow = null;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // First-person view height

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5f0b });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Create bow
    const bowGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
    const bowMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    bow = new THREE.Mesh(bowGeometry, bowMaterial);
    bow.position.set(0.3, -0.2, -0.5);
    camera.add(bow);
    scene.add(camera);

    // Create arrow
    const arrowGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5);
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0, 0, -0.5);
    bow.add(arrow);

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', shootArrow);
    window.addEventListener('resize', onWindowResize);

    // Start spawning chickens
    setInterval(spawnChicken, 2000);

    // Start animation loop
    animate();
}

// Handle mouse movement
function onMouseMove(event) {
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    camera.rotation.y -= movementX * 0.002;
    camera.rotation.x -= movementY * 0.002;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
}

// Shoot arrow
function shootArrow() {
    if (arrowFlying) return;
    arrowFlying = true;

    // Create new arrow
    const arrowGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5);
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    currentArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    currentArrow.rotation.copy(arrow.rotation);
    currentArrow.position.copy(arrow.position);
    currentArrow.position.applyMatrix4(bow.matrixWorld);
    scene.add(currentArrow);

    // Remove arrow from bow
    arrow.visible = false;

    // Arrow physics
    const arrowSpeed = 0.5;
    const arrowDirection = new THREE.Vector3(0, 0, -1);
    arrowDirection.applyQuaternion(camera.quaternion);

    function animateArrow() {
        if (!currentArrow) return;

        currentArrow.position.add(arrowDirection.clone().multiplyScalar(arrowSpeed));

        // Check for collisions with chickens
        chickens.forEach((chicken, index) => {
            if (currentArrow && chicken.position.distanceTo(currentArrow.position) < 0.5) {
                // Hit a chicken
                scene.remove(chicken);
                chickens.splice(index, 1);
                scene.remove(currentArrow);
                currentArrow = null;
                score += 10;
                document.getElementById('info').textContent = `Score: ${score}`;
                return;
            }
        });

        // Remove arrow if it goes too far
        if (currentArrow && currentArrow.position.length() > 50) {
            scene.remove(currentArrow);
            currentArrow = null;
        }

        if (currentArrow) {
            requestAnimationFrame(animateArrow);
        } else {
            arrowFlying = false;
            arrow.visible = true;
        }
    }

    animateArrow();
}

// Spawn chicken
function spawnChicken() {
    const chickenGeometry = new THREE.SphereGeometry(0.3);
    const chickenMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    const chicken = new THREE.Mesh(chickenGeometry, chickenMaterial);
    
    // Random position
    chicken.position.set(
        (Math.random() - 0.5) * 20,
        0.3,
        (Math.random() - 0.5) * 20
    );
    
    scene.add(chicken);
    chickens.push(chicken);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move chickens
    chickens.forEach(chicken => {
        chicken.position.x += (Math.random() - 0.5) * 0.02;
        chicken.position.z += (Math.random() - 0.5) * 0.02;
    });

    renderer.render(scene, camera);
}

// Start the game
init(); 