/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import { getNextWeekday } from "../repeatedEvents";

describe('getNextWeekday', () => {
    const normalizeDate = (date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0); // Reset time to start of the day
        return normalized;
    };

    test('should return the next Monday from a given date', () => {
        const startDate = new Date('2024-09-01'); // Monday
        const dayOfWeek = 1; // Monday

        const result = getNextWeekday(startDate, dayOfWeek);
        const expected = new Date('2024-09-02'); 
       
        expect(normalizeDate(result)).toEqual(normalizeDate(expected));
    });

    test('should return the next Wednesday from a given date', () => {
        const startDate = new Date('2024-08-26'); // Monday
        const dayOfWeek = 3; // Wednesday

        const result = getNextWeekday(startDate, dayOfWeek);
        const expected = new Date('2024-08-28'); // The next Wednesday

        expect(normalizeDate(result)).toEqual(normalizeDate(expected));
    });

    test('should return the next Friday from a given date', () => {
        const startDate = new Date('2024-08-26'); // Monday
        const dayOfWeek = 5; // Friday

        const result = getNextWeekday(startDate, dayOfWeek);
        const expected = new Date('2024-08-30'); // The next Friday

        expect(normalizeDate(result)).toEqual(normalizeDate(expected));
    });

    test('should return the next Sunday from a given date', () => {
        const startDate = new Date('2024-08-26'); // Monday
        const dayOfWeek = 0; // Sunday

        const result = getNextWeekday(startDate, dayOfWeek);
        const expected = new Date('2024-09-01'); // The next Sunday

        expect(normalizeDate(result)).toEqual(normalizeDate(expected));
    });

    test('should handle the case where the target day is today', () => {
        const startDate = new Date('2024-08-26'); // Monday
        const dayOfWeek = 1; // Monday

        const result = getNextWeekday(startDate, dayOfWeek);
        const expected = new Date('2024-08-26'); // The same Monday

        expect(normalizeDate(result)).toEqual(normalizeDate(expected));
    });

    test('should handle a date that is the end of the week', () => {
        const startDate = new Date('2024-08-30'); // Friday
        const dayOfWeek = 0; // Sunday

        const result = getNextWeekday(startDate, dayOfWeek);
        const expected = new Date('2024-09-01'); // The next Sunday

        expect(normalizeDate(result)).toEqual(normalizeDate(expected));
    });
});