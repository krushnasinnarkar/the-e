import { Html, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef, useState } from "react";
import { Bone, BoxGeometry, Color, Float32BufferAttribute, MeshStandardMaterial, Quaternion, Skeleton, SkeletonHelper, SkinnedMesh, SRGBColorSpace, Uint16BufferAttribute, Vector3, Euler } from "three";
import { degToRad, MathUtils } from "three/src/math/MathUtils.js";

const lerpFactor = 0.05;

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");

const pageMaterials = [
    new MeshStandardMaterial({
        color: whiteColor,
    }),
    new MeshStandardMaterial({
        color: "#111",
    }),
    new MeshStandardMaterial({
        color: whiteColor,
    }),
    new MeshStandardMaterial({
        color: whiteColor,
    }),
];

const Page = ({ number, pagecolor, page, opened, bookClosed, isActive, ...props }) => {
    const group = useRef();
    const turnedAt = useRef(0);
    const lastOpened = useRef(opened);
    const skinnedMeshRef = useRef();
    const [showFront, setShowFront] = useState(true);
    const zPosition = -number * PAGE_DEPTH + page * PAGE_DEPTH
    const contentRef = useRef();


    const manualSkinnedMesh = useMemo(() => {
        const bones = [];
        for (let i = 0; i <= PAGE_SEGMENTS; i++) {
            let bone = new Bone();
            bones.push(bone);
            if (i === 0) {
                bone.position.x = 0;
            } else {
                bone.position.x = SEGMENT_WIDTH;
            }
            if (i > 0) {
                bones[i - 1].add(bone);
            }
        }
        const skeleton = new Skeleton(bones);

        const materials = [...pageMaterials,
        new MeshStandardMaterial({
            color: pagecolor,
        }),
        new MeshStandardMaterial({
            color: pagecolor,
        }),
        ];
        const mesh = new SkinnedMesh(pageGeometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);
        return mesh;
    }, []);

    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) return;

        const bones = skinnedMeshRef.current.skeleton.bones;
        if (lastOpened.current !== opened) {
            turnedAt.current = +new Date();
            lastOpened.current = opened;
        }
        let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
        turningTime = Math.sin(turningTime * Math.PI);

        let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
        if (!bookClosed) {
            targetRotation += degToRad(number * 0.8);
        }

        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];
            const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
            const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
            const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
            let rotationAngle =
                insideCurveStrength * insideCurveIntensity * targetRotation -
                outsideCurveStrength * outsideCurveIntensity * targetRotation +
                turningCurveStrength * turningIntensity * targetRotation;
            let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
            if (bookClosed) {
                if (i === 0) {
                    rotationAngle = targetRotation;
                    foldRotationAngle = 0;
                } else {
                    rotationAngle = 0;
                    foldRotationAngle = 0;
                }
            }
            easing.dampAngle(
                target.rotation,
                "y",
                rotationAngle,
                easingFactor,
                delta
            );

            const foldIntensity =
                i > 8
                    ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
                    : 0;
            easing.dampAngle(
                target.rotation,
                "x",
                foldRotationAngle * foldIntensity,
                easingFactorFold,
                delta
            );
        }


        // const rotationY = group.current.rotation.y;
        // setShowFront(rotationY > -Math.PI / 2 && rotationY < Math.PI / 2);

        const quaternion = new Quaternion();
        const euler = new Euler();
        group.current.getWorldQuaternion(quaternion);
        euler.setFromQuaternion(quaternion);

        // Normalize rotation between -π and π
        let normalizedRotation = ((euler.y + Math.PI) % (Math.PI * 2)) - Math.PI;
        // setShowFront(normalizedRotation > -Math.PI / 2 && normalizedRotation < Math.PI / 2);
        if (number == 0) {
            setShowFront(normalizedRotation > -Math.PI / 2 && normalizedRotation < Math.PI / 2);
        } else if (number % 2 === 0) {
            setShowFront(normalizedRotation > 0);
        } else {
            setShowFront(normalizedRotation < 0);
        }
    });

    return (
        <group
            {...props}
            ref={group}
            position-z={zPosition}
        >
            <primitive
                object={manualSkinnedMesh}
                ref={skinnedMeshRef}
                position-z={zPosition}
            />
            {isActive && (
                <>
                    {/* Front Content */}
                    <Html
                        position={[PAGE_WIDTH / 2, 0, PAGE_DEPTH / 2 + 0.001]}
                        rotation={[0, 0, 0]}
                        transform
                        style={{
                            visibility: showFront ? 'visible' : 'hidden',
                            pointerEvents: 'none',
                            transition: 'visibility 0.2s'
                        }}
                    >
                        <div className="page-content">
                            {`Page ${number} front`}
                        </div>
                    </Html>
                    {/* Back Content */}
                    <Html
                        position={[PAGE_WIDTH / 2, 0, -PAGE_DEPTH / 2 - 0.001]}
                        rotation={[0, Math.PI, 0]}
                        transform
                        style={{
                            visibility: !showFront ? 'visible' : 'hidden',
                            pointerEvents: 'none',
                            transition: 'visibility 0.2s'
                        }}
                    >
                        <div className="page-content">
                            {`Page ${number} back`}
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
};

export default Page