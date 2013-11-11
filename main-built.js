
define('lazy',["module","promise-adaptor"], function (module,promiseAdaptor) {


	var
		LazyStub,
		bundleRegistry = {}, moduleRegistry = {},
		NOT_LOADED=0, LOADING=1, LOADED=2;

	LazyStub = function(name, parentRequire, bundleDeps, hash, metadata) {
		this.name = name;
		this.parentRequire = parentRequire;
		this.bundleDeps = bundleDeps;
		this.hash = hash;
		this.metadata = metadata;
	};

	LazyStub.prototype = {
		name: null,
		parentRequire: null,
		realModule: null,
		bundleDeps: null,
		hash: null,
		metadata: null,
		deferred: null,

		get: function() {
			if( this.realModule === null ) {
				var self= this;
				self.deferred = promiseAdaptor.makeDeferred();
				if( self.bundleDeps == null ) { // non-built mode
					self.parentRequire([self.name], function success(m) {
						self.parentRequire = null;
						self.realModule = m;
						self.deferred.resolve(m);
					}, function error(err) {
						self.deferred.reject(err);
					});
				}
				else { // build mode
					doBundleLoad.call(self);
				}
			}
			return promiseAdaptor.makePromise(this.deferred);
		}
	};

	function doBundleLoad() { // called in the context of the LazyStub
		var bundlesToLoad = [], bundleUrlsToLoad = [], bundlesToLoadDeferred = promiseAdaptor.makeDeferred(), whenPromises = [], bundle, url, i, self = this;

		for( i=0; i < this.bundleDeps.length; i++ ) {
			bundle = bundleRegistry[this.bundleDeps[i]];
			if( bundle == null ) throw "Unknown bundle: " + this.bundleDeps[i] + " requested by: " + this.name;
			if( bundle.status === NOT_LOADED ) loadBundle(this.bundleDeps[i],bundle,this.parentRequire);
			else if( bundle.status === LOADING ) whenPromises.push(bundle.deferred);
		}

//		url = this.parentRequire.toUrl(removePluginsFromName(this.name)) + "-built.js?v=" + this.hash;

		url = "/" + removePluginsFromName(this.name) + "-built.js?v=" + this.hash; // XXX depends on global
		bundleUrlsToLoad.push(url);
		whenPromises.push(promiseAdaptor.makePromise(bundlesToLoadDeferred));

		LazyLoad.js(bundleUrlsToLoad, function() {
			for( var i=0; i < bundlesToLoad.length; i++ ) {
				bundlesToLoad[i].status = LOADED;
				bundlesToLoad[i].deferred.resolve();
				bundlesToLoad[i].deferred = null;
			}
			bundlesToLoadDeferred.resolve();
		});

		jQuery.when.apply(jQuery, whenPromises).done(function() {
			self.parentRequire([self.name], function(m) {
				self.parentRequire = null;
				self.realModule = m;
				self.deferred.resolve(m);
			});
		});


		function loadBundle(bundleId, bundle, parentRequire) {
			bundlesToLoad.push(bundle);
			bundle.status = LOADING;
			bundle.deferred = promiseAdaptor.makeDeferred();
			bundleUrlsToLoad.push(makeBundleUrl(bundleId,bundle,parentRequire));
		}

		function makeBundleUrl(bundleId, bundle, parentRequire) {
//			return parentRequire.toUrl("bundles/" + bundleId + ".js?v=" + bundle.hash);
			return baseUrl + "/bundles/" + bundleId + ".js?v=" + bundle.hash; // XXX depends on global
		}

		function removePluginsFromName(moduleName) {
			var index = moduleName.lastIndexOf("!");
			if( index >= 0 ) moduleName = moduleName.substr(index+1);
			return moduleName;
		}
	}


	function registerBundle(bundleId, hash) {
		bundleRegistry[bundleId] = {
			hash: hash,
			deferred: null,
			status: NOT_LOADED
		};
	}

	function registerModule(moduleStub) {
		moduleRegistry[moduleStub.name] = {
			module: moduleStub,
			status: NOT_LOADED
		}
	}

	function getModule(name) {
		return moduleRegistry[name].module;
	}


	return {
		Stub: LazyStub,
		load: function(name, parentRequire, onload, config) {
			onload(new LazyStub(name, parentRequire));
		},
		pluginBuilder: "lazy-builder",
		registerBundle: registerBundle,
		registerModule: registerModule,
		getModule: getModule
	};


});

define('lazy!banana',['lazy','lazy-registry'],function(lazy) {
return lazy.getModule('banana');
});

define('lazy!maca',['lazy','lazy-registry'],function(lazy) {
return lazy.getModule('maca');
});

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

define("main", function(){});

define('promise-adaptor',["jquery"],function($) {

	return {
		makeDeferred: function() {
			return $.Deferred();
		},
		makePromise: function(deferred) {
			return deferred.promise();
		}
	};

});

define('lazy-registry',['lazy','require','promise-adaptor'], function(lazy,require,promiseAdaptor) {
var moduleList = [];
function registerModule(m) {
	moduleList.push(m);
	lazy.registerModule(m);
}
registerModule(new lazy.Stub('banana',require,[],'1eade7cae8105a804875d39cd04b8752',null));
registerModule(new lazy.Stub('maca',require,[],'b3d3ac66eb3b6bcb311b6f1ac48cd519',null));
return {
	getModules: function() { return moduleList; },
	getModule: lazy.getModule,
	get: function(moduleName) {
		var m = lazy.getModule(moduleName);
		if( m != null ) return m.get();
		else {
			var d = promiseAdaptor.makeDeferred();
			d.reject('does not exist');
			return promiseAdaptor.makePromise(d);
		}
	}
};
});
