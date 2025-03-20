/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import { generateRepeatedEvents } from '../../utils/repeatedEvents';
import { guid } from '../help';

describe('generateRepeatedEvents', () => {
  const baseEvent = {
    event_id: guid(),
    category_id: 'cat1',
    location: 'New York',
    title: 'Test Event',
    description: 'Test Description',
    startTime: new Date('2024-09-01T09:00:00'),
    endTime: new Date('2024-09-01T17:00:00'),
    date: new Date('2024-09-01'),
    repeat_event_id: guid(),
    notificationId: 'notif001',
  };
  
  it('should handle daily repeats correctly', () => {
    const event = {
      ...baseEvent,
      isRepeating: 1,
      repeatFrequency: 'daily',
      repeatStartDate: new Date('2024-09-01'),
      repeatEndDate: new Date('2024-09-07')
    };
    const events = generateRepeatedEvents(event);
    expect(events).toHaveLength(7);
    expect(events[0].date).toEqual(new Date('2024-09-01'));
    expect(events[4].date).toEqual(new Date('2024-09-05'));
  });

  it('should handle weekly repeats correctly', () => {
     const repeatDaysOfWeek = [1,3,5]
    const event = {
      ...baseEvent,
      isRepeating: 1,
      repeatFrequency: 'weekly',
      repeatDaysOfWeek: repeatDaysOfWeek.join(), 
      repeatStartDate: new Date('2024-09-01'), 
      repeatEndDate: new Date('2024-09-08')
    };
   
    const events = generateRepeatedEvents(event);
    expect(events).toHaveLength(3);
    expect(events[0].date).toEqual(new Date('2024-09-02')); // First Monday
    expect(events[1].date).toEqual(new Date('2024-09-04')); // First Wednesday
    expect(events[2].date).toEqual(new Date('2024-09-06')); // First Friday
  });

  it('should handle monthly repeats on specific day of month', () => {
    const event = {
      ...baseEvent,
      isRepeating: 1,
      repeatFrequency: 'monthly',
      repeatDayOfMonth: 15,
      repeatStartDate: new Date('2024-09-01'),
      repeatEndDate: new Date('2024-11-31')
    };
    const events = generateRepeatedEvents(event);

    console.log(events)

    expect(events).toHaveLength(3);
    expect(events[0].date).toEqual(new Date('2024-09-14T23:00:00.000Z'));
    expect(events[1].date).toEqual(new Date('2024-10-14T23:00:00.000Z'));
    expect(events[2].date).toEqual(new Date('2024-11-15T00:00:00.000Z'));
  });

  it('should handle non-repeating events', () => {
    const event = {
      ...baseEvent,
      isRepeating: 0
    };
    const events = generateRepeatedEvents(event);
    expect(events).toHaveLength(0); // Assuming non-repeating events return an empty array
  });

  // Add more tests as needed to cover all cases
});
