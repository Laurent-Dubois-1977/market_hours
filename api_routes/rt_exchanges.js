module.exports = function (app ) {

	const exc = require('../controllers/ctrl_exchanges');
	
	app.get('/api/v1/exchanges', exc.getAll);
	app.get('/api/v1/exchanges/status', exc.getStatus);



};
