var tc = {};

tc.setUp = function() {
	tc.storage = window.localStorage;
	tc.session = window.sessionStorage;
	tc.shift_event_types = ['break', 'lunch'];
	tc.event_types = ['shift'].concat(tc.shift_event_types);

	// define some valid employee ids to allow user sign up, validation, and permissions
	tc.storage.setItem('employees', 
		JSON.stringify([{"user": "manager", "perm": 1},
		{"user": "employee1", "perm": 0},
		{"user": "employee2", "perm": 0}]
	));

	if(tc.session.getItem('user')) {
		tc.showActions();
	} else {
		tc.showLogin();
	}
	tc.updateUserDisplay();
	tc.updateActions();
}

tc.showSignIn = function() {
	$("#signin").show();
}

tc.login = function(e) {
	if (!tc.storage.getItem('employees')) {
		tc.setUp();
	}
	let user_id = $('#signin_user').val().trim();
	let employee = tc.getEmployee(user_id);
	if(employee) {
		tc.loginSuccess(employee);
	} else {
		tc.loginFail();
	}
	e.preventDefault();
}

tc.loginFail = function() {
	$('#signin_error').text("Provide valid user id");
}

tc.loginSuccess = function(employee) {
	$('#signin_error').text("");
	tc.session.setItem("user_perm", employee.perm);
	tc.session.setItem('user', employee.user);
	let previous_data = JSON.parse(tc.storage.getItem(employee.user));
	if (previous_data) {
		for (let d of previous_data) {
			let p = JSON.parse(d);
			tc.storage.setItem(p['type'], JSON.stringify(p));
		}
	}
	tc.showActions();
	tc.updateUserDisplay();
}

tc.updateUserDisplay = function() {
	let user = tc.session.getItem('user');
	if(user) {
		let d_text = 'Current User: ' + user;
		if(tc.isAdmin()) {
			d_text += ' (admin)';
		}
		for(e of tc.event_types) {
			if(tc.isEventActive(e)){
				d_text += '<br>' + e + ' active';
			}
		}
		$('#user_display').html(d_text);
		tc.showUserHistory(user);
	} else {
		$('#user_display').html('');
		tc.showUserHistory(null);
	}
}

tc.updateActions = function() {
	if (tc.isAdmin()) {
		// all buttons are active
		$('input[id^="action_"').prop('disabled', false);
		$('#clear_all').prop('disabled', false).show();
	} else if (tc.hasUser()) {
		$('#clear_all').prop('disabled', true).hide();
		for(let e of tc.event_types) {
			// if lunch or break is active, can't start or end shift
			if(e == 'shift') {
				if (tc.isShiftEventActive()) {
					$('#action_start_' + e).prop('disabled', true);
					$('#action_end_' + e).prop('disabled', true);
				} else if (tc.isEventActive(e)) {
					$('#action_start_' + e).prop('disabled', true);
					$('#action_end_' + e).prop('disabled', false);
				} else {
					$('#action_start_' + e).prop('disabled', false);
					$('#action_end_' + e).prop('disabled', true);
				}
			} else {
				if (tc.isEventActive(e)) {
					$('#action_start_' + e).prop('disabled', true);
					$('#action_end_' + e).prop('disabled', false);
				// if a different event is active or no shift is active, can't start or end
				} else if(tc.isShiftEventActive() || !tc.isEventActive('shift')) {
					$('#action_start_' + e).prop('disabled', true);
					$('#action_end_' + e).prop('disabled', true);
				} else {
					$('#action_start_' + e).prop('disabled', false);
					$('#action_end_' + e).prop('disabled', true);
			
				}
			}
		}
	}
}

tc.showUserHistory = function(user) {
	if(user) {
		$('#history_container').show();

		let history = JSON.parse(tc.storage.getItem("shift_history"));
		let html = "";
		if(tc.isAdmin()) {
			html = tc.makeAdminHistoryTable(history);
		} else {
			let user_history = history ? history[user] : null;
			html = tc.makeUserHistoryTable(user_history);
		}
		$('#history').html(html);
	} else {
		$('#history_container').hide();
	}
}

tc.makeUserHistoryTable = function (history) {
	let text = ""
	if(history) {
		text = "<table class='history'><tr><th>Type</th><th>Action</th><th>Time</th></tr>";
		for(i of history) {
			text += "<tr><td>" + i['type'] + "</td><td>" + i['action'] + "</td><td>" + new Date(i['time']) + "</td></tr>";
		}
		text += "</table>";
	}
	return text;
}

