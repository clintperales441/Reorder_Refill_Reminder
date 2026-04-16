(function executeRule(current, previous) {

	if (current.operation() !== 'insert') {
		return;
	}

	if (!current.isValidField('state') || String(current.state) !== '1') {
		return;
	}

	const userId = String(current.sys_user || '');
	const productId = String(current.x_1984194_everstoc_product || '');

	if (!userId) {
		gs.warn('Send Reminder Notification: skipped because reminder has no user. reminder=' + current.getUniqueValue());
		return;
	}

	function getPreferredChannel(sysUser) {
		const pref = new GlideRecord('x_1984194_everstoc_user_preference');
		pref.addQuery('sys_user', sysUser);
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

	function queueEmail(reminderRecord, channelValue) {
		if (String(channelValue) !== 'email') {
			return;
		}

		const user = new GlideRecord('sys_user');
		if (!user.get(userId)) {
			gs.warn('Send Reminder Notification: email event skipped because user record was not found. user=' + userId + ', reminder=' + reminderRecord.getUniqueValue());
			return;
		}

		const emailAddress = String(user.email || '').trim();
		if (!emailAddress) {
			gs.warn('Send Reminder Notification: email event skipped because user has no email address. user=' + userId + ', reminder=' + reminderRecord.getUniqueValue());
			return;
		}

		gs.eventQueue('x_1984194_everstoc.reminder_due', reminderRecord, userId, productId);
	}

	const channel = getPreferredChannel(userId);
	if (!channel) {
		return;
	}

	const notification = new GlideRecord('x_1984194_everstoc_notification');
	notification.initialize();
	notification.x_1984194_everstoc_reminder = current.getUniqueValue();
	notification.sys_user = userId;
	notification.x_1984194_everstoc_product = productId;
	notification.channel = channel;
	notification.state = 'sent';
	notification.sent_at = new GlideDateTime();
	notification.message = 'Time to reorder ' + current.x_1984194_everstoc_product.getDisplayValue() + '.';
	notification.insert();

	queueEmail(current, channel);

})(current, previous);