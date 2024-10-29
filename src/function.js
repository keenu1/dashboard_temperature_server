//generate UTC Zulu time datesting and random number
const generateUtcDateStringWithRandomNumber = () => {
    const currentDate = new Date(); // Create a new Date object for the current date and time
    const utcDateString = currentDate.toISOString().slice(0, 19) + 'Z'; // Convert to UTC date string
    const randomNumber = Math.floor(Math.random() * 100) + 1; // Generate a random number between 1 and 100
    return { utcDateString, randomNumber }; // Return both values as an object
}

module.exports = { generateUtcDateStringWithRandomNumber }








