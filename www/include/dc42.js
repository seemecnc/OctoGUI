
// Delta calibration script

var debug = false;

var initialPoints = 10;
var initialFactors = 7;

var deltaParams;
var firmware = "Repetier";
var bedRadius;
var numPoints = 10;
var numFactors = 7;
var xBedProbePoints, yBedProbePoints, zBedProbePoints;
var normalise = true;
var probePoints;
var probeGCODE;
var updateGCODE;
var degreesToRadians = Math.PI / 180.0;
var oldDeviation;
var newDeviation;

function loadProbePoints(){

  probePoints = [];

  switch(printerId){
    case "eris":
      probePoints.push([0.0,65.0]);
      probePoints.push([56.29,32.50]);
      probePoints.push([56.29,-32.50]);
      probePoints.push([0,-65.00]);
      probePoints.push([-56.29,-32.50]);
      probePoints.push([-56.29,32.50]);
      probePoints.push([0,32.50]);
      probePoints.push([28.15,-16.25]);
      probePoints.push([-28.15,-16.25]);
      probePoints.push([0,0]);
      bedRadius = 65;
      break;

    case "orion":
      probePoints.push([0.0,85.0]);
      probePoints.push([73.61,42.5]);
      probePoints.push([73.61,-42.5]);
      probePoints.push([0.0,-85.0]);
      probePoints.push([-73.61,-42.5]);
      probePoints.push([-73.61,42.5]);
      probePoints.push([0.0,42.5]);
      probePoints.push([36.81,-21.25]);
      probePoints.push([-36.81,-21.25]);
      probePoints.push([0,0]);
      bedRadius = 80;
      break;

    case "rostock_max_v3":
      probePoints.push([0,140]);
      probePoints.push([121.24,70]);
      probePoints.push([121.24,-70]);
      probePoints.push([0,-140]);
      probePoints.push([-121.24,-70]);
      probePoints.push([-121.24,70]);
      probePoints.push([0,70]);
      probePoints.push([60.62,-35]);
      probePoints.push([-60.62,-35]);
      probePoints.push([0,0]);
      bedRadius = 140;
      break;

    case "hacker_h2":
      probePoints.push([0,70]);
      probePoints.push([60.62,35]);
      probePoints.push([60.62,-35]);
      probePoints.push([0,-70]);
      probePoints.push([-60.62,-35]);
      probePoints.push([-60.62,35]);
      probePoints.push([0,35]);
      probePoints.push([30.31,-17.5]);
      probePoints.push([-30.31,-17.5]);
      probePoints.push([0,0]);
      bedRadius = 70;
      break;

  }

  probeGCODE = ["G28", "G1 Z20" ];
  probePoints.forEach(function(vals){
    probeGCODE.push("G1 X" + vals[0] + " Y" + vals[1]);
    probeGCODE.push("G30");
  });
  probeGCODE.push("G28");

}

function fsquare(x) {
	return x * x;
}

var Matrix = function(rows, cols) {
	this.data = [];
	for (var i = 0; i < rows; ++i) {
		var row = [];
		for (var j = 0; j < cols; ++j) {
			row.push(0.0);
		}
		this.data.push(row)
	}
}

Matrix.prototype.SwapRows = function(i, j, numCols) {
	if (i != j) {
		for (var k = 0; k < numCols; ++k) {
			var temp = this.data[i][k];
			this.data[i][k] = this.data[j][k];
			this.data[j][k] = temp;
		}
	}
}

// Perform Gauus-Jordan elimination on a matrix with numRows rows and (njumRows + 1) columns
Matrix.prototype.GaussJordan = function(solution, numRows) {
	for (var i = 0; i < numRows; ++i) {
		// Swap the rows around for stable Gauss-Jordan elimination
		var vmax = Math.abs(this.data[i][i]);
		for (var j = i + 1; j < numRows; ++j) {
			var rmax = Math.abs(this.data[j][i]);
			if (rmax > vmax) {
				this.SwapRows(i, j, numRows + 1);
				vmax = rmax;
			}
		}

		// Use row i to eliminate the ith element from previous and subsequent rows
		var v = this.data[i][i];
		for (var j = 0; j < i; ++j) {
			var factor = this.data[j][i]/v;
			this.data[j][i] = 0.0;
			for (var k = i + 1; k <= numRows; ++k) {
				this.data[j][k] -= this.data[i][k] * factor;
			}
		}

		for (var j = i + 1; j < numRows; ++j) {
			var factor = this.data[j][i]/v;
			this.data[j][i] = 0.0;
			for (var k = i + 1; k <= numRows; ++k) {
				this.data[j][k] -= this.data[i][k] * factor;
			}
		}
	}

	for (var i = 0; i < numRows; ++i) {
		solution.push(this.data[i][numRows] / this.data[i][i]);
	}
}

