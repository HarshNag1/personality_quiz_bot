document.addEventListener('DOMContentLoaded', () => {
    // Create wave elements
    const waveContainer = document.querySelector('.wave-container');
    
    if (!waveContainer) return;
    
    // Create floating shapes
    const floatingShapes = document.getElementById('floatingShapes');
    const shapeCount = 15;
    
    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        shape.classList.add('floating-shape');
        
        // Random shape type
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) shape.classList.add('circle');
        else if (shapeType === 1) shape.classList.add('square');
        else shape.classList.add('triangle');
        
        // Random position
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        
        // Random size
        const size = Math.random() * 30 + 10;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // Random animation duration
        shape.style.animationDuration = `${Math.random() * 20 + 10}s`;
        
        // Random delay
        shape.style.animationDelay = `${Math.random() * 5}s`;
        
        // Random opacity
        shape.style.opacity = Math.random() * 0.3 + 0.1;
        
        floatingShapes.appendChild(shape);
    }
    
    // Create particles
    const particleContainer = document.getElementById('particleContainer');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random size
        const size = Math.random() * 5 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random animation duration
        particle.style.animationDuration = `${Math.random() * 30 + 10}s`;
        
        // Random delay
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particleContainer.appendChild(particle);
    }
});
