import {GetServerSideProps} from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const host = context.req.headers.host?.split(':')[0];
    return {
        props: {
            host,
        },
    };
};
