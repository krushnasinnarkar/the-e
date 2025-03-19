import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Page component handles the flip animation
function Page({ isFlipped, frontContent, backContent }) {
    const groupRef = useRef();
    const targetRotation = isFlipped ? Math.PI : 0;

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1;
        }
    });

    return (
        <group position={[0.5, 0, 0]} ref={groupRef}>
            {/* Front side container */}
            <group position={[-0.5, 0, 0.01]}>
                {frontContent}
            </group>

            {/* Back side container */}
            <group position={[-0.5, 0, -0.01]} rotation={[0, Math.PI, 0]}>
                {backContent}
            </group>
        </group>
    );
}

// Example custom front component
const CustomFront = () => (
    <group>
        <mesh>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshNormalMaterial />
        </mesh>
    </group>
);

// Example custom back component
const CustomBack = () => (
    <group>
        <mesh>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial color="#e0f0ff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.2, 0.1, 16, 100]} />
            <meshNormalMaterial />
        </mesh>
    </group>
);

export default function FlipPage() {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <Page
                    isFlipped={isFlipped}
                    frontContent={<CustomFront />}
                    backContent={<CustomBack />}
                />
            </Canvas>

            <button
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px 20px',
                    fontSize: '1.2rem',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {isFlipped ? 'Flip Back' : 'Flip Page'}
            </button>
        </div>
    );
}