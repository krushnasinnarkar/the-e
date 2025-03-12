import { Canvas } from "@react-three/fiber";
import Book from "./components/book"
import { PageNumbers } from "./components/pageNumbers";
import { Suspense } from "react";

function App() {

  return (
    <>
      <PageNumbers />
      <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Book />
          </Suspense>
        </group>
      </Canvas>
    </>
  )
}

export default App
