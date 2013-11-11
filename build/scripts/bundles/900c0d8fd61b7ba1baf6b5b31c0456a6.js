
define('app/dy',[],
function() {

return {
	name: "dep-y"
};

});

define('app/dx',["app/dy"],
function(dy) {

return {
	name: "dep-x"
};

});
