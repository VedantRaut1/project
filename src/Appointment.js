// Add this to your existing routes in the server file

const Appointment = require('./Appointment'); // Adjust the path to your Appointment model

// Endpoint to fetch available time slots for a specific therapist and date
app.get('/available-slots/:therapistId/:date', async (req, res) => {
    const { therapistId, date } = req.params;
    const selectedDate = new Date(date);

    try {
        // Find booked appointments for the selected therapist and date
        const bookedAppointments = await Appointment.find({
            therapistId: therapistId,
            date: { $eq: selectedDate }
        });

        // Generate all possible time slots (assuming 10 AM to 5 PM, every 30 minutes)
        const allSlots = generateTimeSlots();
        const bookedSlots = bookedAppointments.map(appointment => appointment.time);

        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        res.json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate all time slots
function generateTimeSlots() {
    const slots = [];
    for (let hour = 10; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`; // Format HH:MM
            slots.push(time);
        }
    }
    return slots;
}
