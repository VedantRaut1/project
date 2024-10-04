const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const transporter = require('./emailConfig'); // Import your Nodemailer transporter
const app = express();
const LogInCollection = require('./mongo'); // MongoDB model for user data
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '../templates');
const publicPath = path.join(__dirname, '../public');

app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.static(publicPath));

// GET Routes
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
    res.render('home', {
        naming: req.query.name,
        title: "Stay Safe",
        aboutText: "Welcome to our Women’s Therapy page, a safe and supportive space dedicated to empowering women on their journey to mental well-being...",
        communityText: "Join our online community...",
        services: [
            { name: "Individual Therapy", image: "/assets/img/pexels-d-ng-nhan-324384-1510149.jpg" },
            { name: "Couple Therapy", image: "/assets/img/pexels-rdne-6669872.jpg" },
            { name: "Online Therapy", image: "/assets/img/onlinepexels-vlada-karpovich-4050389.jpg" },
            { name: "Community Sessions", image: "/assets/img/grpcommpexels-shvetsa-4226122.jpg" }
        ],
        therapists: [
            { id: 1, name: "Priya Kashyap", specialization: "Clinical Psychologist", description: "Expert in diagnosing and treating mental health disorders, offering evidence-based therapy...", image: "/assets/img/wmn6360_F_636698674_DroChEj5eWmZiaZOSDMnj8hcDqqw74Fp.jpg" },
            { id: 2, name: "Akriti Nehwal", specialization: "Marriage Counsellor", description: "Specializing in relationship dynamics, have helped couples strengthen their bond...", image: "/assets/img/wmn5360_F_679509191_FQW7KbRAaHVkCryRlomSQXOeM354SdJY.jpg" },
            { id: 3, name: "Raveena Pandit", specialization: "Therapy Practitioner", description: "Providing a safe space for emotional healing, where individuals can share, grow, and find support together.", image: "/assets/img/wmn8.jpg" },
            { id: 4, name: "Mahima Patel", specialization: "Life Coach", description: "Guiding patients towards personal growth and fulfillment while helping them navigate life's challenges.", image: "/assets/img/wmn9.jpg" }
        ]
    });
});

// Removed /therapists route

app.get('/book/:therapistId', (req, res) => {
    const therapistId = req.params.therapistId;
    const therapistName = therapistId == 1 ? 'Priya Kashyap' : therapistId == 2 ? 'Akriti Nehwal' : therapistId == 3 ? 'Raveena Pandit' : 'Mahima Patel';
    res.render('bookingForm', { therapistId, therapistName });
});

app.get('/appointments', (req, res) => {
    const status = req.query.status; // Check the query parameter

    // Render different messages based on the status
    if (status === 'success') {
        res.render('appointments', { message: 'Your appointment has been booked successfully. Please Check your mail.' });
    } else {
        // Render default view if no status or other status
        res.render('appointments', { message: '' });
    }
});
app.post('/signup', async (req, res) => {
    try {
        const existingUser = await LogInCollection.findOne({ email: req.body.email });

        if (existingUser) {
            // Render the signup page again with an error message
            return res.render('signup', { error: "User details already exist" });
        }

        const data = new LogInCollection({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        await data.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Error occurred during signup");
    }
});
app.post('/login', async (req, res) => {
    try {
        const user = await LogInCollection.findOne({ email: req.body.email });

        if (user && user.password === req.body.password) {
            res.status(201).redirect(`/home?name=${user.name}`);
        } else {
            // Render the login page again with an error message
            return res.render('login', { error: "Incorrect email or password" });
        }
    } catch (error) {
        res.status(500).send("An error occurred during login");
    }
});
app.post('/book', async (req, res) => {
    try {
        const { therapistId, therapistName, date, time, userEmail } = req.body;

        // Fetch the user's email from the database using the provided userEmail
        const user = await LogInCollection.findOne({ email: userEmail }); // Adjust as needed to fetch by user identifier

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Create a Google Calendar event URL
        const startTime = new Date(`${date} ${time}`).toISOString();
        const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(); // Assuming 1 hour duration

        const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment%20with%20${encodeURIComponent(therapistName)}&dates=${startTime.replace(/[-:]/g, '').replace(/\..+/, '')}/${endTime.replace(/[-:]/g, '').replace(/\..+/, '')}&details=Your%20appointment%20is%20confirmed%20with%20${encodeURIComponent(therapistName)}%20on%20${date}%20at%20${time}&location=Your%20Location`;

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email, // Use the fetched user's email
            subject: 'Appointment Confirmation',
            text: `Your appointment with ${therapistName} is confirmed for ${date} at ${time}. You can add this appointment to your Google Calendar using the following link: ${calendarLink}`
        };

        await transporter.sendMail(mailOptions);

        // Render the appointments page with a success status
        res.render('bookingForm', { message: 'Your appointment has been booked successfully.' });
    } catch (error) {
        console.error('Error occurred during booking:', error);
        // Render the appointments page with an error status
        res.render('bookingForm', { message: 'Error occurred while booking your appointment.' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
