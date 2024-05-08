import {Html, Head, Main, NextScript} from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta charSet="utf-8"/>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
                <meta name="format-detection" content="telephone=no"/>

                <meta property="og:title" content=""/>
                <meta property="og:description" content=""/>
                <meta name="description" content=""/>
                <link rel="shortcut icon" href="/img/favicon.png" type="image/png"/>
            </Head>
            <body className="b-container">
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
