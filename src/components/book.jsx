import Page from "./page"

function Book() {

    return (
        <>
            <group>
                {Array.from({ length: 4 }).map((_, index) => (
                    <Page
                        key={index}
                        number={index}
                        position-x={index * 0.15}
                    />
                ))}
            </group>
            <directionalLight
                position={[2, 5, 2]}
                intensity={2.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0001}
            />
            <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial transparent opacity={0.2} />
            </mesh>
        </>
    )
}

export default Book
