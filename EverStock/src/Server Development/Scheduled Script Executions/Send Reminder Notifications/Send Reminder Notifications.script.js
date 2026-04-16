(function() {

    function addFrequencyOffset(gdt, frequency) {
        switch (String(frequency || '').toLowerCase()) {
            case 'daily':
                gdt.addDaysUTC(1);
                break;
            case 'weekly':
                gdt.addDaysUTC(7);
                break;
            case 'biweekly':
                gdt.addDaysUTC(14);
                break;
            case 'monthly':
                gdt.addMonthsUTC(1);
                break;
            case 'quarterly':
                gdt.addMonthsUTC(3);
                break;
            default:
                gdt.addDaysUTC(7);
        }
    }

    function getPreferredChannel(userId) {
        const pref = new GlideRecord('x_1984194_everstoc_user_preference');
        pref.addQuery('sys_user', userId);
        pref.orderByDesc('sys_updated_on');
        pref.setLimit(1);
        pref.query();

        if (pref.next()) {
            if (String(pref.opt_in_reminders) === 'false') {
                return '';
            }

            if (pref.preferred_channel) {
                return String(pref.preferred_channel);
            }
        }

        return 'email';
    }

    function hasUserEmail(userId, reminderId) {
        const user = new GlideRecord('sys_user');
        if (!user.get(userId)) {
            gs.warn('Send Reminder Notifications: email event skipped because user record was not found. user=' + userId + ', reminder=' + reminderId);
            return false;
        }

        const emailAddress = String(user.email || '').trim();
        if (!emailAddress) {
            gs.warn('Send Reminder Notifications: email event skipped because user has no email address. user=' + userId + ', reminder=' + reminderId);
            return false;
        }

        return true;
    }

    const gr = new GlideRecord('x_1984194_everstoc_reminder');

    gr.addQuery('state', 1);
    gr.addQuery('next_reminder_date', '<=', new GlideDateTime());

    gr.query();

    while (gr.next()) {
        const userId = String(gr.sys_user || '');
        const productId = String(gr.x_1984194_everstoc_product || '');
        const channel = getPreferredChannel(userId);

        if (channel) {
            const n = new GlideRecord('x_1984194_everstoc_notification');
            n.initialize();
            n.x_1984194_everstoc_reminder = gr.getUniqueValue();
            n.sys_user = userId;
            n.x_1984194_everstoc_product = productId;
            n.channel = channel;
            n.state = 'sent';
            n.sent_at = new GlideDateTime();
            n.message = 'Time to reorder ' + gr.x_1984194_everstoc_product.getDisplayValue() + '.';
            n.insert();

            if (String(channel) === 'email' && hasUserEmail(userId, gr.getUniqueValue())) {
                gs.eventQueue('x_1984194_everstoc.reminder_due', gr, userId, productId);
            }
        }

        gs.info('Sending reminder for product: ' + gr.x_1984194_everstoc_product.getDisplayValue());

        gr.last_triggered_date = new GlideDateTime().getDate();
        const nextDate = new GlideDateTime();
        addFrequencyOffset(nextDate, gr.reminder_frequency);
        gr.next_reminder_date = nextDate;
        gr.state = 1;
        gr.update();
    }

})();