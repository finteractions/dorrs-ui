/** @type {import('next').NextConfig} */
const {parsed: localEnv} = require('dotenv').config({path: '.env'})
const webpack = require('webpack')
const {string} = require("yup");

module.exports = {
    webpack(config) {
        config.plugins.push(new webpack.EnvironmentPlugin(localEnv))

        return config
    },
    async redirects() {
        return [
            {
                source: "/",
                destination: "/login",
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/backend/api/v1/:path*',
                destination: `${process.env.BACKEND_API_URL}:path*/`,
            },
            {
                source: '/ws/',
                destination: `${getWSUrl(process.env.WEBSOCKET_API_URL)}`,
            },
        ]
    },
    images: {
        domains: process.env.IMAGE_DOMAINS ? process.env.IMAGE_DOMAINS.split(',') : [],
    },
    distDir: 'build',
    compress: true,
    generateEtags: true,
    poweredByHeader: false,
    trailingSlash: false
}


function getWSUrl(url) {
    const parsedUrl = new URL(url);
    const scheme = parsedUrl.protocol.replace(':', '');


    if (scheme === 'ws') {
        return url.replace('ws://', 'http://');
    } else if (scheme === 'wss') {
        return url.replace('wss://', 'https://');
    }
}
