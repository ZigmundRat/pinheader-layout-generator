
var App = angular.module('App', []);

App.controller('MainCtrl', function ($scope) {

	$scope.update = function () {
		var pins = {
			40: 'GND',
			39: 'GND',
			38: 'SUSPEND',
			37: 'POWEREN',
			36: 'DDBUS7',
			35: 'DDBUS6'
		};

		var index = [];
		for (var key in pins) if (pins.hasOwnProperty(key)) {
			index.push(+key);
		}
		index.sort(function (a, b) { return a - b });

		var start = index[0];
		var last  = index[index.length-1];

		var rows = [];
		for (var i = start; i <= last; i += 2) {
			var row = [
				{ number: i, name : pins[i] },
				{ number: i+1, name : pins[i+1] }
			];
			if (!$scope.reverse_row) {
				row.reverse();
			}
			rows.push(row);
		}

		if (!$scope.reverse_direction) {
			rows.reverse();
		}

		$scope.rows = rows;
	};

	$scope.update();
});
