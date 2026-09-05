const express = require('express');
const cron = require('node-cron');
const Reminder = require('../models/reminder');

const app = express(); // <-- Yeh line missing thi

const users = [];

//routes
app.get('/users', (req, res) => {
    res.json(users);
});

function scheduleReminder(reminder) {
    console.log("i have to complete my project ");
}

cron.schedule('*/5 * * * * *', () => {
    scheduleReminder();
});

