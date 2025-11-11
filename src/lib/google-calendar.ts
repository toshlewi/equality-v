import { google } from 'googleapis';

export interface CalendarEvent {
  summary: string;
  description: string;
  location?: string;
  startDateTime: string; // ISO 8601 format
  endDateTime: string; // ISO 8601 format
  attendees?: string[]; // Array of email addresses
  timezone?: string;
}

export interface CalendarEventResponse {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  icsContent?: string;
  error?: string;
}

class GoogleCalendarClient {
  private calendar: any;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = false;
    this.initialize();
  }

  private initialize() {
    try {
      const serviceAccountJson = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON;
      
      if (!serviceAccountJson) {
        console.warn('Google Calendar not configured: GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON not set');
        return;
      }

      const credentials = JSON.parse(serviceAccountJson);
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.isConfigured = true;
      
      console.log('Google Calendar client initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Calendar client:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Check if Google Calendar is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Create a calendar event
   */
  async createEvent(eventData: CalendarEvent): Promise<CalendarEventResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Google Calendar is not configured'
      };
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const event = {
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timezone || 'Africa/Nairobi',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timezone || 'Africa/Nairobi',
        },
        attendees: eventData.attendees?.map(email => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: 'all', // Send email invites to attendees
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    eventId: string,
    eventData: Partial<CalendarEvent>
  ): Promise<CalendarEventResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Google Calendar is not configured'
      };
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const event: any = {};
      if (eventData.summary) event.summary = eventData.summary;
      if (eventData.description) event.description = eventData.description;
      if (eventData.location) event.location = eventData.location;
      if (eventData.startDateTime) {
        event.start = {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timezone || 'Africa/Nairobi',
        };
      }
      if (eventData.endDateTime) {
        event.end = {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timezone || 'Africa/Nairobi',
        };
      }
      if (eventData.attendees) {
        event.attendees = eventData.attendees.map(email => ({ email }));
      }

      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        resource: event,
        sendUpdates: 'all',
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<CalendarEventResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Google Calendar is not configured'
      };
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate ICS file content for email attachment
   */
  generateICS(eventData: CalendarEvent): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Equality Vanguard//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(eventData.startDateTime)}`,
      `DTEND:${formatDate(eventData.endDateTime)}`,
      `SUMMARY:${eventData.summary}`,
      `DESCRIPTION:${eventData.description.replace(/\n/g, '\\n')}`,
      eventData.location ? `LOCATION:${eventData.location}` : '',
      `UID:${Date.now()}@equalityvanguard.org`,
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Event Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');

    return icsContent;
  }
}

// Export singleton instance
export const googleCalendarClient = new GoogleCalendarClient();

// Export convenience functions
export async function createCalendarEvent(eventData: CalendarEvent): Promise<CalendarEventResponse> {
  return googleCalendarClient.createEvent(eventData);
}

export async function updateCalendarEvent(
  eventId: string,
  eventData: Partial<CalendarEvent>
): Promise<CalendarEventResponse> {
  return googleCalendarClient.updateEvent(eventId, eventData);
}

export async function deleteCalendarEvent(eventId: string): Promise<CalendarEventResponse> {
  return googleCalendarClient.deleteEvent(eventId);
}

export function generateICSFile(eventData: CalendarEvent): string {
  return googleCalendarClient.generateICS(eventData);
}

export function isGoogleCalendarConfigured(): boolean {
  return googleCalendarClient.isReady();
}

export default googleCalendarClient;
