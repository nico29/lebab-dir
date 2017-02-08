function Module(id, deps, factory) {
	this.deps = deps || [];
	this.id = id;
	this.factory = factory;
}

Module.prototype.load = function () {

};
