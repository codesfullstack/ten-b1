const { findPlaces, getWeatherPoint, getWeatherDaily, originRequest, sendContactEmail, getCitiesByCountry, verifyRecaptchaService } = require('../services/weatherService');

async function getPlaces(req, res) {
  const { text } = req.query;
  try {
    const places = await findPlaces(text);
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching places' });
  }
}

async function getWeatherData(req, res) {
  const { lat, lon } = req.query;
  try {
    const weatherData = await getWeatherPoint(lat, lon);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
}

async function getWeatherDailyData(req, res) {
  const { place_id } = req.query;
  try {
    const dailyWeatherData = await getWeatherDaily(place_id);
    res.json(dailyWeatherData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching daily weather data' });
  }
}

async function getOriginRequest(req, res) {
  const { ip } = req.query;
  if (!ip) {
    return res.status(400).json({ error: 'Missing required query parameter: ip' });
  }
  try {
    const originData = await originRequest(ip);
    res.json(originData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching origin data' });
  }
}

async function sendEmail(req, res) {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, or text' });
  }
  try {
    const result = await sendContactEmail(to, subject, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error sending email' });
  }
}

async function getCitiesByCountryController(req, res) {
  const { country } = req.query;
  if (!country) {
    return res.status(400).json({ error: 'Missing required query parameter: country' });
  }
  try {
    const cities = await getCitiesByCountry(country);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    res.status(500).json({ error: 'Error fetching cities by country' });
  }
}

async function verifyRecaptchaController(req, res) {
  const { recaptchaToken } = req.body;
  if (!recaptchaToken) {
    return res.status(400).json({ error: 'Missing reCAPTCHA token' });
  }
  try {
    const verificationResult = await verifyRecaptchaService(recaptchaToken);
    res.json(verificationResult);
  } catch (error) {
    res.status(500).json({ error: 'reCAPTCHA verification failed: ' + error.message });
  }
}

module.exports = {
  getPlaces,
  getWeatherData,
  getWeatherDailyData,
  getOriginRequest,
  sendEmail,
  getCitiesByCountryController,
  verifyRecaptchaController
};