Matrix.prototype.Print = function(tag) {
	var rslt = tag + " {<br/>";
	for (var i = 0; i < this.data.length; ++i) {
		var row = this.data[i];
		rslt += (row == 0) ? '{' : ' ';
		for (var j = 0; j < row.length; ++j) {
			rslt += row[j].toFixed(4);
			if (j + 1 < row.length) {
				rslt += ", ";
			}
		}
		rslt += '<br/>';
	}
	rslt += '}';
	return rslt;
}

var DeltaParameters = function(diagonal, radius, height, xstop, ystop, zstop, xadj, yadj, zadj) {
	this.diagonal = diagonal;
	this.radius = radius;
	this.homedHeight = height;
	this.xstop = xstop;
	this.ystop = ystop;
	this.zstop = zstop;
	this.xadj = xadj;
	this.yadj = yadj;
	this.zadj = zadj;
	this.Recalc();
}

DeltaParameters.prototype.Transform = function(machinePos, axis) {
	return machinePos[2] + Math.sqrt(this.D2 - fsquare(machinePos[0] - this.towerX[axis]) - fsquare(machinePos[1] - this.towerY[axis]));
}

// Inverse transform method, We only need the Z component of the result.
DeltaParameters.prototype.InverseTransform = function(Ha, Hb, Hc) {
	var Fa = this.coreFa + fsquare(Ha);
	var Fb = this.coreFb + fsquare(Hb);
	var Fc = this.coreFc + fsquare(Hc);

	// Setup PQRSU such that x = -(S - uz)/P, y = (P - Rz)/Q
	var P = (this.Xbc * Fa) + (this.Xca * Fb) + (this.Xab * Fc);
	var S = (this.Ybc * Fa) + (this.Yca * Fb) + (this.Yab * Fc);

	var R = 2 * ((this.Xbc * Ha) + (this.Xca * Hb) + (this.Xab * Hc));
	var U = 2 * ((this.Ybc * Ha) + (this.Yca * Hb) + (this.Yab * Hc));

	var R2 = fsquare(R), U2 = fsquare(U);

	var A = U2 + R2 + this.Q2;
	var minusHalfB = S * U + P * R + Ha * this.Q2 + this.towerX[0] * U * this.Q - this.towerY[0] * R * this.Q;
	var C = fsquare(S + this.towerX[0] * this.Q) + fsquare(P - this.towerY[0] * this.Q) + (fsquare(Ha) - this.D2) * this.Q2;

	var rslt = (minusHalfB - Math.sqrt(fsquare(minusHalfB) - A * C)) / A;
	if (isNaN(rslt)) {
		throw "At least one probe point is not reachable. Please correct your delta radius, diagonal rod length, or probe coordniates."
	}
	return rslt;
}

DeltaParameters.prototype.Recalc = function() {
	this.towerX = [];
	this.towerY = [];
	this.towerX.push(-(this.radius * Math.cos((30 + this.xadj) * degreesToRadians)));
	this.towerY.push(-(this.radius * Math.sin((30 + this.xadj) * degreesToRadians)));
	this.towerX.push(+(this.radius * Math.cos((30 - this.yadj) * degreesToRadians)));
	this.towerY.push(-(this.radius * Math.sin((30 - this.yadj) * degreesToRadians)));
	this.towerX.push(-(this.radius * Math.sin(this.zadj * degreesToRadians)));
	this.towerY.push(+(this.radius * Math.cos(this.zadj * degreesToRadians)));

	this.Xbc = this.towerX[2] - this.towerX[1];
	this.Xca = this.towerX[0] - this.towerX[2];
	this.Xab = this.towerX[1] - this.towerX[0];
	this.Ybc = this.towerY[2] - this.towerY[1];
	this.Yca = this.towerY[0] - this.towerY[2];
	this.Yab = this.towerY[1] - this.towerY[0];
	this.coreFa = fsquare(this.towerX[0]) + fsquare(this.towerY[0]);
	this.coreFb = fsquare(this.towerX[1]) + fsquare(this.towerY[1]);
	this.coreFc = fsquare(this.towerX[2]) + fsquare(this.towerY[2]);
	this.Q = 2 * (this.Xca * this.Yab - this.Xab * this.Yca);
	this.Q2 = fsquare(this.Q);
	this.D2 = fsquare(this.diagonal);

	// Calculate the base carriage height when the printer is homed.
	var tempHeight = this.diagonal;		// any sensible height will do here, probably even zero
	this.homedCarriageHeight = this.homedHeight + tempHeight - this.InverseTransform(tempHeight, tempHeight, tempHeight);
}

