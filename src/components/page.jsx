import { useRef } from "react";

const Page = ({ number, ...props }) => {
    const group = useRef();
    return (
        <group ref={group} {...props}>
            <mesh scale={0.1}>
                <boxGeometry />
                <meshStandardMaterial color="red" />
            </mesh>
        </group>
    );
};

export default Page
