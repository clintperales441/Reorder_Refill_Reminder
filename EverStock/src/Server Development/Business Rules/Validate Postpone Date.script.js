(function executeRule(current, previous) {

    if (current.operation() !== 'update') {
        return;
    }

    if (!current.isValidField('next_reminder_date')) {
        return;
    }

    var newNext = String(current.next_reminder_date || '');
    var oldNext = previous ? String(previous.next_reminder_date || '') : '';

    var isPostponeState = current.isValidField('state') && String(current.state) === '2';
    var wasPostponeState = previous && previous.isValidField('state') && String(previous.state) === '2';
    var dateChanged = newNext !== oldNext;
    var postponingNow = isPostponeState && (!wasPostponeState || dateChanged);

    if (!postponingNow) {
        return;
    }

    if (!newNext) {
        return;
    }

    var proposed = new GlideDateTime(newNext);
    var nowWithGrace = new GlideDateTime();
    nowWithGrace.addSecondsUTC(-60);

    if (proposed.before(nowWithGrace)) {
        gs.addErrorMessage('Postpone date/time cannot be in the past.');
        current.setAbortAction(true);
    }

})(current, previous);
