document.addEventListener('DOMContentLoaded', () => {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    document.querySelector('.animated-background').appendChild(canvas);
    
    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Particle class
    class Particle {
        constructor(x, y, size, color, speed) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.speed = speed;
            this.direction = Math.random() * Math.PI * 2; // Random direction
            this.velocity = {
                x: Math.cos(this.direction) * this.speed,
                y: Math.sin(this.direction) * this.speed
            };
            this.alpha = Math.random() * 0.5 + 0.1; // Random opacity
            this.originalSize = size;
            this.growthFactor = Math.random() * 0.02 - 0.01; // Random growth/shrink
        }
        
        update() {
            // Move particle
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) {
                this.velocity.x *= -1;
            }
            
            if (this.y < 0 || this.y > canvas.height) {
                this.velocity.y *= -1;
            }
            
            // Slowly change size
            this.size += this.growthFactor;
            
            // Reverse growth if too big or too small
            if (this.size < this.originalSize * 0.5 || this.size > this.originalSize * 1.5) {
                this.growthFactor *= -1;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Connection class
    class Connection {
        constructor(p1, p2) {
            this.p1 = p1;
            this.p2 = p2;
        }
        
        draw() {
            const distance = Math.sqrt(
                Math.pow(this.p1.x - this.p2.x, 2) + 
                Math.pow(this.p1.y - this.p2.y, 2)
            );
            
            // Only draw connections if particles are close enough
            const maxDistance = 200;
            if (distance < maxDistance) {
                // Calculate opacity based on distance
                const opacity = 1 - (distance / maxDistance);
                
                // Draw line between particles
                ctx.beginPath();
                ctx.moveTo(this.p1.x, this.p1.y);
                ctx.lineTo(this.p2.x, this.p2.y);
                ctx.strokeStyle = `rgba(66, 133, 244, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    // Create particles
    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100); // Responsive particle count
    const colors = [
        'rgba(66, 133, 244, 0.7)',  // Google Blue
        'rgba(219, 68, 55, 0.7)',   // Google Red
        'rgba(244, 180, 0, 0.7)',   // Google Yellow
        'rgba(15, 157, 88, 0.7)'    // Google Green
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 8 + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speed = Math.random() * 0.5 + 0.1;
        
        particles.push(new Particle(x, y, size, color, speed));
    }
    
    // Mouse interaction
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    // Animation loop
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Mouse interaction - push particles away
            if (mouse.x && mouse.y) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    
                    particles[i].x += Math.cos(angle) * force * 2;
                    particles[i].y += Math.sin(angle) * force * 2;
                }
            }
            
            // Draw connections between particles
            for (let j = i + 1; j < particles.length; j++) {
                const connection = new Connection(particles[i], particles[j]);
                connection.draw();
            }
        }
        
        // Request next frame
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