tc.makeAdminHistoryTable = function (history) {
	let text = ""
	if(history) {
		text = "<table class='history'><tr><th>User</th><th>Type</th><th>Action</th><th>Time</th></tr>";
		for(h in history) {
			for(r of history[h]) {
				text += "<tr><td>" + r['user'] + '</td><td>' + r['type'] + "</td><td>" + r['action'] + "</td><td>" + new Date(r['time']) + "</td></tr>";
			}
		}
		text += "</table>";
	}
	return text;
}

tc.hideLogin = function() {
	$('#signin').hide();
}

tc.showLogin = function() {
	tc.hideActions();
	$('#signin').show();
}

tc.showActions = function () {
	tc.hideLogin();
	$('#user_actions').show();
	tc.updateActions();
}

tc.hideActions = function() {
	$('#user_actions').hide();
}

tc.getEmployee = function(employee) {
	let emps = tc.storage.getItem('employees');
	let employees = JSON.parse(emps);
	for(e of employees) {
		if(e.user == employee) {
			return e;
		}
	}
}

tc.isAdmin = function() {
	if(tc.session.getItem('user_perm') == 1) {
		return true;
	}
	return false;
}

tc.hasUser = function() {
	if(tc.session.getItem('user') && tc.session.getItem('user_perm')) {
		return true;
	}
	return false;
}

tc.isEventActive = function(event_type) {
	if(tc.storage.getItem(event_type)) {
		return true;
	}
	return false;
}

// return true if any shift event is active (i.e. lunch or break)
tc.isShiftEventActive = function() {
	for(let s of tc.shift_event_types) {
		if (tc.isEventActive(s)) {
			return true;
		}
	}
	return false;
}

tc.startShift = function() {
	if(tc.isAdmin() || (tc.hasUser() && !tc.isEventActive('shift'))) {
		tc.logStart('shift');
	} else {
		alert("Shift is already active");
	}
}

tc.endShift = function() {
	if(tc.isAdmin() || (tc.hasUser() && tc.isEventActive('shift') && !tc.isShiftEventActive())) {
		tc.logEnd('shift');
	} else {
		alert("Unable to end shift");
	}
}

tc.start = function(type) {
	if(tc.isAdmin() || (tc.hasUser() && tc.isEventActive('shift') && !tc.isShiftEventActive())) {
		tc.logStart(type);
	} else {
		alert("Unable to start " + type);
	}
}

tc.end = function(type) {
	if(tc.isAdmin() || (tc.hasUser() && tc.isEventActive('shift') && tc.isEventActive(type))) {
		tc.logEnd(type);
	} else {
		alert('Unable to end ' + type);
	}
}

tc.logStart = function(event_type) {
	let start = new Date();
	let current_event = {'user': tc.session.getItem('user'), 'type': event_type, 'time': start, 'action': 'start'}
	tc.storage.setItem(event_type, JSON.stringify(current_event));
	tc.logEvent(current_event);
}

tc.logEnd = function(event_type) {
	let end = new Date();
	current_event = {'user': tc.session.getItem('user'), 'type': event_type, 'time': end, 'action': 'end'};
	tc.storage.removeItem(event_type);
	tc.logEvent(current_event);
}

tc.logEvent = function(current_event) {
	let shift_history = JSON.parse(tc.storage.getItem('shift_history'));
	if (!shift_history) {
		shift_history = {};
	}
	let user_history = shift_history[tc.session.getItem('user')];
	if(!user_history) {
		user_history = []
	}
	user_history.push(current_event);
	shift_history[tc.session.getItem('user')] = user_history;
	tc.storage.setItem('shift_history', JSON.stringify(shift_history));
	tc.updateUserDisplay();
	tc.updateActions();
}

tc.endSession = function() {
	// store the user's current state for the next session
	let user = tc.session.getItem('user');
	let user_events = [];
	for(e of tc.event_types) {
		let current_event = tc.storage.getItem(e);
		if(current_event) {
			user_events.push(current_event);
		}
		tc.storage.removeItem(e);
	}
	if(user && user_events) {
		tc.storage.setItem(user, JSON.stringify(user_events));
	}

	// clean up session items and display
	tc.session.removeItem('user');
	tc.session.removeItem('perm');
	$('#user_display').text('');
	$('#signin_user').val('');
	tc.showLogin();
	tc.updateUserDisplay();
}

$().ready(tc.setUp);