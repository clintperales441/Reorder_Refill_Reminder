const stateField = current.isValidField('state') ? 'state' : 'u_state';
current[stateField] = current.isValidField('state') ? 3 : 'Skipped';
current.update();
action.setRedirectURL(current);