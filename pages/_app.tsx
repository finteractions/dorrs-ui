import '@/styles/globals.scss'
import '@/styles/font-face.scss'
import '@/styles/fonts/fonts.css'
import '@/styles/style.scss'
import '@/styles/icon.scss'
import '@/styles/backend.scss'
import '@/styles/custom.scss'

import { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { setGlobalConfig } from '@/utils/global-config';
import { AuthUserProvider } from '@/contextes/auth-user-context';
import Head from 'next/head';
import { Router } from 'next/router';
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import {AuthAdminProvider} from "@/contextes/auth-admin-context";

config.autoAddCss = false

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout<P = {}, IP = P> = AppProps<P> & {
    Component: NextPageWithLayout<P, IP>;
    router: Router;
};

const appHost = typeof window !== 'undefined' ? window.location.host.split(':')[0] : '';
setGlobalConfig({ host: appHost });

function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = (Component.getLayout ?? ((page) => page)) as (page: ReactElement) => ReactNode;

    return (
        <AuthUserProvider>
            <AuthAdminProvider>
                {getLayout(<Component {...pageProps} />)}
            </AuthAdminProvider>
        </AuthUserProvider>
    );
}

function Application({ Component, pageProps, router }: AppPropsWithLayout) {
    return (
        <>
            <Head>
                <title>{process.env.APP_TITLE}</title>
            </Head>
            <App Component={Component} pageProps={pageProps} router={router} />
        </>
    );
}

export default Application;
