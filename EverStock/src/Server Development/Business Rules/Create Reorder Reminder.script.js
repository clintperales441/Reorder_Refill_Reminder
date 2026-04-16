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

	const userId = String(current.sys_user || gs.getUserID() || '');
	const productId = String(current.x_1984194_everstoc_product || current.product || '');

	if (!userId || !productId) {
		gs.warn('Create Reorder Reminder: skipped because sys_user or product is missing. record=' + current.getUniqueValue());
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

	const reminder = new GlideRecord(reminderTable);
	reminder.initialize();
	reminder[reminderUserField] = userId;
	reminder[reminderProductField] = productId;
	reminder[reminderFrequencyField] = getUserDefaultFrequency(userId);
	reminder[reminderNextDateField] = new GlideDateTime();
	reminder[reminderStateField] = 1;
	reminder.insert();

})(current, previous);