DeltaParameters.prototype.ComputeDerivative = function(deriv, ha, hb, hc) {
	var perturb = 0.2;			// perturbation amount in mm or degrees
	var hiParams = new DeltaParameters(this.diagonal, this.radius, this.homedHeight, this.xstop, this.ystop, this.zstop, this.xadj, this.yadj, this.zadj);
	var loParams = new DeltaParameters(this.diagonal, this.radius, this.homedHeight, this.xstop, this.ystop, this.zstop, this.xadj, this.yadj, this.zadj);
	switch(deriv)
	{
	case 0:
	case 1:
	case 2:
		break;

	case 3:
		hiParams.radius += perturb;
		loParams.radius -= perturb;
		break;

	case 4:
		hiParams.xadj += perturb;
		loParams.xadj -= perturb;
		break;

	case 5:
		hiParams.yadj += perturb;
		loParams.yadj -= perturb;
		break;

	case 6:
		hiParams.diagonal += perturb;
		loParams.diagonal -= perturb;
		break;
	}

	hiParams.Recalc();
	loParams.Recalc();

	var zHi = hiParams.InverseTransform((deriv == 0) ? ha + perturb : ha, (deriv == 1) ? hb + perturb : hb, (deriv == 2) ? hc + perturb : hc);
	var zLo = loParams.InverseTransform((deriv == 0) ? ha - perturb : ha, (deriv == 1) ? hb - perturb : hb, (deriv == 2) ? hc - perturb : hc);

	return (zHi - zLo)/(2 * perturb);
}

// Make the average of the endstop adjustments zero, or make all emndstop corrections negative, without changing the individual homed carriage heights
DeltaParameters.prototype.NormaliseEndstopAdjustments = function() {
	var eav = (firmware == "Marlin" || firmware == "MarlinRC" || firmware == "Repetier") ? Math.min(this.xstop, Math.min(this.ystop, this.zstop))
				: (this.xstop + this.ystop + this.zstop)/3.0;
	this.xstop -= eav;
	this.ystop -= eav;
	this.zstop -= eav;
	this.homedHeight += eav;
	this.homedCarriageHeight += eav;				// no need for a full recalc, this is sufficient
}

// Perform 3, 4, 6 or 7-factor adjustment.
// The input vector contains the following parameters in this order:
//  X, Y and Z endstop adjustments
//  If we are doing 4-factor adjustment, the next argument is the delta radius. Otherwise:
//  X tower X position adjustment
//  Y tower X position adjustment
//  Z tower Y position adjustment
//  Diagonal rod length adjustment
DeltaParameters.prototype.Adjust = function(numFactors, v, norm) {
	var oldCarriageHeightA = this.homedCarriageHeight + this.xstop;	// save for later

	// Update endstop adjustments
	this.xstop += v[0];
	this.ystop += v[1];
	this.zstop += v[2];
	if (norm) {
		this.NormaliseEndstopAdjustments();
	}

	if (numFactors >= 4) {
		this.radius += v[3];

		if (numFactors >= 6) {
			this.xadj += v[4];
			this.yadj += v[5];

			if (numFactors == 7) {
				this.diagonal += v[6];
			}
		}

		this.Recalc();
	}

	// Adjusting the diagonal and the tower positions affects the homed carriage height.
	// We need to adjust homedHeight to allow for this, to get the change that was requested in the endstop corrections.
	var heightError = this.homedCarriageHeight + this.xstop - oldCarriageHeightA - v[0];
	this.homedHeight -= heightError;
	this.homedCarriageHeight -= heightError;
}

