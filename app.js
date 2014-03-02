
var App = angular.module('App', []);


App.directive('pinheader', function ($timeout, $parse) {
	var margin = 10;
	var targetDPI = 350;
	var nameWidth = 3;
	var pinNumberWidth = 1;
	var pinPlaceHolder = 1;

	function redraw (canvas, val) {
		var wholeWidth = (nameWidth + pinNumberWidth + 1) * 2;
		var wholeHeight = val.length + 2;
		console.log([wholeWidth, wholeHeight]);

		canvas.width  = wholeWidth  * (targetDPI / 10) + (margin * 2);
		canvas.height = wholeHeight * (targetDPI / 10) + (margin * 2);
		canvas.style.width  = canvas.width  / 2 + 'px';
		canvas.style.height = canvas.height / 2 + 'px';

		var ctx = canvas.getContext('2d');
		ctx.save();
		ctx.translate(margin, margin);
		// swtich scale to 100 mil (100mil = 0.1in)
		ctx.scale(
			targetDPI / 10,
			targetDPI / 10
		);
		console.log(targetDPI / 10);

		// draw outline
		ctx.lineWidth = 0.1;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(wholeWidth, 0);
		ctx.lineTo(wholeWidth, wholeHeight-1);
		ctx.lineTo(0, wholeHeight-1);
		ctx.closePath();
		ctx.stroke();

		// vertical lines
		var x = 0;
		ctx.beginPath();
		ctx.moveTo(x += nameWidth, 1); ctx.lineTo(x, wholeHeight - 2);
		ctx.moveTo(x += pinNumberWidth, 1); ctx.lineTo(x, wholeHeight - 2);
		ctx.moveTo(x += pinPlaceHolder, 1); ctx.lineTo(x, wholeHeight - 2);
		ctx.moveTo(x += pinPlaceHolder, 1); ctx.lineTo(x, wholeHeight - 2);
		ctx.moveTo(x += pinNumberWidth, 1); ctx.lineTo(x, wholeHeight - 2);
		ctx.stroke();

		// horizontal lines
		for (var i = 0, len = wholeHeight; i < len; i++) {
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(wholeWidth, i);
			ctx.stroke();
		}

		ctx.font = "0.1px Arial";
		for (var i = 0, len = val.length; i < len; i++) {
			ctx.fillText(i, nameWidth + 0.1, i);
		}

		ctx.restore();
	}

	return {
		link : function (scope, element, attrs) {
			var model = $parse(attrs.pinheader);
			scope.$watch(model, function (val) {
				redraw(element[0], val);
			});
		}
	};
});

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

		$scope.main = rows;
	};

	$scope.update();
});
