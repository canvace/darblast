function CustomForm(config) {
	config.errorReader = {
		read: function (xhr) {
			return {
				success: xhr.status == 200,
				records: null
			};
		}
	};
	var success = config.success;
	delete config.success;
	var failure = config.failure;
	delete config.failure;
	var form = Ext.create('Ext.form.Panel', config);
	if (success || failure) {
		var superSubmit = form.submit;
		form.submit = function (options) {
			if (!options) {
				options = {};
			}
			if (success) {
				options.success = function (form, action) {
					var response;
					try {
						response = JSON.parse(action.response.responseText);
					} catch (e) {
						response = action.response.response;
					}
					success.call(form, response);
				};
			}
			if (failure) {
				options.failure = function (form, action) {
					var response;
					try {
						response = JSON.parse(action.response.responseText);
					} catch (e) {
						response = action.response.response;
					}
					failure.call(form, response);
				};
			}
			return superSubmit.call(form, options);
		};
	}
	return form;
}