function ClearDebug() {
	document.getElementById("oDebug").innerHTML = "";
}

function DebugPrint(s) {
	if (debug) {
		document.getElementById("oDebug").innerHTML += s + "<br/>";
	}
}

function PrintVector(label, v) {
	var rslt = label + ": {";
	for (var i = 0; i < v.length; ++i) {
		rslt += v[i].toFixed(4);
		if (i + 1 != v.length) {
			rslt += ", ";
		}
	}
	rslt += "}";
	return rslt;
}

function DoDeltaCalibration() {
	if (numFactors != 3 && numFactors != 4 && numFactors != 6 && numFactors != 7) {
		return "Error: " + numFactors + " factors requested but only 3, 4, 6 and 7 supported";
	}
	if (numFactors > numPoints) {
		return "Error: need at least as many points as factors you want to calibrate";
	}

	ClearDebug();

	// Transform the probing points to motor endpoints and store them in a matrix, so that we can do multiple iterations using the same data
	var probeMotorPositions = new Matrix(numPoints, 3);
	var corrections = new Array(numPoints);
	var initialSumOfSquares = 0.0;
	for (var i = 0; i < numPoints; ++i) {
		corrections[i] = 0.0;
		var machinePos = [];
		var xp = xBedProbePoints[i], yp = yBedProbePoints[i];
		machinePos.push(xp);
		machinePos.push(yp);
		machinePos.push(0.0);

		probeMotorPositions.data[i][0] = deltaParams.Transform(machinePos, 0);
		probeMotorPositions.data[i][1] = deltaParams.Transform(machinePos, 1);
		probeMotorPositions.data[i][2] = deltaParams.Transform(machinePos, 2);

		initialSumOfSquares += fsquare(zBedProbePoints[i]);
	}

	DebugPrint(probeMotorPositions.Print("Motor positions:"));

	// Do 1 or more Newton-Raphson iterations
	var iteration = 0;
	var expectedRmsError;
	for (;;) {
		// Build a Nx7 matrix of derivatives with respect to xa, xb, yc, za, zb, zc, diagonal.
		var derivativeMatrix = new Matrix(numPoints, numFactors);
		for (var i = 0; i < numPoints; ++i) {
			for (var j = 0; j < numFactors; ++j) {
				derivativeMatrix.data[i][j] =
					deltaParams.ComputeDerivative(j, probeMotorPositions.data[i][0], probeMotorPositions.data[i][1], probeMotorPositions.data[i][2]);
			}
		}

		DebugPrint(derivativeMatrix.Print("Derivative matrix:"));

		// Now build the normal equations for least squares fitting
		var normalMatrix = new Matrix(numFactors, numFactors + 1);
		for (var i = 0; i < numFactors; ++i) {
			for (var j = 0; j < numFactors; ++j) {
				var temp = derivativeMatrix.data[0][i] * derivativeMatrix.data[0][j];
				for (var k = 1; k < numPoints; ++k) {
					temp += derivativeMatrix.data[k][i] * derivativeMatrix.data[k][j];
				}
				normalMatrix.data[i][j] = temp;
			}
			var temp = derivativeMatrix.data[0][i] * -(zBedProbePoints[0] + corrections[0]);
			for (var k = 1; k < numPoints; ++k) {
				temp += derivativeMatrix.data[k][i] * -(zBedProbePoints[k] + corrections[k]);
			}
			normalMatrix.data[i][numFactors] = temp;
		}

		DebugPrint(normalMatrix.Print("Normal matrix:"));

		var solution = [];
		normalMatrix.GaussJordan(solution, numFactors);

		for (var i = 0; i < numFactors; ++i) {
			if (isNaN(solution[i])) {
				throw "Unable to calculate corrections. Please make sure the bed probe points are all distinct.";
			}
		}

		DebugPrint(normalMatrix.Print("Solved matrix:"));

		if (debug) {
			DebugPrint(PrintVector("Solution", solution));

			// Calculate and display the residuals
			var residuals = [];
			for (var i = 0; i < numPoints; ++i) {
				var r = zBedProbePoints[i];
				for (var j = 0; j < numFactors; ++j) {
					r += solution[j] * derivativeMatrix.data[i][j];
				}
				residuals.push(r);
			}
			DebugPrint(PrintVector("Residuals", residuals));
		}

		deltaParams.Adjust(numFactors, solution, normalise);

		// Calculate the expected probe heights using the new parameters
		{
			var expectedResiduals = new Array(numPoints);
			var sumOfSquares = 0.0;
			for (var i = 0; i < numPoints; ++i) {
				for (var axis = 0; axis < 3; ++axis) {
					probeMotorPositions.data[i][axis] += solution[axis];
				}
				var newZ = deltaParams.InverseTransform(probeMotorPositions.data[i][0], probeMotorPositions.data[i][1], probeMotorPositions.data[i][2]);
				corrections[i] = newZ;
				expectedResiduals[i] = zBedProbePoints[i] + newZ;
				sumOfSquares += fsquare(expectedResiduals[i]);
			}

			expectedRmsError = Math.sqrt(sumOfSquares/numPoints);
			DebugPrint(PrintVector("Expected probe error", expectedResiduals));
		}

		// Decide whether to do another iteration Two is slightly better than one, but three doesn't improve things.
		// Alternatively, we could stop when the expected RMS error is only slightly worse than the RMS of the residuals.
		++iteration;
		if (iteration == 2) { break; }
	}

  oldDeviation = Math.sqrt(initialSumOfSquares/numPoints).toFixed(2);
  newDeviation = expectedRmsError.toFixed(2);
	return "Calibrated " + numFactors + " factors using " + numPoints + " points, deviation before " + oldDeviation
			+ " after " + newDeviation;
}

