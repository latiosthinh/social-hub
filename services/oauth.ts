import axios from 'axios';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
// Ensure this matches your Facebook App settings. Next.js usually runs on 3000.
// If your existing app used /oauth/facebook/callback, we should try to match that.
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/oauth/facebook/callback';

export const getFacebookAuthUrl = (state: string) => {
    const scopes = ['public_profile', 'email'];
    // Add 'pages_manage_posts', 'pages_read_engagement' if we want page access later
    return `https://www.facebook.com/v24.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes.join(',')}&state=${state}&response_type=code`;
};

export const exchangeFacebookCode = async (code: string) => {
    const tokenUrl = `https://graph.facebook.com/v24.0/oauth/access_token`;
    const params = {
        client_id: FACEBOOK_APP_ID,
        client_redirect_uri: REDIRECT_URI,
        client_secret: FACEBOOK_APP_SECRET,
        code: code,
    };

    const response = await axios.get(tokenUrl, { params });
    return response.data; // { access_token, token_type, expires_in }
};

export const getFacebookProfile = async (accessToken: string) => {
    const url = `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await axios.get(url) as any;
    return response.data;
};

export const extendFacebookToken = async (shortLivedToken: string) => {
    const tokenUrl = `https://graph.facebook.com/v24.0/oauth/access_token`;
    const params = {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedToken,
    };
    const response = await axios.get(tokenUrl, { params });
    return response.data; // { access_token, token_type, expires_in }
};
