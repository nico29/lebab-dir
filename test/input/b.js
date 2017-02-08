var someObj = {
	someFunction: function (arg1, arg2) {
		var opt1 = arg1 || 'opt1';
		var opt2 = arg2 || 'opt2';
		console.log(opt1, opt2);
	}
};

console.log(someObj);
