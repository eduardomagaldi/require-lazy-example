require(['lazy!banana', 'lazy!maca'],
function(b, m) {

	console.log('main');

	b.get().then(function(banana) {
		console.log('loaded');
	});

	$('a.maca').click(function () {

		m.get().then(function(m) {


			console.log('loaded');



		});

	});

});
