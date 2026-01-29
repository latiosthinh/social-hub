const axios = require('axios');

async function testLogin() {
    try {
        const email = 'test' + Date.now() + '@example.com';
        console.log('Testing login with:', email);
        const res = await axios.post('http://localhost:3000/api/auth/login', { email });
        console.log('Response Status:', res.status);
        console.log('Response Data:', res.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
