
var App = angular.module('App', []);
App.directive('dialog', function ($q) {
	return {
		restrict: 'E',
		transclude : true,
		scope : {
			Dialog : '=name'
		},
		controller : function ($scope) {
			$scope.Dialog = {
				open : function (title, show) {
					$scope.deferred = $q.defer();
					$scope.show  = show || true;
					return $scope.deferred.promise;
				}
			};

			$scope.close = function () {
				$scope.show = false;
			};
		},
		template: document.getElementById('dialog').innerHTML
	};
});

App.directive('selectonfocus', function () {
	return function (scope, elem, attrs) {
		elem.
			on("click focus", function () {
				elem.select();
			}).
			on("mouseup", function () {
				return false;
			});

	};
});


App.factory('location', function () {
	return Location.parse(location.href);
});

jsPDF.API.getTextSize = function me (text) {
	if (!me.mm_in_px) {
		var elem = $('<div/>').css({
			width: '100mm'
		}).appendTo(document.body);
		me.mm_in_px = elem.innerWidth() / 100;
		elem.remove();
		console.log('1mm==' + me.mm_in_px + 'px');
		console.log((me.mm_in_px * 25.4) + 'dpi');
	}

	var font = this.internal.getFont();
	var fontSize = this.internal.getFontSize();

	// x10 for ignore browser's minimum font-size setting
	var temp = $('<span/>').text(text).css({
		fontStyle : font.fontStyle,
		fontFamily  : '"' + font.fontName + '"',
		fontSize  : (fontSize * 10) + 'pt'
	}).appendTo(document.body);

	var width  = temp.innerWidth() / 10;
	var height = temp.innerHeight() / 10;

	temp.remove();

	return {
		width: width / me.mm_in_px,
		height: height / me.mm_in_px
	};
};

jsPDF.API.textCentered = function (x, y, w, h, text) {
	text = String(text);
	var d = this.getTextSize(text);
	var offsetX = (w - d.width) / 2;
	var offsetY = (h - d.height) / 2;
	this.text(x + offsetX, y - offsetY, text);
};

function createPDF (rows, opts) {
	var pdf = new jsPDF('portrait', 'mm', 'a4');
	// pdf.addFont('Futura-CondensedMedium', 'Futura Condensed Medium', 'normal', 'StandardEncoding');

	pdf.setFont('helvetica', 'bold');
	pdf.setFontSize(16);
	pdf.text(8, 15, opts.title);

	pdf.setFontSize(14);
	pdf.text(10, 30, "Preview x3");

	var size;
	size = drawHeader({
		x: 10,
		y: 35,
		nameWidth: opts.size,
		scale : 3
	});

	pdf.setFontSize(14);
	pdf.text(150, 30, "Real size");

	size = drawHeader({
		x: 150,
		y: 35,
		nameWidth: opts.size,
		scale : 1
	});

	function drawHeader (opts) {
		var unit = 2.54 * (opts.scale || 1);
		var fontUnit = unit * (72 / 25.4);

		var nameWidth = opts.nameWidth || 3;
		var pinNumberWidth = 1;
		var pinPlaceHolder = 1;
		var totalWidth = (nameWidth + pinNumberWidth + pinPlaceHolder) * 2;
		var totalHeight = (rows.length + 2);

		pdf.setDrawColor(0, 0, 0);

		// outer lines
		pdf.setLineWidth(0.1 * opts.scale);
		pdf.setTextColor(0, 0, 0);
		pdf.rect(opts.x, opts.y, totalWidth*unit, totalHeight*unit, 'S');

		// vertical lines
		var pos = 0;
		pdf.lines([ [0, rows.length*unit] ], opts.x + (pos += nameWidth*unit), opts.y + 1*unit);
		pdf.lines([ [0, rows.length*unit] ], opts.x + (pos += pinNumberWidth*unit), opts.y + 1*unit);
		pdf.lines([ [0, rows.length*unit] ], opts.x + (pos += pinPlaceHolder*unit), opts.y + 1*unit);
		pdf.lines([ [0, rows.length*unit] ], opts.x + (pos += pinPlaceHolder*unit), opts.y + 1*unit);
		pdf.lines([ [0, rows.length*unit] ], opts.x + (pos += pinNumberWidth*unit), opts.y + 1*unit);

		// horizontal lines
		for (var i = 0, len = rows.length + 2; i < len; i++)
			pdf.lines([ [totalWidth*unit, 0] ], opts.x, opts.y + i*unit);
		
		pdf.setFontSize(0.5*fontUnit);

		for (var i = 0, it; (it = rows[i]); i++) {
			if (/#$/.test(it[0].name)) {
				pdf.setFillColor(0, 0, 0);
				pdf.rect(
					opts.x,
					opts.y + (i+1)*unit,
					nameWidth*unit,
					1*unit,
					'FD'
				);
				pdf.setTextColor(255, 255, 255);
			} else {
				pdf.setTextColor(0, 0, 0);
			}

			pdf.textCentered(
				opts.x,
				opts.y + (i+2)*unit - 0.3,
				nameWidth*unit,
				1*unit,
				it[0].name || ''
			);

			pdf.setTextColor(0, 0, 0);
			pdf.textCentered(
				opts.x + (nameWidth)*unit,
				opts.y + (i+2)*unit - 0.3,
				pinNumberWidth*unit,
				1*unit,
				it[0].number
			);

			pdf.setTextColor(0, 0, 0);
			pdf.textCentered(
				opts.x + (nameWidth + pinNumberWidth + pinPlaceHolder*2)*unit,
				opts.y + (i+2)*unit - 0.3,
				pinNumberWidth*unit,
				1*unit,
				it[1].number
			);

			if (/#$/.test(it[1].name)) {
				pdf.setFillColor(0, 0, 0);
				pdf.rect(
					opts.x + (nameWidth + pinNumberWidth + pinPlaceHolder*2 + pinNumberWidth)*unit,
					opts.y + (i+1)*unit,
					nameWidth*unit,
					1*unit,
					'FD'
				);
				pdf.setTextColor(255, 255, 255);
			} else {
				pdf.setTextColor(0, 0, 0);
			}

			pdf.textCentered(
				opts.x + (nameWidth + pinNumberWidth + pinPlaceHolder*2 + pinNumberWidth)*unit,
				opts.y + (i+2)*unit - 0.3,
				nameWidth*unit,
				1*unit,
				it[1].name || ''
			);
		}

		return {
			width: totalWidth*unit,
			height: totalHeight*unit
		};
	}

	return pdf;
}


