
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
		url = baseUrl + "/" + removePluginsFromName(this.name) + "-built.js?v=" + this.hash; // XXX depends on global
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

define('lazy!app/m1',['lazy','lazy-registry'],function(lazy) {
return lazy.getModule('app/m1');
});

define('lazy!app/m2',['lazy','lazy-registry'],function(lazy) {
return lazy.getModule('app/m2');
});

define('lazy!app/m3',['lazy','lazy-registry'],function(lazy) {
return lazy.getModule('app/m3');
});

define('app/d0',[],
function() {

return {
	name: "dep0"
};

});

define('lazy!text!app/m4.txt',['lazy','lazy-registry'],function(lazy) {
return lazy.getModule('text!app/m4.txt');
});

require(["jquery","lazy!app/m1","lazy!app/m2","lazy!app/m3","app/d0","lazy!text!app/m4.txt"],
function(jq,m1,m2,m3,d0,m4) {

	var currentModule = null, view;
	
	function startModule(m) {
		var result = true;
		
		if( currentModule != null ) {
			result = currentModule.stop();
		}
		
		if( result !== false ) {
			currentModule = m;
			m.start(view.find("#container"));
		}
	}
	
	$(function() {
		view = jq("<div><div><a href='#' id='link-m1' class='modnav'>Module 1</a>&nbsp;<a href='#' id='link-m2' class='modnav'>Module 2 " + d0.name + "</a>&nbsp;<a href='#' id='link-m3' class='modnav'>Module 3</a></div><div id='container'></div><div><button class='m4-alerter'>Text</button></div></div>").appendTo("body");
		
		view.on("click", ".m4-alerter", function(event) {
			m4.get().then(function(txt) {
				alert(txt);
			});
		});
		
		view.on("click",".modnav",function(event) {
			event.preventDefault();
			if( this.id === "link-m1" ) m1.get().then(startModule);
			else if( this.id === "link-m2" ) m2.get().then(startModule);
			else if( this.id === "link-m3" ) m3.get().then(startModule);
			return false;
		});
	});

});

define("main/main", function(){});

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
lazy.registerBundle('b968a4f466f444d503a3771396871d94','ab3d066a7d73a3ee523c654fc614eb20');
lazy.registerBundle('3029f1ff2d6a0d5689ab7f95dc33a631','39a7252f03aec296365e7bf7f59e8d81');
lazy.registerBundle('900c0d8fd61b7ba1baf6b5b31c0456a6','f020c5d8b8e44d00d5a16021d760f8c9');
registerModule(new lazy.Stub('app/m1',require,['b968a4f466f444d503a3771396871d94','3029f1ff2d6a0d5689ab7f95dc33a631','900c0d8fd61b7ba1baf6b5b31c0456a6'],'c79738fc644ea82cc3971ae2aca083ae',null));
registerModule(new lazy.Stub('app/m2',require,['3029f1ff2d6a0d5689ab7f95dc33a631','900c0d8fd61b7ba1baf6b5b31c0456a6'],'6e74679941c7068c2666c7f06b901c5b',null));
registerModule(new lazy.Stub('app/m3',require,['b968a4f466f444d503a3771396871d94'],'9e9244738127a4962504bdfed84d0c7b',null));
registerModule(new lazy.Stub('text!app/m4.txt',require,[],'dba9a618dad5e81c915ca676e730c82b',null));
registerModule(new lazy.Stub('app/dm1',require,['900c0d8fd61b7ba1baf6b5b31c0456a6'],'e17ab3d5b134d68a56a2dfc780913fe9',null));
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
