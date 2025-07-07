const express = require('express');
const router = express.Router();
const { getPlaces, getWeatherData, getWeatherDailyData, getOriginRequest, sendEmail, getCitiesByCountryController, verifyRecaptchaController } = require('../controllers/weatherController');

router.get('/places', getPlaces);
router.get('/point', getWeatherData);
router.get('/daily', getWeatherDailyData);
router.get('/origin', getOriginRequest);
router.post('/contact', sendEmail);
router.post('/cities', getCitiesByCountryController);
router.post('/verify-recaptcha', verifyRecaptchaController);

module.exports = router;