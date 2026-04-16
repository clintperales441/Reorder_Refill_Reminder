(function executeRule(current, previous) {

    function getUserDefaultFrequency(userId) {
        const pref = new GlideRecord('x_1984194_everstoc_user_preference');
        pref.addQuery('sys_user', userId);
        pref.orderByDesc('sys_updated_on');
        pref.setLimit(1);
        pref.query();

        if (pref.next() && pref.default_frequency) {
            return String(pref.default_frequency);
        }

        return 'weekly';
    }

    const reminderTable = 'x_1984194_everstoc_reminder';
    const reminderUserField = 'sys_user';
    const reminderProductField = 'x_1984194_everstoc_product';
    const reminderStateField = 'state';
    const reminderFrequencyField = 'reminder_frequency';
    const reminderNextDateField = 'next_reminder_date';
    const userId = gs.getUserID();
    const productId = current.x_1984194_everstoc_product;

    if (!productId) {
        gs.warn('Create Reminder: skipped because order item has no product. Order item=' + current.getUniqueValue());
        return;
    }

    const existing = new GlideRecord(reminderTable);
    existing.addQuery(reminderUserField, userId);
    existing.addQuery(reminderProductField, productId);
    existing.addQuery(reminderStateField, 1);
    existing.setLimit(1);
    existing.query();

    if (existing.next()) {
        return;
    }

    const reminder = new GlideRecord('x_1984194_everstoc_reminder');
    reminder.initialize();

    reminder[reminderProductField] = productId;
    reminder[reminderUserField] = userId;
    reminder[reminderFrequencyField] = getUserDefaultFrequency(userId);

    const reminderDate = new GlideDateTime();
    reminder[reminderNextDateField] = reminderDate;
    reminder[reminderStateField] = 1;

    reminder.insert();

})(current, previous);