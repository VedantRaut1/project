const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/StaySafe")
    .then(() => {
        console.log('mongoose connected');
    })
    .catch((e) => {
        console.log('failed');
    });

// Updated schema to include 'email' field
const logInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Email should be unique
    },
    password: {
        type: String,
        required: true
    }
});

const LogInCollection = mongoose.model('logincollections', logInSchema);

module.exports = LogInCollection;