function convertIncomingEndstops() {
	var endstopFactor = (firmware == "RRF") ? 1.0
						: (firmware == "Repetier") ? 1.0/80
							: -1.0;
	deltaParams.xstop *= endstopFactor;
	deltaParams.ystop *= endstopFactor;
	deltaParams.zstop *= endstopFactor;
}

function convertOutgoingEndstops() {
	var endstopFactor = (firmware == "RRF") ? 1.0
						: (firmware == "Repetier") ? 80
							: -1.0;
	deltaParams.xstop *= endstopFactor;
	deltaParams.ystop *= endstopFactor;
	deltaParams.zstop *= endstopFactor;
}

function calc() {
	convertIncomingEndstops();
	try {
		var rslt = DoDeltaCalibration();
		convertOutgoingEndstops();
		generateCommands();
	}
	catch (err) {
		document.getElementById("oResult").innerHTML = "&nbsp;Error! " + err + "&nbsp;";
		document.getElementById("oResult").style.backgroundColor = "LightPink";
	}
}

function generateCommands() {

  document.getElementById("oResult").style.backgroundColor = "LightGreen";
  if(newDeviation < oldDeviation){
    updateGCODE = [];
    updateGCODE.push("M206 T1 P893 S" + deltaParams.xstop.toFixed(0));
    updateGCODE.push("M206 T1 P895 S" + deltaParams.ystop.toFixed(0));
    updateGCODE.push("M206 T1 P897 S" + deltaParams.zstop.toFixed(0));
    updateGCODE.push("M206 T3 P901 X" + (210.0 + Number(deltaParams.xadj.toFixed(2))));
    updateGCODE.push("M206 T3 P905 X" + (330.0 + Number(deltaParams.yadj.toFixed(2))));
    updateGCODE.push("M206 T3 P909 X" + (90.0 + Number(deltaParams.zadj.toFixed(2))));
    updateGCODE.push("M206 T3 P881 X" + deltaParams.diagonal.toFixed(2));
    updateGCODE.push("M206 T3 P885 X" + deltaParams.radius.toFixed(2));
    updateGCODE.push("M206 T3 P153 X" + deltaParams.homedHeight.toFixed(2));
    updateGCODE.push("M500");
    updateGCODE.push("M117 EEPROM UPDATED");
    updateGCODE.push("M115");
    sendCommand(updateGCODE);
    console.log(updateGCODE);
		document.getElementById("oResult").innerHTML = "&nbsp;Success! " + rslt + "&nbsp;";
  }else{
		document.getElementById("oResult").innerHTML = "&nbsp;Success! " + rslt + "&nbsp; <br><br>Keeping old settings. New settings won't improve the calibration";
  }

}