//App.directive('pinheader', function ($timeout, $parse) {
//	return {
//		restrict: 'E',
//		link : function (scope, element, attrs) {
//			var iframe = $('<iframe width="100" height="300"/>');
//			element.replaceWith(iframe);
//
//			var model = $parse(attrs.name);
//			scope.$watch(model, function (val) {
//				redraw(iframe, val);
//			});
//		}
//	};
//});

App.config(function ($sceProvider, $compileProvider) {
	$sceProvider.enabled(false);
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
});

App.service("sample", function () {
	return function (id) {
		var text = document.getElementById(id).innerText;
		return text.replace(/^\n/, '');
	};
});

App.filter("sizeName", function () {
	return function (n) {
		return {
			2 : 'Small',
			3 : 'Medium',
			5 : 'Large'
		}[n];
	};
});

App.controller('MainCtrl', function ($scope, $sce, $timeout, location, sample) {
	$scope.update = function () {
		console.log('update');
		if (!$scope.data) return;

		var pins = {};
		var title = '';
		var lines = $scope.data.split(/\n/);
		for (var i = 0, len = lines.length; i < len; i++) {
			if (/^#(.*)/.test(lines[i])) {
				if (!title) title = RegExp.$1;
				continue;
			}
			if (/^\s*$/.test(lines[i])) continue;
			if (!/^\d+/) {
				throw "Invalid line:" + (i+1);
			}

			var line = lines[i].split(/\s+/);
			var number = line.shift();
			var text   = line.join(" ");
			pins[number] = text;
		}

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
			if ($scope.view == 'Bottom') {
				row.reverse();
			}
			rows.push(row);
		}

		if ($scope.direction == "Reverse") {
			rows.reverse();
		}

		$scope.pdf = createPDF(rows, {
			title : title,
			size : $scope.size
		});
		$scope.datauri = $scope.pdf.output('datauristring');
		console.log($scope.datauri);
	};

	$scope.setSize = function (n) {
		$scope.size = n;
		$scope.update();
	};

	$scope.setView = function (v) {
		$scope.view = v;
		$scope.update();
	};

	$scope.setDirection = function (v) {
		$scope.direction = v;
		$scope.update();
	};

	$scope.download = function () {
		$scope.pdf.output('dataurlnewwindow');
	};

	$scope.share = function () {
		$scope.shareurl = location.params({
			size      : $scope.size,
			direction : $scope.direction,
			view      : $scope.view,
			d         : $scope.data
		}).href;
		$scope.ShareDialog.open();
	};

	$scope.size      = +location.params('size') || 3;
	$scope.direction = location.params('direction') || "Normal";
	$scope.view      = location.params('view') || "Top";
	$scope.data      = location.params('d') || sample('raspberrypi');
	$scope.datauri   = "about:blank";

	$scope.update();
});
