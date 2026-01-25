import axios from 'axios';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth/facebook/callback';

export const getFacebookAuthUrl = (state: string) => {
    const scopes = ['public_profile', 'email'];
    // Add 'pages_manage_posts', 'pages_read_engagement' if we want page access later
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes.join(',')}&state=${state}&response_type=code`;
};

export const exchangeFacebookCode = async (code: string) => {
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
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
    const response = await axios.get(url);
    return response.data;
};
