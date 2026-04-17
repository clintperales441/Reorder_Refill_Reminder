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

    function resolveOrderUserId(orderId) {
        if (!orderId) {
            return '';
        }

        const order = new GlideRecord('x_1984194_everstoc_order');
        if (order.get(orderId)) {
            return String(order.sys_user || '');
        }

        return '';
    }

    function getDefaultReminderDate(productId) {
        const date = new GlideDateTime();
        let daysToAdd = 7;

        if (productId) {
            const product = new GlideRecord('x_1984194_everstoc_product');
            if (product.get(productId)) {
                const configuredDays = parseInt(String(product.default_reorder_days || '0'), 10);
                if (!isNaN(configuredDays) && configuredDays > 0) {
                    daysToAdd = configuredDays;
                }
            }
        }

        date.addDaysUTC(daysToAdd);
        return date;
    }

    const reminderTable = 'x_1984194_everstoc_reminder';
    const reminderUserField = 'sys_user';
    const reminderProductField = 'x_1984194_everstoc_product';
    const reminderStateField = 'state';
    const reminderFrequencyField = 'reminder_frequency';
    const reminderNextDateField = 'next_reminder_date';
    const orderId = String(current.x_1984194_everstoc_order || '');
    const userId = resolveOrderUserId(orderId) || String(current.sys_user || gs.getUserID() || '');
    const productId = String(current.x_1984194_everstoc_product || '');

    if (!userId || !productId) {
        gs.warn('Create Reminder: skipped because user or product is missing. Order item=' + current.getUniqueValue());
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

    const reminderDate = getDefaultReminderDate(productId);
    reminder[reminderNextDateField] = reminderDate;
    reminder[reminderStateField] = 1;

    reminder.insert();

})(current, previous);