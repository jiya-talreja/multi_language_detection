import React from 'react';
import Particles from './Particles';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#f5f3f0] pointer-events-none">
      <Particles
        particleCount={400}
        particleSpread={12}
        speed={0.1}
        particleColors={["#7c3aed", "#3b82f6", "#ec4899", "#10b981"]} 
        moveParticlesOnHover
        particleHoverFactor={2}
        alphaParticles={true}
        particleBaseSize={100}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
        pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
      />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(245,243,240,0.4)_100%)] pointer-events-none" />
    </div>
  );
};

export default Background;
