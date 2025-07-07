const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { apiKeys, ipGeolocationApiKey, RECAPTCHA_SECRET_KEY, emailConfig } = require('../config/config');

let apiKeyIndex = 0;
let ipGeolocationApiKeyIndex = 0;
const METEOSOURCE_API_URL = 'https://xxxxxxxxx.xx/api/v1/free';
const IPGEOLOCATION_API_URL = 'https://api.xxxxxxxxx.xx/timezone';

function getApiKey() {
  const key = apiKeys[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  return key;
}

function getIpGeolocationApiKey() {
  if (!Array.isArray(ipGeolocationApiKey) || ipGeolocationApiKey.length === 0) {
    throw new Error('No IP Geolocation API keys available or the API keys configuration is incorrect.');
  }
  const key = ipGeolocationApiKey[ipGeolocationApiKeyIndex];
  ipGeolocationApiKeyIndex = (ipGeolocationApiKeyIndex + 1) % ipGeolocationApiKey.length;
  return key;
}

async function findPlaces(text) {
  try {
    const response = await fetch(`${METEOSOURCE_API_URL}/find_places?text=${text}&key=${getApiKey()}`);
    const data = await response.json();
    if (data.detail && data.detail.includes('Daily amount of requests exceeded')) {
      return await findPlaces(text);
    }
    return data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
}

async function getWeatherPoint(lat, lon) {
  try {
    const response = await fetch(`${METEOSOURCE_API_URL}/point?sections=current,hourly&lat=${lat}&lon=${lon}&language=en&units=auto&key=${getApiKey()}`);
    const data = await response.json();
    if (data.detail && data.detail.includes('Daily amount of requests exceeded')) {
      return await getWeatherPoint(lat, lon);
    }
    return data;
  } catch (error) {
    console.error('Error fetching weather data from API:', error);
    throw error;
  }
}

async function getWeatherDaily(place_id) {
  try {
    const response = await fetch(`${METEOSOURCE_API_URL}/point?place_id=${place_id}&sections=daily&timezone=UTC&language=en&units=metric&key=${getApiKey()}`);
    const data = await response.json();
    if (data.detail && data.detail.includes('Daily amount of requests exceeded')) {
      return await getWeatherDaily(place_id);
    }
    return data;
  } catch (error) {
    console.error('Error fetching daily weather data from API:', error);
    throw error;
  }
}

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

async function originRequest(ip) {
  try {
    const response = await fetch(`https://api.xxxxxxxxx.xx/timezone?apiKey=${ipGeolocationApiKey}&ip=${ip}`);
    const data = await response.json();
    if (!response.ok) {
      console.error(`Error from API: ${data.detail}`);
      throw new Error(`API Error: ${data.detail}`);
    }
    if (data.detail && data.detail.includes('Daily amount of requests exceeded')) {
      return await getIpGeolocation(ip);
    }
    return data;
  } catch (error) {
    console.error('Error fetching IP geolocation data:', error);
    throw error;
  }
}

async function sendContactEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: emailConfig.user,
      to: to,
      subject: subject,
      text: text
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function getCitiesByCountry(country) {
  const url = 'https://xxxxxxxxx.xx/api/v0.1/countries/cities';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ country })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error(`Error from API: ${data.message}`);
      throw new Error(`API Error: ${data.message}`);
    }
    if (data && data.data) {
      data.data.sort((a, b) => a.localeCompare(b));
    }
    return data;
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    throw error;
  }
}

async function verifyRecaptchaService(token) {
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error('reCAPTCHA verification failed: ' + data['error-codes']);
  }
  return data;
}

module.exports = {
  findPlaces,
  getWeatherPoint,
  getWeatherDaily,
  originRequest,
  sendContactEmail,
  getCitiesByCountry,
  verifyRecaptchaService
};