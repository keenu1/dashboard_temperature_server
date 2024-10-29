
// function.test.js
const { generateUtcDateStringWithRandomNumber } = require('../function');

//cek the generatefunction date utc and random number
describe('generateUtcDateStringWithRandomNumber', () => {
    it('should return the correct UTC date string and a random number', () => {
        const mockDate = new Date('2024-10-27T12:00:00Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const result = generateUtcDateStringWithRandomNumber();

        expect(result).toEqual({
            utcDateString: '2024-10-27T12:00:00Z',
            randomNumber: 51,
        });

        jest.restoreAllMocks();
    });
});
