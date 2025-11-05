/**
 * Generate ICS (iCalendar) file content for events
 * @param eventData - Event data including title, description, dates, location
 * @returns ICS file content as string
 */
export function generateICS(eventData: {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendee?: {
    name: string;
    email: string;
  };
  url?: string;
  uid?: string;
}): string {
  const {
    title,
    description = '',
    startDate,
    endDate,
    location = '',
    organizer,
    attendee,
    url,
    uid
  } = eventData;

  // Format date for ICS (YYYYMMDDTHHMMSSZ)
  function formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  // Escape text for ICS format
  function escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  // Generate unique ID if not provided
  const eventUid = uid || `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@equalityvanguard.org`;

  // Build ICS content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Equality Vanguard//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${eventUid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : '',
    location ? `LOCATION:${escapeText(location)}` : '',
    url ? `URL:${url}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE'
  ];

  // Add organizer if provided
  if (organizer) {
    lines.push(`ORGANIZER;CN="${escapeText(organizer.name)}":mailto:${organizer.email}`);
  }

  // Add attendee if provided
  if (attendee) {
    lines.push(`ATTENDEE;CN="${escapeText(attendee.name)}";RSVP=TRUE:mailto:${attendee.email}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  // Filter out empty lines and join
  return lines.filter(line => line !== '').join('\r\n');
}

/**
 * Generate ICS file buffer for email attachments
 */
export function generateICSBuffer(eventData: Parameters<typeof generateICS>[0]): Buffer {
  return Buffer.from(generateICS(eventData), 'utf-8');
}

/**
 * Generate ICS file for download
 */
export function generateICSFile(eventData: Parameters<typeof generateICS>[0], filename?: string): {
  content: string;
  filename: string;
  buffer: Buffer;
} {
  const content = generateICS(eventData);
  const buffer = Buffer.from(content, 'utf-8');
  const file = filename || `event-${eventData.startDate.toISOString().split('T')[0]}.ics`;

  return {
    content,
    filename: file,
    buffer
  };
}

