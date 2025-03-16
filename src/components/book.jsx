import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useAtom } from "jotai";
import Page from "./page"
import { pageAtom, pages } from "./pageNumbers";
import { useEffect, useState } from "react";

function Book() {
    const [page] = useAtom(pageAtom);
    const [delayedPage, setDelayedPage] = useState(page);

    useEffect(() => {
        let timeout;
        const goToPage = () => {
            setDelayedPage((delayedPage) => {
                if (page === delayedPage) {
                    return delayedPage;
                } else {
                    timeout = setTimeout(
                        () => {
                            goToPage();
                        },
                        Math.abs(page - delayedPage) > 2 ? 50 : 150
                    );
                    if (page > delayedPage) {
                        return delayedPage + 1;
                    }
                    if (page < delayedPage) {
                        return delayedPage - 1;
                    }
                }
            });
        };
        goToPage();
        return () => {
            clearTimeout(timeout);
        };
    }, [page]);

    return (
        <>
            <group
                rotation-y={-Math.PI / 2}
            >
                {[...pages].map((pageData, index) => (
                    <Page
                        // position-x={index * 0.15}
                        key={index}
                        number={index}
                        page={delayedPage}
                        opened={delayedPage > index}
                        bookClosed={delayedPage === 0 || delayedPage === pages.length}
                        {...pageData}
                    />
                ))}
            </group>
            {/* <OrbitControls /> */}
            {/* <Environment preset="studio"></Environment> */}
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
