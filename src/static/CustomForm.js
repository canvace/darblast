function CustomForm(config) {
	config.xtype = 'form';
	config.errorReader = {
		read: function () {
			return {
				success: true,
				records: null
			};
		}
	};

	function makeCallback(original) {
		if (original) {
			return function (form, action) {
				var response;
				try {
					response = JSON.parse(action.response.responseText);
				} catch (e) {
					response = action.response.response;
				}
				original.call(form, response);
			};
		} else {
			return null;
		}
	}

	var success = makeCallback(config.success);
	delete config.success;

	var failure = makeCallback(config.failure || function (response) {
		Ext.MessageBox.show({
			title: 'Error',
			msg: response.toString(),
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR
		});
	});
	delete config.failure;

	var form = new Ext.form.Panel(config);

	var superSubmit = form.submit;
	form.submit = function (options) {
		if (form.getForm().isValid()) {
			if (!options) {
				options = {};
			}
			if (success) {
				options.success = success;
			}
			options.failure = failure;
			return superSubmit.call(form, options);
		}
	};

	return form;
}
