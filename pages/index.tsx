import { useEffect } from 'react';

const Home = () => {
    useEffect(() => {
        const currentUrl = window.location.href;
        const urlObject = new URL(currentUrl);
        window.location.href = `${urlObject.protocol}//${urlObject.hostname}`;
    }, []);

    return null;
};

export default Home;

