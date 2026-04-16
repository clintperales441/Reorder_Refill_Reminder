const nextReminderField = current.isValidField('next_reminder_date') ? 'next_reminder_date' : 'u_next_reminder_date';
const stateField = current.isValidField('state') ? 'state' : 'u_state';
const gdt = new GlideDateTime(current[nextReminderField]);
gdt.addDaysUTC(3);

current[nextReminderField] = gdt;
current[stateField] = current.isValidField('state') ? 1 : 'snoozed';

current.update();

action.setRedirectURL(current);