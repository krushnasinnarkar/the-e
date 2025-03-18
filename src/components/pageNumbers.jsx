import { atom, useAtom } from "jotai";
import './pageNumbers.css';

export const pageAtom = atom(0);

export const pages = [
    {
        component: "book-cover",
        pagecolor: "white"
    },
    {
        component: "page1",
        pagecolor: "violet"
    },
    {
        component: "page2",
        pagecolor: "pink"
    },
    {
        component: "book-back",
        pagecolor: "blue"
    },
];

export const PageNumbers = () => {
    const [page, setPage] = useAtom(pageAtom);
    return (
        <main className="page-numbers-main">
            <div className="page-numbers-wrapper">
                <div className="page-numbers-buttons">
                    {[...pages].map((_, index) => (
                        <button
                            key={index}
                            className={`page-numbers-button ${index === page ? "active" : "inactive"
                                }`}
                            onClick={() => setPage(index)}
                        >
                            {index === 0 ? "Cover" : `Page ${index}`}
                        </button>
                    ))}
                    <button
                        className={`page-numbers-button ${page === 4 ? "active" : "inactive"
                            }`}
                        onClick={() => setPage(4)}
                    >
                        Back Cover
                    </button>
                </div>
            </div>
        </main>
    );
};
