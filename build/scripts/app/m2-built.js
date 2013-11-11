
define('app/d3',[],
function() {

return {
	name: "dep3"
};

});

define('app/m2',["jquery", "app/d2", "app/d3", "app/dx", "app/d0"],
function(jquery, d2, d3, dm1, d0) {

return {
	start: function(containerElement) {
		jquery(containerElement).html("<span>M2 " + d0.name + "</span>");
	},
	
	stop: function() {
//		return true;
	}
};

});
