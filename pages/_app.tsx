import '@/styles/globals.scss'
import '@/styles/font-face.scss'
import '@/styles/fonts/fonts.css'
import 'react-dates/lib/css/_datepicker.css';
import '@/styles/icon.scss'
import '@/styles/custom.scss'
import "@/styles/home.scss"

import {ReactElement, ReactNode} from 'react';
import type {NextPage} from 'next';
import type {AppProps} from 'next/app';
import {setGlobalConfig} from '@/utils/global-config';
import {AuthUserProvider} from '@/contextes/auth-user-context';
import Head from 'next/head';
import {Router} from 'next/router';
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import {AuthAdminProvider} from "@/contextes/auth-admin-context";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

config.autoAddCss = false

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
    layoutName: string,
    logo?:string | null
};

type AppPropsWithLayout<P = {}, IP = P> = AppProps<P> & {
    Component: NextPageWithLayout<P, IP>;
    router: Router;
};

const appHost = typeof window !== 'undefined' ? window.location.host.split(':')[0] : '';
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || '');
setGlobalConfig({host: appHost});

function App({Component, pageProps}: AppPropsWithLayout) {
    const getLayout = (Component.getLayout ?? ((page) => page)) as (page: ReactElement) => ReactNode;

    return (
        <AuthUserProvider>
            <AuthAdminProvider>
                <Elements stripe={stripePromise}>
                {getLayout(<Component {...pageProps} />)}
                </Elements>
            </AuthAdminProvider>
        </AuthUserProvider>
    );
}

async function loadZone(Component: NextPageWithLayout): Promise<void> {

    const styleImports: Promise<void>[] = [];

    switch (Component?.layoutName) {
        case "HomeLayout":
            styleImports.push(import(("@/styles/home.scss")));
            break;
        case "PortalLayout":
        case "PublicLayout":
            styleImports.push(import(("@/styles/light.scss")));
            styleImports.push(import(("@/styles/dark.scss")));
            styleImports.push(import(("@/styles/portal.scss")));
            styleImports.push(import(("@/styles/form.scss")));
            break;
        case "BackendLayout":
            styleImports.push(import(("@/styles/light.scss")));
            styleImports.push(import(("@/styles/backend.scss")));
            styleImports.push(import(("@/styles/form.scss")));
            break;
    }

    await Promise.all(styleImports);
}

function Application({Component, pageProps, router}: AppPropsWithLayout) {
    loadZone(Component);

    return (
        <>
            <Head>
                <title>{process.env.APP_TITLE}</title>
            </Head>
            <App Component={Component} pageProps={pageProps} router={router}/>
        </>
    );
}

export default Application;
