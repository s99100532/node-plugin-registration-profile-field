"use strict";

var plugin = {},
    fields = [ 
        'website',
        'location',
        'birthday',
        'signature',
        'aboutme',
        'education_level'
    ],
    User = module.parent.require('./user'),
	meta = module.parent.require('./meta');

plugin.init = function(params, callback) {
	var app = params.router,
		middleware = params.middleware,
		controllers = params.controllers;
		
	app.get('/admin/registration-profile-field', middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin/registration-profile-field', renderAdmin);

	callback();
};

plugin.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/registration-profile-field',
		icon: 'fa-tint',
		name: 'Registration Profile Field'
	});

	callback(null, header);
};

plugin.customHeaders = function(headers, callback) {
	var field = meta.config['registration-profile-field:field'];
    headers.headers.push({
        label: '[[user:' + field + ']]',
    });

    callback(null, headers);
};

plugin.customFields = function(params, callback) {
	var field = meta.config['registration-profile-field:field'];
    var users = params.users.map(function(user) {
        if (!user.customRows) {
            user.customRows = [];
        }
        user.customRows.push({value: user[field]});
        return user;
    });

    callback(null, {users: users});
};

plugin.addCaptcha = function(params, callback) {
	var field = meta.config['registration-profile-field:field'];
    console.log("Field: " + field);
    if (field == "") {
        callback(null, params);
        return;
    }
    if (field === 'aboutme') {
        var html = '<textarea class="form-control" name="registration-profile-field" id="registration-profile-field"></textarea>';
    } else if (field === 'education_level') {
        var html = '<select class="form-control" name="registration-profile-field" id="registration-profile-field"> <option value="小學">小學</option> <option value="初中">初中</option> <option value="高中">高中</option> <option value="專上非學位課程">專上非學位課程</option> <option value="專上學位課程">專上學位課程</option> </select>';
    } else {
        var html = '<input class="form-control" name="registration-profile-field" id="registration-profile-field" />';
    }

	var captcha = {
        label: '[[user:' + field + ']]',
		html: html
	};

	if (params.templateData.regFormEntry && Array.isArray(params.templateData.regFormEntry)) {
		params.templateData.regFormEntry.push(captcha);
	} else {
		params.templateData.captcha = captcha;
	}

	callback(null, params);
};

plugin.createUser = function(params, callback) {
	var field = meta.config['registration-profile-field:field'];
    var fieldData = params.data[field] || params.data['registration-profile-field'];
    var userData = params.user;
    if (!userData[field] && fieldData && fieldData != "") 
        userData[field] = fieldData;
    params.user = userData
    callback(null, params);

};

plugin.addToApprovalQueue = function(params, callback) {
	var field = meta.config['registration-profile-field:field'];
    var fieldData = params.userData['registration-profile-field'];
    var userData = params.data;
    userData[field] = fieldData;
    callback(null, {data: userData});

};
function renderAdmin(req, res, next) {
	res.render('admin/registration-profile-field', {fields:fields});
}

module.exports = plugin;
