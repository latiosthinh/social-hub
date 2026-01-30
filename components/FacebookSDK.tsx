'use client';

import Script from 'next/script';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

export function FacebookSDK() {
    return (
        <>
            <Script
                id="facebook-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.fbAsyncInit = function() {
                            FB.init({
                                appId      : '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
                                cookie     : true,
                                xfbml      : true,
                                version    : 'v19.0'
                            });
                        };
                    `,
                }}
            />
            <Script
                id="facebook-jssdk"
                strategy="afterInteractive"
                src="https://connect.facebook.net/en_US/sdk.js"
            />
        </>
    );
}
