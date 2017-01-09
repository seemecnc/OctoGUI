var minOverlayTime = 2000; // Minimum time to show the Overlay w/ message

var sock;
var api = "http://" + window.location.host + "/api/";
var apikey = "ABAABABB";
var printerStatus = "Checking...";
var etemp = "--";          // Current Nozzel Temperature
var etempTarget = "--";    // Current Nozzel Target Temperature
var btemp = "--";          // Current Bed Temperature
var btempTarget = "--";    // Current Bed Target Temperature
var sortBy = "date";       // Sort Order
var sortRev = true;        // Sort order reverse flag
var printerId;             // Printer profile ID
var heatedBed = false;     // Heated Bed Flag
var currentZ;              // Current Z height
var currentZCount = 0;     // Number of sequential updates with the same Z height
var zHopCheck = 4;         // Number of checks to make sure we avoid Z hop triggering watchForZ events
var returnX = null;        // X pos to return to after lifting head
var returnY = null;        // Y pos to return to after lifting head
var returnZ;               // Z pos to return to after lifting head
var returnE;               // Extruder position to return to after chaning filament
var watchLogFor = [];      // Array of thing to watch the printer logs for
var watchForZ = [];        // Array of Z heights to watch for
var zdt;                   // Z Menu DataTable handle
var zIndex = 0;            // Z Menu build number
var zNum = 0;              // Z Menu item count
var zEventList = [];       // Array for handing entry of Z events
var hotLoading = false;    // Flag for changing filament mid-print
var liftOnly = false;      // Variable to use hotload scripts to lift head on pause without changing filament
var liftOnPause = false;   // Flag for automatically lifting the print head and retracting filament on pause
var maxZHeight = 0;        // Max printable Z height
var currentSpeed = 100;    // Current speed (percentage) of print
var currentFlow = 100;     // Current flow (percentage) of print
var pauseTimeout = 0;      // Time when current print job was paused
var pauseTemp = 0;         // Extruder temp when print job was paused
var dt;                    // fileList DataTables handle
var reconnect = false;     // variable to automatically reconnect to the printer when disconnected
var overlayShowTime = 0;   // Time that the overlay was shown on screen.
var firmwareDate = 0;      // Release date of the current firmware
var missingFW = 0;
var EEProm;
var backupCalibrationPresent = false;
var burninPrinter = null;
var lastMessage = 0;
var lastFileUpdate = 0;
var fileUpdate = 0;

var GUI;
if (String(window.location).includes("burnin")) { GUI = false; }
else{ GUI = true; }

// Online states
var onlineStates = [];
onlineStates.push("Operational");
onlineStates.push("Paused");
onlineStates.push("Printing from SD");
onlineStates.push("Printing");

var printingStates = [];
printingStates.push("Paused");
printingStates.push("Printing from SD");
printingStates.push("Printing");

// Z Events
var zEvents = [];
zEvents.push({ "command":"Filament", "label":"Change Filament" });
zEvents.push({ "command":"Speed", "label":"Change Speed" });
zEvents.push({ "command":"ExtruderTemp", "label":"Extruder Temperature" });
zEvents.push({ "command":"BedTemp", "label":"Bed Temperature" });
zEvents.push({ "command":"FanSpeed", "label":"Fan Speed" });

// Calibration GCODE
var calibrateString = [];
calibrateString['eris'] = [ "M202 Z1850", "G69 S2", "G68", "G30 S2", "M202 Z400", "M500", "G4 S2", "M115" ];
calibrateString['orion'] = [ "G69 S2", "M117 ENDSTOPS CALIBRATED", "G68 ", "M117 HORIZONTAL RADIUS CALIBRATED", "G30 S2 ", "M117 Z Height Calibrated", "G4 S2", "M500", "M117 CALIBRATION SAVED", "M115" ];
calibrateString['rostock_max_v3'] = [ "G69 S2", "M117 ENDSTOPS CALIBRATED", "G68 ", "M117 HORIZONTAL RADIUS CALIBRATED", "G30 S2 ", "M117 Z Height Calibrated", "G4 S2", "M500", "M117 CALIBRATION SAVED", "M115" ];
calibrateString['hacker_h2'] = "G29";
calibrateString['rostock_max_v2'] = "G29";

// GCODE to Load filament
var loadFilamentString = [];
loadFilamentString['eris'] = [ "G28", "M109 S220", "G91", "G1 E530 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['orion'] = [ "G28", "M109 S220", "G91", "G1 E560 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['rostock_max_v3'] = [ "G28", "M109 S220", "G91", "G1 E780 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['hacker_h2'] = [ "G28", "M109 S220", "G91", "G1 E780 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];

// GCODE to unload filament
var unloadFilamentString = [];
unloadFilamentString['eris'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['orion'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['rostock_max_v3'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-850", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['hacker_h2'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-850", "M104 S0", "G90", "G92 E0", "M84", "M115" ];

// GCODE to unload filament mid-print
var hotUnloadString = [];
hotUnloadString['eris'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "G90", "G92 E0" ];
hotUnloadString['orion'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "G90", "G92 E0" ];
hotUnloadString['rostock_max_v3'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-850", "G90", "G92 E0" ];
hotUnloadString['hacker_h2'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-850", "G90", "G92 E0" ];

// GCODE to load filament mid-print
var hotLoadString = [];
hotLoadString['eris'] = [ "G91", "G1 E530 F5000", "G1 E80 F150", "G90", "G92 E0" ];
hotLoadString['orion'] = [ "G91", "G1 E560 F5000", "G1 E80 F150", "G90", "G92 E0" ];
hotLoadString['rostock_max_v3'] = [ "G91", "G1 E780 F5000", "G1 E100 F150", "G90", "G92 E0" ];
hotLoadString['hacker_h2'] = [ "G91", "G1 E780 F5000", "G1 E100 F150", "G90", "G92 E0" ];

//dc42 variables
var oldrodlength;
var oldradius;
var oldhomedheight;
var oldxstop;
var oldystop;
var oldzstop;
var oldxpos;
var oldypos;
var oldzpos;

function isFloat(n){
  return String(n).includes('.');
  //return Number(n) === n && n % 1 !== 0;
}

function resetSocket(){

  console.log("Closing socket");
  var status = sock.close();
  console.log("Opening Socket");
  initSocket();
  console.log("Socket Opened");

}


function initSocket(){

  sock = new SockJS('http://' + window.location.host + '/sockjs?apikey='+apikey);

  // SockJS info from Octoprint
  sock.onopen = function(){

    //Slow down the update frequency to 1hz
    sock.send( JSON.stringify({"throttle": 2} ));

    //Ask for M115 info on status change
    if(typeof watchLogFor['filamentInfo'] == 'undefined' && printerStatus != "Closed" && printerStatus != "Connecting" && printerStatus != "Detecting serial port"){
      watchLogFor['firmwareInfo'] = "FIRMWARE";
      watchLogFor.length++;
      watchLogFor['filamentInfo'] = "Printed filament";
      watchLogFor.length++;
      missingFW = 0;
      sendCommand("M115");
    }

  }

  // SockJS message handling
  sock.onmessage = function(e) {

    //Only process "current" messages
    if (typeof e.data.current !== 'undefined'){
      var t;
      lastMessage = new Date().valueOf();

      if(GUI){
        if(currentZ == e.data.current.currentZ && $.isNumeric(e.data.current.currentZ)){ currentZCount++; }
        else{ currentZCount = 0; }
        //watch for Z height actions
        if(typeof watchForZ[0] !== 'undefined'){
          if(printerStatus == "Printing" && currentZCount >= zHopCheck && currentZ >= watchForZ[0]['height'] && currentZ != null){
            spottedZ(watchForZ[0]['action'],watchForZ[0]['arg']);
            watchForZ.splice(0,1);
            document.getElementById("zMenuButton").innerHTML = watchForZ.length + " Active Z Events";
          }
        }
        currentZ = e.data.current.currentZ;
        document.getElementById('currentZ').innerHTML = currentZ;
        if (e.data.current.progress.completion !== null){
          document.getElementById('progressBar').style.width = e.data.current.progress.completion.toFixed()+'%';
          document.getElementById('progressText').innerHTML = e.data.current.progress.completion.toFixed(2)+'% Complete';
        }
        document.getElementById('currentPrintTime').innerHTML = humanTime(e.data.current.progress.printTime);
        document.getElementById('currentPrintTimeLeft').innerHTML = humanTime(e.data.current.progress.printTimeLeft);

        if(typeof e.data.current.temps[0] !== 'undefined'){
          console.log(e.data.current.temps);
          etemp = e.data.current.temps[0].tool0.actual;
          etempTarget = e.data.current.temps[0].tool0.target;
          if(typeof e.data.current.temps[0].bed !== 'undefined'){
            btemp = e.data.current.temps[0].bed.actual;
            btempTarget = e.data.current.temps[0].bed.target;
            document.getElementById('bedTemp').innerHTML = btemp;
            document.getElementById('bedTempTarget').innerHTML = btempTarget;
            document.getElementById('bTempInput').value = btempTarget;
          }
          document.getElementById('extruderTemp').innerHTML = etemp;
          document.getElementById('extruderTempTarget').innerHTML = etempTarget;
          document.getElementById('eTempInput').value = etempTarget;
        }
      }

      //watch for Log actions
      if(watchLogFor.length > 0){
        for(var i in watchLogFor){
          for(var l in e.data.current.logs){
            if(t = e.data.current.logs[l].includes(watchLogFor[i])){ spottedLog(i, e.data.current.logs[l]); }
          }
        }
      }
    }
  };

}

// Actions to take when Z height is hit
function spottedZ(action,arg){

  switch(action){

    case "Speed":
      setSpeedFactor(arg);
      break;

    case "Filament":
      printCommand("pause");
      liftOnPause = true;
      break;

    case "ExtruderTemp":
      setExtruderTemp(arg);
      break;

    case "BedTemp":
      setBedTemp(arg);
      break;

    case "FanSpeed":
      fanSpeed(arg);
      break;

  }

}

// Actions to take when a given string is spotted in the log
function spottedLog(key, log){
  log = log.replace(/Recv:\ /,'');
  switch(key){

    case "COMMERROR": // Connection error - usually happens after cancelling a print on a Rostock
      delete watchLogFor[key]; watchLogFor.length--;
      connectPrinter("disconnect");
      reconnect = true;
      break;

    case "burninPrinterMenu": // Refresh the burnin printer menu and hide the overlay
      delete watchLogFor[key]; watchLogFor.length--;
      disableSteppers();
      hideOverlay();
      break;

    case "X": // Logging return extruder position
      if(! log.includes("E")){
        returnX = log.replace(/.*\ X/,'');
        returnX = returnX.replace(/\ Y*.*/,'');
        returnX = returnX.replace(/\*.*/,'');
        returnY = log.replace(/.*\ Y/,'');
        returnY = returnY.replace(/\*.*/,'');
      }
      break;

    case "E": // Logging return extruder position
      returnE = log.replace(/.*\ E/,'');
      returnE = returnE.replace(/\*.*/,'');
      if(log.includes("X")){ returnX = log.replace(/.*\ X/,''); returnX = returnX.replace(/\ Y*.*/,''); }
      if(log.includes("Y")){ returnY = log.replace(/.*\ Y/,''); returnY = returnY.replace(/\ E*.*/,''); }
      break;

    case "stateToPaused": // Hotunload trigger
      console.log("Printer is paused. Last E is " + returnE);
      printerStatus = "Paused";
      if(returnE > 0) {
        document.getElementById('hotUnload').style.visibility = "visible";
        if(liftOnPause){ pauseUnload(); }
      }
      delete watchLogFor[key]; watchLogFor.length--;
      delete watchLogFor["E"]; watchLogFor.length--;
      delete watchLogFor["X"]; watchLogFor.length--;
      console.log("Return E: " + returnE + " - Return XY: " + returnX + "/" + returnY);
      if(returnX == null || returnY == null){ alert("Return coordinates not available. Resume print and try again"); }
      break;

    case "firmwareInfo": // Use Firmware info to verify printer model
      var pId;
      var fw = log.replace(/FIRMWARE_NAME:/,'');
      var fwd = log.replace(/.*_DATE:/,'');
      var fwp = log.replace(/.*MACHINE_TYPE:/,'');
      missingFW = 0;
      fw = fw.replace(/\ .*/,'');
      firmwareDate = Number(fwd.replace(/\ .*/,''));
      document.getElementById('firmwareInfo').style.visibility = "visible";
      document.getElementById('firmwareInfo').innerHTML = fw;
      document.getElementById('firmwareDate').style.visibility = "visible";
      document.getElementById('firmwareDate').innerHTML = firmwareDate;
      switch(fwp){
        case "ERIS Delta":
          pId = "eris";
          break;
        case "ORION Delta":
          pId = "orion";
          break;
        case "Rostock Max v2":
          pId = "rostock_max_v2";
          break;
        case "Rostock MAX v3":
          pId = "rostock_max_v3";
          break;
        case "Hacker H2":
          pId = "hacker_h2";
          break;
        default:
          pId = 'default';
          console.log("Printer ("+fwp+") not supported!");
          break;
      }
      if(pId != printerId && printerStatus == "Operational" ){ setPrinterProfile(pId); }
      delete watchLogFor[key]; watchLogFor.length--;

      //Init trap for Comm Error if it's not alreay set
      if(typeof watchLogFor['COMMERROR'] == 'undefined'){ watchLogFor['COMMERROR'] = 'sufficient'; watchLogFor.length++; }
      break;

    case "filamentInfo": // Update amount of filament used
      missingFW = 0;
      if(GUI){
        document.getElementById('filamentInfo').style.visibility = "visible";
        document.getElementById('filamentInfo').innerHTML = log;
      }
      delete watchLogFor[key]; watchLogFor.length--;
      break;

    case "hideOverlay": // Set the Overlay to hidden
      var curTime = new Date().valueOf();
      if(overlayShowTime > 0 && (overlayShowTime + minOverlayTime >= curTime)){ setTimeout(hideOverlay, overlayShowTime + minOverlayTime - curTime); }
      else{ hideOverlay(); }
      delete watchLogFor[key]; watchLogFor.length--;
      break;

    case "editEEProm":
      var bits = log.split(" ");
      var t = bits[0].replace(/EPR:/,'');
      var eIndex = "e" + t + bits[1];
      edt.row.add([log.substring(log.indexOf(bits[3])),"<input type=text id=" + eIndex +" value='" + bits[2] + "' size=10>" ]).draw();
      edt.page('last').draw('page');
      if(isFloat(bits[2])){
        $('#'+eIndex).numpad({ decimalSeparator: '.', onKeypadClose: function(){ updateEEProm(t,bits[1],'X',eIndex); } });
      }else{
        $('#'+eIndex).numpad({ decimalSeparator: '.', hideDecimalButton: true, onKeypadClose: function(){ updateEEProm(t,bits[1],'S',eIndex); } });
      }
      if(log.includes("EPR:3 246")){
        document.getElementById("eepromContent").innerHTML = "";
        edt.page('first').draw('page');
        delete watchLogFor[key]; watchLogFor.length--;
      }
      break;

    case "backupEEProm":
      var bits = log.split(" ");
      var t = bits[0].replace(/EPR:/,'');
      switch(t+bits[1]){

        case "1893": // X endstop
          EEProm.push("M206 T1 P893 S" + bits[2]);
          break;

        case "1895": // Y endstop
          EEProm.push("M206 T1 P895 S" + bits[2]);
          break;

        case "1897": // Z endstop
          EEProm.push("M206 T1 P897 S" + bits[2]);
          break;

        case "3901": // Alpha A
          EEProm.push("M206 T3 P901 X" + bits[2]);
          break;

        case "3905": // Alpha B
          EEProm.push("M206 T3 P905 X" + bits[2]);
          break;

        case "3909": // Alpha C
          EEProm.push("M206 T3 P909 X" + bits[2]);
          break;

        case "3881": // Diagonal Rod Length
          EEProm.push("M206 T3 P881 X" + bits[2]);
          break;

        case "3885": // Horizontal Radius
          EEProm.push("M206 T3 P885 X" + bits[2]);
          break;

        case "3153": // Z Max Length
          EEProm.push("M206 T3 P153 X" + bits[2]);
          break;

        case "3925": // Max Printable Radius
          EEProm.push("M206 T3 P925 X" + bits[2]);
          break;

        case "3808": // Z-probe Offset
          EEProm.push("M206 T3 P808 X" + bits[2]);
          break;

        case "0230": // Extr Max PID
          EEProm.push("M206 T0 P230 S" + bits[2]);
          break;

        case "3246": // Last EEProm value
          EEProm.push("M500");
          EEProm.push("M117 Calibration Restored");
          if(backupCalibrationPresent){ deleteFile("local","calibration-backup.gcode"); }
          $.ajax({
            url: "include/f.php?c=backupcalibration",
            type: "post",
            data: {"data": JSON.stringify(EEProm)},
            complete: (function(data,type){
              if(type == "success"){
                jdata = JSON.parse(data.responseText);
                if(jdata.status == 1){
                  bootbox.alert({
                    message: "Calibration saved as calibration-backup.gcode",
                    backdrop: true
                  });
                  updateFiles();
                }else{
                  bootbox.alert({
                    message: "Error backing up calibration<br>Please consult your manual",
                    backdrop: true
                  });
                }
                hideOverlay();
              }else{
                bootbox.alert({
                  message: "Error backing up calibration<br>Insufficient Squirrels",
                  backdrop: true
                });
              }
            })
          });
          delete watchLogFor[key]; watchLogFor.length--;
          break;

      }
      break;

    case "loadEEProm":
      var bits = log.split(" ");
      var t = bits[0].replace(/EPR:/,'');
      switch(t+bits[1]){

        case "1893": // X endstop
          oldxstop = parseInt(bits[2]);
          EEProm.push("M206 T1 P893 S" + bits[2]);
          break;

        case "1895": // Y endstop
          oldystop = parseInt(bits[2]);
          EEProm.push("M206 T1 P895 S" + bits[2]);
          break;

        case "1897": // Z endstop
          oldzstop = parseInt(bits[2]);
          EEProm.push("M206 T1 P897 S" + bits[2]);
          break;

        case "3901": // Alpha A
          oldxpos = parseFloat(bits[2]) - 210;
          EEProm.push("M206 T3 P901 X" + bits[2]);
          break;

        case "3905": // Alpha B
          oldypos = parseFloat(bits[2]) - 330;
          EEProm.push("M206 T3 P905 X" + bits[2]);
          break;

        case "3909": // Alpha C
          oldzpos = parseFloat(bits[2]) - 90;
          EEProm.push("M206 T3 P909 X" + bits[2]);
          break;

        case "3881": // Diagonal Rod Length
          oldrodlength = parseFloat(bits[2]);
          EEProm.push("M206 T3 P881 X" + bits[2]);
          break;

        case "3885": // Horizontal Radius
          oldradius = parseFloat(bits[2]);
          EEProm.push("M206 T3 P885 X" + bits[2]);
          break;

        case "3153": // Z Max Length
          oldhomedheight = parseFloat(bits[2]);
          EEProm.push("M206 T3 P153 X" + bits[2]);
          break;
      }
      if(EEProm.length == 9){
        delete watchLogFor[key]; watchLogFor.length--;
        deltaParams = new DeltaParameters(
          oldrodlength, oldradius, oldhomedheight, oldxstop, oldystop, oldzstop, oldxpos, oldypos, oldzpos
        );
        xBedProbePoints = [];
        yBedProbePoints = [];
        zBedProbePoints = [];
        for (var i = 0; i < numPoints; ++i) {
          xBedProbePoints.push(probePoints[i][0]);
          yBedProbePoints.push(probePoints[i][1]);
        }
        watchLogFor["zProbe"] = "PROBE-ZOFFSET"; watchLogFor.length++;
        showOverlay("Probing for Delta Calibration<br><div id='oDebug'></div><br><div id='oResult'></div>");
        sendCommand(probeGCODE);
      }
      break;

    case "zProbe":
      console.log(log);
      var z = parseFloat(log.replace(/.*PROBE-ZOFFSET:/,''));
      zBedProbePoints.push(-z);

      if(zBedProbePoints.length >= numPoints){
        delete watchLogFor[key]; watchLogFor.length--;
        console.log("Done Probing");
        console.log(zBedProbePoints);
        calc();
      }
      break;

  }
}

function deltaCalibration(){
  if(printerStatus == "Operational"){
    showOverlay("Loading current settings from EEProm");
    loadProbePoints();
    EEProm = [];
    watchLogFor["loadEEProm"] = "Recv: EPR:"; watchLogFor.length++;
    sendCommand("M205");
  }else{
    bootbox.alert({
      message: "You cannot calibrate when printer is in state: " + printerStatus,
      backdrop: true
    });
  }
}

function backupCalibration(){

  if(printerStatus == "Operational"){
    showOverlay("Backing up EEProm (calibration)");
    EEProm = [];
    watchLogFor["backupEEProm"] = "Recv: EPR:"; watchLogFor.length++;
    sendCommand("M205");
  }else{
    bootbox.alert({
      message: "You cannot backup EEProm when printer is in state: " + printerStatus,
      backdrop: true
    });
  }

}

function updateEEProm(t, p, f, eIndex){

  var val = document.getElementById(eIndex).value;
  sendCommand("M206 T" + t + " P" + p + " " + f + val);

}

function hideEEProm(){

  document.getElementById("eepromWindow").style.width = 0;
  edt.clear().draw();

}

function showEEProm(){

  document.getElementById("eepromContent").innerHTML = "Loading EEProm Values<br>";
  document.getElementById("eepromWindow").style.width = "100%";

}

function loadEEProm(){
  watchLogFor["editEEProm"] = "Recv: EPR:"; watchLogFor.length++;
  sendCommand("M205");
  showEEProm();
}

// Find the current IP of the client and update it on screen
function getClientIP() {
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
  pc.createDataChannel("");
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);
  pc.onicecandidate = function(ice){
    if(!ice || !ice.candidate || !ice.candidate.candidate){
      document.getElementById("clientIP").innerHTML = "<a onclick='getClientIP()'>Check for IP</a>";
      return;
    }
    var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
    window.clientIP = myIP;
    document.getElementById("clientIP").innerHTML = myIP;
    pc.onicecandidate = noop;
  };
}

// Sort an array by the given property
function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

function fanSpeed(speed){
  var c = null;
  switch(speed){
    case "on":
      c = "M106";
      break;
    case "off":
      c = "M107";
      break;
    default:
      if($.isNumeric(speed)){
        if(speed > 100) { speed = 100; }
        if(speed == 0 || speed < 0){ c = "M107"; }
        else{ c = "M106 S" + Math.round(speed * 2.55); }
      }else{ console.log("Error - fan speed not recognized"); return; }
      break;
  }
  if(c != null){ sendCommand(c); }
}

// Send the Calibrate GCODE to the printer if it is configured and the printer is Operational
function calibratePrinter(){
  if(printerStatus == "Operational"){
    if (typeof calibrateString[printerId] !== 'undefined' || firmwareDate >= 20161118){
      bootbox.confirm("Make sure the print bed is clear and there is no filament hanging from the extruder.", function(result){
        if(result){
          if(firmwareDate >= 20161118){
            missingFW = 0;
            sendCommand(["G29", "M115"]);
          }
          else{ sendCommand(calibrateString[printerId]); }
          watchLogFor["hideOverlay"] = "MACHINE_TYPE"; watchLogFor.length++;
          showOverlay("Printer is Calibrating");
        }
      });
    }else{
      bootbox.alert({
        message: "Calibration script is not set for the " + printerId,
        backdrop: true
      });
    }
  }else{
    bootbox.alert({
      message: "Cannot calibrate when printer is " + printerStatus,
      backdrop: true
    });
  }
}

// Load filament if it is configured and the printer is Operational
function loadFilament(){
  if(printerStatus == "Operational"){
    if (typeof loadFilamentString[printerId] !== 'undefined'){
      bootbox.confirm("You are about to LOAD filament. Make sure that it is 1 inch past the end of the extruder.", function(result){
        if(result){
          missingFW = 0;
          sendCommand(loadFilamentString[printerId]);
          watchLogFor["hideOverlay"] = "MACHINE_TYPE"; watchLogFor.length++;
          showOverlay("Heating nozzel and<br>Loading Filament");
        }
      });
    }
    else{
      bootbox.alert({
        message: "Load Filament script is not set for the " + printerId,
        backdrop: true
      });
    }
  }else{
    bootbox.alert({
      message: "Cannot load filament when printer is " + printerStatus,
      backdrop: true
    });
  }
}

// Unload filament if it is configured and the printer is Operational
function unloadFilament(){
  if(printerStatus == "Operational"){
    if (typeof unloadFilamentString[printerId] !== 'undefined'){
      bootbox.confirm("You are about to UNLOAD filament. Please Confirm this is what you want to do.", function(result){
        if(result){
          missingFW = 0;
          sendCommand(unloadFilamentString[printerId]);
          watchLogFor["hideOverlay"] = "MACHINE_TYPE"; watchLogFor.length++;
          showOverlay("Heating nozzel and<br>Retracting Filament");
        }
      });
    }
    else{
      bootbox.alert({
        message: "Unload Filament script is not set for the " + printerId,
        backdrop: true
      });
    }
  }else{
    bootbox.alert({
      message: "Cannot load filament when printer is " + printerStatus,
      backdrop: true
    });
  }
}

// Set the Nozzel temperature
function setExtruderTemp(target){
  $.ajax({
    url: api+"printer/tool?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify({"command":"target","targets":{"tool0": target}})
  });
  etempTarget = target;
  document.getElementById('extruderTempTarget').innerHTML = etempTarget;
  document.getElementById('eTempInput').value = etempTarget;
}

// Set the Bed temperature
function setBedTemp(target){
  if(heatedBed){
    $.ajax({
      url: api+"printer/bed?apikey="+apikey,
      type: "post",
      contentType:"application/json; charset=utf-8",
      data: JSON.stringify({"command":"target","target":target})
    });
    btempTarget = target;
    document.getElementById('bedTempTarget').innerHTML = btempTarget;
    document.getElementById('bTempInput').value = btempTarget;
  }else{
    bootbox.alert({ message: "Cannot set bed temp.<br>No heated bed detected.", backdrop: true });
  }
}

// Check and updated the current connection status for the printer
function updateConnectionStatus(){

  $.ajax({
    url: api+"connection?apikey="+apikey,
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      if(type == "success"){
        jdata = JSON.parse(data.responseText);

        //Reconnect check when connection is closed
        if(printerStatus == "Closed" && reconnect){ reconnect = false; connectPrinter("connect"); }

        //Clear Z events when a print job is completed or cancelled
        if(printerStatus == "Printing" && jdata.current.state != "Printing" && jdata.current.state != "Paused" && typeof watchForZ[0] !== 'undefined'){
          watchForZ = [];
          console.log("Clearing Z events");
          document.getElementById("zMenuButton").innerHTML = watchForZ.length + " Active Z Events";
        }

        if(GUI){
          if(jdata.current.state == "Operational"){
            if(printerStatus != "Operational"){
              hotLoading = false;
              liftOnly = false;
              liftOnPause = false;
              currentSpeed = 100;
              document.getElementById('speedFactor').value = currentSpeed;
              currentFlow = 100;
              document.getElementById('flowFactor').value = currentFlow;
              if(typeof calibrateString[printerId] !== 'undefined'){ document.getElementById('calibratePrinter').style.visibility = "visible"; }
              else { document.getElementById('calibratePrinter').style.visibility = "hidden"; }
              if(typeof loadFilamentString[printerId] !== 'undefined'){ document.getElementById('loadFilament').style.visibility = "visible"; }
              else { document.getElementById('loadFilament').style.visibility = "hidden"; }
              if(typeof unloadFilamentString[printerId] !== 'undefined'){ document.getElementById('unloadFilament').style.visibility = "visible"; }
              else { document.getElementById('unloadFilament').style.visibility = "hidden"; }
              updateFiles();
            }
          }else{
            if(jdata.current.state != printerStatus){
              document.getElementById('calibratePrinter').style.visibility = "hidden";
              document.getElementById('loadFilament').style.visibility = "hidden";
              document.getElementById('unloadFilament').style.visibility = "hidden";
              document.getElementById("zMenuButton").innerHTML = watchForZ.length + " Active Z Events";
            }
          }
          if(onlineStates.indexOf(printerStatus) != -1){
            if(lastMessage > 0 && lastMessage + (1 * 60 * 1000) <= (new Date().valueOf())){
              lastMessage = 0;
              resetSocket();
              bootbox.alert({
                message: "Octoprint Socket has been reset! - Tell Ryan",
                backdrop: true
              });
            }
          }
        }

        //Update filament and firmware info when printer enters Operational state
        if(printerStatus != "Operational" && jdata.current.state == "Operational" && typeof watchLogFor['filamentInfo'] == 'undefined'){
          watchLogFor['firmwareInfo'] = "FIRMWARE";
          watchLogFor.length++;
          watchLogFor['filamentInfo'] = "Printed filament";
          watchLogFor.length++;
          sendCommand("M115");
          missingFW = 0;
          printerStatus = jdata.current.state;
          if(!GUI){ burninMenu(); }
        }
        else{ //In case the M115 command gets lost in the shuffle
          if(typeof watchLogFor['filamentInfo'] !== 'undefined' && printerStatus == "Operational" && missingFW < 3){
            sendCommand("M115");
            missingFW++;
          }
        }
        printerStatus = jdata.current.state;

        //Automaticaly reconnect if Z-probe errors borks the connection
        if(printerStatus.includes("Error: Z-probe failed")){ connectPrinter("connect"); printerStatus = "Connecting"; }
      }else{
        printerStatus = "Unknown";
      }
    })
  });
}

// Update non SockJS fields on the user interface
function updateStatus(){

  updateConnectionStatus();

  if(GUI){
    //Shut down the hot end if paused too long
    if(lastFileUpdate + (5 * 60 * 1000) <= (new Date().valueOf())){ updateFiles(); }
    if(printerStatus == "Paused" && pauseTimeout > 0){
      if(pauseTimeout + (5 * 60 * 1000) <= (new Date().valueOf())){
        console.log("Printer paused for too long. Shutting off hot end");
        pauseTemp = etempTarget;
        setExtruderTemp(0);
        pauseTimeout = 0;
      }
    }
    if(printerStatus == "Operational" || printerStatus == "Printing" || printerStatus == "Paused"){
      $.ajax({
        url: api+"printer?apikey="+apikey,
        type: "get",
        contentType:"application/json; charset=utf-8",
        complete: (function(data,type){
          if(type == "success"){
            jdata = JSON.parse(data.responseText);
            etemp = jdata.temperature.tool0.actual;
            etempTarget = jdata.temperature.tool0.target;
            if(heatedBed && typeof jdata.temperature.bed !== 'undefined'){
              btemp = jdata.temperature.bed.actual;
              btempTarget = jdata.temperature.bed.target;
            }
            updateJobStatus();
          }else{
            updateConnectionStatus();
          }
        })
      });
    }else{
    }
    document.getElementById('extruderTemp').innerHTML = etemp;
    document.getElementById('bedTemp').innerHTML = btemp;
    document.getElementById('extruderTempTarget').innerHTML = etempTarget;
    document.getElementById('eTempInput').value = etempTarget;
    document.getElementById('bedTempTarget').innerHTML = btempTarget;
    document.getElementById('bTempInput').value = btempTarget;
  }
  document.getElementById('currentStatus').innerHTML = printerStatus;
}

// Updates the status fields for the current print job
function updateJobStatus(){
  $.ajax({
    url: api+"job?apikey="+apikey,
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      if(type == "success"){
        jdata = JSON.parse(data.responseText);
        document.getElementById('currentName').innerHTML = jdata.job.file.name;
        if (jdata.job.filament !== null && typeof jdata.job.filament.tool0 !== 'undefined') { document.getElementById('currentFilament').innerHTML = (jdata.job.filament.tool0.length / 1000).toFixed(2) + "m"; }
      }else{
        document.getElementById('currentName').innerHTML = "";
        document.getElementById('currentFilament').innerHTML = "";
      }
    })
  });

}

// Have Octoprint load the current file and prep it for printing. Sending a second argument (true) starts the print after loading
function selectFile(file,print){
  print = print || 0;
  var c;
  if(print){ c = {"command":"select","print":true}; }
  else{ c = {"command":"select"}; }
  $.ajax({
    url: api+"files/" + file +"?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(c),
    success: (function(){ updateStatus(); })
  });
}

// Changes the File sort field
function setSortBy(s){
  if(sortBy == s){
    if(sortRev){ sortRev = false; }
    else{ sortRev = true; }
  }else{ sortRev = false; }
  sortBy = s;
  updateFiles();
}

// Copies file from local storage to USB
function copyToUsb(file){
  var text;
  var currentPage = dt.page();
  $.ajax({
    url: "include/f.php?c=copyToUsb&f=" + file,
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      jdata = JSON.parse(data.responseText);
      if(jdata.status){ text = "File " + file + " copied to USB storage"; }
      else{ text = "Error copying " + file; }
      bootbox.alert({ message: text, backdrop: true });
    })
  });
}

// Copies file from the USB stick to local storage
function copyToLocal(file){
  var text;
  var currentPage = dt.page();
  $.ajax({
    url: "include/f.php?c=copy&f=" + file,
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      jdata = JSON.parse(data.responseText);
      if(jdata.status){ text = "File " + file + " copied to local storage"; }
      else{ text = "Error copying " + file; }
      bootbox.alert({ message: text, backdrop: true });
      document.getElementById('currentName').innerHTML = "Loading...";
      document.getElementById('currentFilament').innerHTML = "Calculating...";
      updateFiles(currentPage);
      updateStatus();
    })
  });
}

// Deletes a given file from the given locations
function deleteFile(origin, file){
  var currentPage = dt.page();
  switch(origin){
    case "local":
      $.ajax({
        url: api+ "files/local/" + file + "?apikey=" +apikey,
        type: "delete",
        contentType:"application/json; charset=utf-8",
        complete: (function(data,type){
          if(data.status == 204){
            updateFiles(currentPage);
          }
          else{ alert("Error deleting " + file); }
        })
      });
      break;
    case "usb":
      $.ajax({
        url: "include/f.php?c=delete",
        type: "post",
        data: {"f" : file},
        complete: (function(data,type){
          jdata = JSON.parse(data.responseText);
          if(jdata.status == 1){
            updateFiles(currentPage);
          }
          else{ alert("Error deleting " + file); }
        })
      });
      break;
    case "sdcard":
      $.ajax({
        url: api+ "files/sdcard/" + file + "?apikey=" +apikey,
        type: "delete",
        contentType:"application/json; charset=utf-8",
        complete: (function(data,type){
          if(data.status == 204){
            updateFiles(currentPage);
          }
          else{ alert("Error deleting " + file); }
        })
      });
      break;
  }
}

// Refreshes the fileList table - keeps current page if provided
function updateFiles(page){
  fileUpdate = 1;
  lastFileUpdate = new Date().valueOf();
  $.ajax({
    url: api+"printer/sd?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify({"command":"refresh"})
  });
  page = page || 0;
  $.ajax({
    url: "include/f.php?c=list",
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      fileUpdate = 0;
      if(type == "success"){
        backupCalibrationPresent = false;
        jdata = JSON.parse(data.responseText);
        dt.clear();
        if(jdata == null){ dt.draw(); }
        else{
          var sortString;
          if(sortRev){ sortString = "-" + sortBy; }
          else{ sortString = sortBy; }
          var files = jdata.sort(dynamicSort(sortString));
          files.forEach(function(f){
            dt.row.add([ f.origin, f.name ]);
            if(f.origin == "local" && f.name == "backup-calibration.gcode"){ backupCalibrationPresent = true; }
          });
          if(page > 0){
            if(page >= (dt.page.info().pages)){ page = dt.page.info().pages - 1; }
            dt.page(page).draw(false);
          }else { dt.draw(); }
        }
      }
    })
  });
}

// Converts seconds to human readable hours, minutes, seconds
function humanTime(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

// Send given GCODE (single command or array of commands) to the printer via Octoprint
function sendCommand(command){
  var c;
  if(command instanceof Array){ c = { "commands": command }; }
  else{ c = { "command": command }; }
  $.ajax({
    url: api+"printer/command?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(c)
  });
}

function disableSteppers(){
  if(printerStatus == "Printing" || printerStatus == "Printing from SD"){
    bootbox.alert({
      message: "Print job in progress. Cancel the job if you really want to disable the stepper motors.",
      backdrop: true
    });
  }else{
    sendCommand("M84");
  }
}

// Home all Axis and disabled the stepper motors. TODO: Setup motor enable/disable fuctions/buttons
function homePrinter(){
  if(printerStatus == "Printing" || printerStatus == "Printing from SD"){
    bootbox.alert({
      message: "Print job in progress. Cancel the job if you really want to home the print head.",
      backdrop: true
    });
  }else{
    $.ajax({
      url: api+"printer/printhead?apikey="+apikey,
      type: "post",
      contentType:"application/json; charset=utf-8",
      data: JSON.stringify({ 'command': "home", 'axes': [ 'x', 'y', 'z' ] })
    });
  }
}

// Initiate connection to the printer
function connectPrinter(com){
  var c;
  if(com == "connect"){
    $.ajax({
      url: "include/f.php?c=port",
      type: "get",
      contentType:"application/json; charset=utf-8",
      complete: (function(data,type){
        jdata = JSON.parse(data.responseText);
        if(jdata.port == "ERROR"){ c = { 'command': "connect","baudrate": 250000 }; }
        else{ c = { 'command': "connect","baudrate": 250000,"port": jdata.port }; }
        $.ajax({ url: api+"connection?apikey="+apikey, type: "post", contentType:"application/json; charset=utf-8", data: JSON.stringify(c), success: (function(){ updateStatus(); }) });
      })
    });
  }
  else {
    c = { 'command': "disconnect"};
    printerStatus = "Disconnecting";
    document.getElementById('currentStatus').innerHTML = printerStatus;
    $.ajax({ url: api+"connection?apikey="+apikey, type: "post", contentType:"application/json; charset=utf-8", data: JSON.stringify(c), success: (function(){ updateStatus(); }) });
  }
}

// Resume printing after pausing and changing filament
function resumeHotLoad(){
  document.getElementById('hotUnload').style.visibility = "hidden";
  if(hotLoading){
    if(liftOnly){ sendCommand("G92 E0"); }
    if(returnX != null && returnY != null){
      sendCommand( [ "G28", "90", "G0 X" + returnX + " Y" + returnY + " Z" + returnZ +" F1440 E12", "G92 E" + returnE ] );
    }else{ sendCommand( [ "G28", "90", "G0 Z" + returnZ +" F1440 E12", "G92 E" + returnE ] ); }
    document.getElementById('hotLoad').style.visibility = "hidden";
    hotLoading = false;
    liftOnly = false;
    returnE = 0;
    returnX = null;
    returnY = null;
  }
}

function pauseAndLift(){
  if(printerStatus == "Printing"){
    liftOnly = true;
    liftOnPause = true;
    printCommand("pause");
  }else{
    if(printerStatus == "Paused"){ printCommand("pause"); }
  }
}

// Send basic print job command ( play, pause, cancel )
function printCommand(command){
  var c;
  if(command == "pause"){
    c = JSON.stringify({ 'command': "pause", 'action': 'toggle' });
    if(printerStatus == "Printing" && currentZ < (maxZHeight - 10)) {
      console.log("Printing paused at " + currentZ);
      watchLogFor['E'] = ' E';
      watchLogFor.length++;
      watchLogFor['X'] = ' X';
      watchLogFor.length++;
      watchLogFor['stateToPaused'] = 'Paused';
      watchLogFor.length++;
    }
    if(printerStatus == "Paused") {
      if(pauseTemp > 0){
        console.log("Heating extruder before loading filament");
        c.unshift("M109 S"+pauseTemp);
        pauseTemp = 0;
      }
      resumeHotLoad();
    }
  }else{
    if(command == "start" && printerStatus == "Paused"){ c = JSON.stringify({ 'command': "pause", 'action': 'toggle' }); resumeHotLoad(); }
    else{ c = JSON.stringify({ 'command': command }); }
  }
  if(command == "cancel"){
    if(printingStates.indexOf(printerStatus) != -1){
      bootbox.confirm("Are you sure you want to cancel the current print job?.", function(result){
        if(result){
          showOverlay("Canceling print job");
          watchLogFor["hideOverlay"] = "Operational"; watchLogFor.length++;
          $.ajax({ url: api+"job?apikey="+apikey, type: "post", contentType:"application/json; charset=utf-8", data: c, success: (function(){
            sendCommand("G28");
            setExtruderTemp(0);
            if(heatedBed){ setBedTemp(0);
            } }) });
        }
      });
    }
  }else{
    $.ajax({ url: api+"job?apikey="+apikey, type: "post", contentType:"application/json; charset=utf-8", data: c });
  }
}

// Head Jog command pulling increment from the GUI
function jogHead(axis,dir){
  var d; //jog distance
  jogI = $('input[name="jogIncrement"]:checked').val();
  if(dir == "-"){ d = Number(dir + jogI); }
  else{ d = Number(jogI); }
  var c = {'command':'jog'};
  c[axis] = d;
  $.ajax({
    url: api+"printer/printhead?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(c)
  });
}

// Head Job command with specified axis and increment
function moveHead(axis,distance){
  var c = {'command':'jog'};
  c[axis] = distance;
  $.ajax({
    url: api+"printer/printhead?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(c)
  });
}

// Set a new default connection profile and disconnect. Prompt to notify and delay reconnect
function setPrinterProfile(newPrinterId){
  reconnect = true;
  connectPrinter("disconnect");
  $.ajax({
    url: api+"printerprofiles/" + newPrinterId + "?apikey="+apikey,
    type: "patch",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify({"profile":{"default":1}}),
    success: (function(){
      getPrinterProfile();
      showOverlay("New printer detected.<br><br>Changing profile and reconnecting.");
      watchLogFor['hideOverlay'] = "Operational"; watchLogFor.length++;
    })
  });

}

// Get the currently selected default printer profile and set global vars
function getPrinterProfile(){
  $.ajax({
    url: api+"printerprofiles?apikey="+apikey,
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      jdata = JSON.parse(data.responseText);
      for(i in jdata.profiles){
        if(jdata.profiles[i].default){
          printerId = jdata.profiles[i].id;
          heatedBed = jdata.profiles[i].heatedBed;
          maxZHeight = jdata.profiles[i].volume.height;
          document.getElementById('printerModel').innerHTML = jdata.profiles[i].name;
          if(GUI){
            if(heatedBed) {
              document.getElementById('bedTempDisplay').style.visibility = "visible";
              document.getElementById('bedTempSet').style.visibility = "visible";
            }else {
              document.getElementById('bedTempDisplay').style.visibility = "hidden";
              document.getElementById('bedTempSet').style.visibility = "hidden";
            }
            if(printerId == 'eris'){ document.getElementById('fanControl').style.visibility = "hidden"; }
            else { document.getElementById('fanControl').style.visibility = "visible"; }
          }
        }
      }
    })
  });
}

// whie paused, Raise print head and unload filament
function pauseUnload(){
  if(printerStatus == "Paused" && typeof hotUnloadString[printerId] !== 'undefined' && currentZ < (maxZHeight - 10)){
    if(returnE > 0){
      hotLoading = true;
      returnZ = currentZ;
      sendCommand("G28");
      if(!(liftOnly)){ sendCommand(hotUnloadString[printerId]); }
      document.getElementById('hotUnload').style.visibility = "hidden";
      document.getElementById('hotLoad').style.visibility = "visible";
      pauseTimeout = new Date().valueOf();
    }else{ alert("Error. Last extruder position not found. Please Resume your print, then pause to try again."); }
  }else{ alert("pauseUnload criteria not met! " + printerStatus + " Z:" + currentZ + "/" + maxZHeight); }
}

// Load filament after changing mid print, heating nozzel if necissary
function playLoad(){
  var c = hotLoadString[printerId];
  if(printerStatus == "Paused" && typeof hotLoadString[printerId] !== 'undefined'){
    if(pauseTemp > 0){
      console.log("Heating extruder before loading filament");
      c.unshift("M109 S"+pauseTemp);
      pauseTemp = 0;
    }
    sendCommand(c);
    document.getElementById('hotLoad').style.visibility = "hidden";
  }
}

// Set the flow factor (percent)
function setFlowFactor(flow){
  sendCommand("M221 S"+flow);
  currentFlow = flow;
  document.getElementById('flowFactor').value = currentFlow;
}

// Set the speed factor (percent)
function setSpeedFactor(speed){
  sendCommand("M220 S" + speed);
  currentSpeed = speed;
  document.getElementById('speedFactor').value = currentSpeed;
}

// One off inits, tasks, etc to be done after page is loaded
function startupTasks(page){

  switch(page){
    case "gui":
      $('#wifiNetworkName').keyboard({});
      $('#wifiNetworkPassword').keyboard({});

      dt = $('#filesList').DataTable( {
        columns: [ { title: "L" }, { title: "Name" } ],
        searching: false,
        fixedHeader: false,
        ordering: false,
        info: false,
        pageLength: 4,
        pagingType: "full",
        lengthChange: false,
        select: { items: "row", single: true},
        fnDrawCallback: function() { $("#filesList thead").remove(); }
      } );

      // Onclick handlers for file list
      $('#filesList tbody').on( 'click', 'tr', function () {
        var origin = this.cells[0].innerHTML;
        var name = this.cells[1].innerHTML;
        var gcodeOptions;
        if(onlineStates.indexOf(printerStatus) != -1){
          gcodeOptions = [
            { text: 'Load ' + name + ' for printing', value: '1' },
            { text: 'Print ' + name + ' now', value: '2' },
            { text: 'Delete ' + name, value: '4' }];
        }else{
          gcodeOptions = [
            { text: 'Delete ' + name, value: '4' }];

        }

        switch(origin){
          case "local":
            gcodeOptions.push({ text: 'Copy ' + name + ' to USB', value: '3' });
            bootbox.prompt({
              title: name,
              inputType: 'checkbox',
              inputOptions: gcodeOptions,
              callback: function (result) {
                if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                  switch(r){
                    case "1": selectFile(origin + "/" + name); break;
                    case "2":
                      selectFile(origin + "/" + name,true);
                      watchLogFor["hideOverlay"] = "Printing"; watchLogFor.length++;
                      showOverlay("Preparing to Print:\n" + name);
                      break;
                    case "3": copyToUsb(name); break;
                    case "4": deleteFile(origin, name); break;
                  }
                }); }
              }
            });
            break;
          case "sdcard":
            bootbox.prompt({
              title: name,
              inputType: 'checkbox',
              inputOptions: gcodeOptions,
              callback: function (result) {
                if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                  switch(r){
                    case "1": selectFile(origin + "/" + name); break;
                    case "2":
                      selectFile(origin + "/" + name,true);
                      watchLogFor["hideOverlay"] = "Printing"; watchLogFor.length++;
                      showOverlay("Preparing to Print:\n" + name);
                      break
                    case "4": deleteFile(origin, name); break;
                  }
                }); }
              }
            });
            break;
          case "usb":
            bootbox.prompt({
              title: name,
              inputType: 'checkbox',
              inputOptions: [
                { text: 'Copy ' + name + ' to local storage', value: '1' },
                { text: 'Delete ' + name + ' from USB', value: '2' } ],
                callback: function (result) {
                  if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                    switch(r){
                      case "1": copyToLocal(name); break;
                      case "2": deleteFile(origin, name); break;
                    }
                  }); }
                }
            });
            break;
        }
      } );

      getClientIP();

      //Init the different popup number pads
      $('#eTempInput').numpad({
        onKeypadClose: function(){ setExtruderTemp(Number(document.getElementById('eTempInput').value)); },
        hidePlusMinusButton: true,
        hideDecimalButton: true
      });
      $('#bTempInput').numpad({
        onKeypadClose: function(){ setBedTemp(Number(document.getElementById('bTempInput').value)); },
        hidePlusMinusButton: true,
        hideDecimalButton: true
      });
      $('#speedFactor').numpad({
        onKeypadClose: function(){ setSpeedFactor(Number(document.getElementById('speedFactor').value)); },
        hidePlusMinusButton: true,
        hideDecimalButton: true
      });
      $('#flowFactor').numpad({
        onKeypadClose: function(){ setFlowFactor(Number(document.getElementById('flowFactor').value)); },
        hidePlusMinusButton: true,
        hideDecimalButton: true
      });
      $('#zHopChecks').numpad({
        onKeypadClose: function(){ zHopCheck = Number(document.getElementById('zHopChecks').value); },
          hidePlusMinusButton: true,
          hideDecimalButton: true
      });

      //Init zMenu
      zdt = $('#zMenuTable').DataTable( {
        columns: [ { title: "Height" }, { title: "Event" }, { title: "Arg" }, { title: "Remove" } ],
        searching: false,
        fixedHeader: false,
        ordering: false,
        info: false,
        pageLength: 6,
        lengthChange: false,
        fnDrawCallback: function() { $("#zMenuTable thead").remove(); }
      } );
      $('#zMenuTable tbody').on( 'click', 'div.zdelete', function (){
        zdt.row( $(this).parents('tr') ).remove().draw();
        zNum--;
        if(zNum == 0){ addZMenuRow(); }
      } );

      addZMenuRow();
      document.getElementById('apiKey').innerHTML = apikey;
      document.getElementById('speedFactor').value = currentSpeed;
      document.getElementById('flowFactor').value = currentFlow;
      document.getElementById('zHopChecks').value = zHopCheck;
      getPrinterProfile();
      updateFiles();
      break;

    case "burnin":
      burninPrinterMenu();
      getClientIP();
      break;

  }

  //Init eeprom table
  edt = $('#eepromTable').DataTable( {
    columns: [ { title: "Desc" }, { title: "Value" } ],
    searching: false,
    fixedHeader: false,
    ordering: false,
    info: false,
    pageLength: 8,
    lengthChange: false,
    fnDrawCallback: function() { $("#eepromTable thead").remove(); }
  } );
}

function flashFirmware(){

  if(burninPrinter != "null"){
    showOverlay("Flashing Firmware");
    watchLogFor["burninPrinterMenu"] = "to 'Operational"; watchLogFor.length++;
    $.ajax({
      url: "include/f.php?c=flash&printer="+burninPrinter,
      type: "get",
    });
  }

}

function burninPrinterMenu(){

  connectPrinter("disconnect");
  var mainHTML = "Select Printer:<br>";
  mainHTML = mainHTML + "<a onclick='setBurninPrinter(\"rostockv3\")'>Rostock Max V3</a> - - ";
  mainHTML = mainHTML + "<a onclick='setBurninPrinter(\"rostockv2\")'>Rostock Max V2</a><br><br>";
  mainHTML = mainHTML + "<a onclick='setBurninPrinter(\"orion\")'>Orion</a> - - ";
  mainHTML = mainHTML + "<a onclick='setBurninPrinter(\"orion-atx\")'>Orion ATX</a><br><br>";
  mainHTML = mainHTML + "<a onclick='setBurninPrinter(\"eris\")'>Eris</a> - - ";
  mainHTML = mainHTML + "<a onclick='setBurninPrinter(\"h2\")'>Hacker H2</a>";
  document.getElementById('main').innerHTML = mainHTML;

}

function burninTestPrint(){

  var OK = false;
  switch(burninPrinter){

    case "rostockv3":
      selectFile("local/rostock.gcode",true);
      OK = true;
      break;

    case "rostockv2":
      selectFile("local/rostock.gcode",true);
      OK = true;
      break;

    case "orion":
      selectFile("local/orion.gcode",true);
      OK = true;
      break;

    case "eris":
      selectFile("local/eris.gcode",true);
      OK = true;
      break;

    case "h2":
      selectFile("local/h2.gcode",true);
      OK = true;
      break;

  }

  if(OK){
    watchLogFor["burninPrinterMenu"] = "to 'Operational"; watchLogFor.length++;
    showOverlay("Printing Calibration Circle<br><br><a onclick='printCommand(\"cancel\")'>Cancel Print job</a>");
  }

}

function burninMenu(){

  var mainHTML = "<b>"+burninPrinter+"</b><br><a onclick='flashFirmware()'>Flash Firmware</a><br><br>";
  if(printerStatus == "Operational"){
    mainHTML = mainHTML + "<a onclick='calibratePrinter()'>Calibrate Printer</a><br><br>";
    mainHTML = mainHTML + "<a onclick='deltaCalibration()'>DC42 Calibration</a><br><br>";
    mainHTML = mainHTML + "<a onclick='burninTestPrint()'>Test Print</a><br><br>";
  }else{
    mainHTML = mainHTML + "<a onclick='connectPrinter(\"connect\")'>Connect to Printer</a><br><br>";
  }
  mainHTML = mainHTML + "<a onclick='burninPrinterMenu()'>Change Printer</a> - - <a onclick='location.reload()'>Reset</a>";
  document.getElementById('main').innerHTML = mainHTML;

}

function setBurninPrinter(bPrinter){

  burninPrinter = bPrinter;
  burninMenu();

}

function saveZMenu(){

  hideZMenu();
  if(zNum > 0){
    watchForZ = [];
    var zCurrent = 0;
    var zSkip = 0;
    var zVal;
    zdt.page('first').draw('page');
    while(zCurrent < zIndex){
      if(zCurrent % 6 == 0 && zCurrent > 0){ zdt.page('next').draw('page'); }
      if(document.getElementById('zh'+zCurrent) != null && $.isNumeric(document.getElementById('zh'+zCurrent).value)){
        if(printerStatus == "Printing" || printerStatus == "Paused"){
          if(Number(document.getElementById('zh'+zCurrent).value) >= currentZ){
            watchForZ[zCurrent] = { 'height': Number(document.getElementById('zh'+zCurrent).value), 'action': document.getElementById('ze'+zCurrent).value, 'arg': Number(document.getElementById('za'+zCurrent).value) };
          }else{ zSkip++; }
        }else{
          watchForZ[zCurrent] = { 'height': Number(document.getElementById('zh'+zCurrent).value), 'action': document.getElementById('ze'+zCurrent).value, 'arg': Number(document.getElementById('za'+zCurrent).value) };
        }
      }
      zCurrent++;
    }
  }
  watchForZ.sort(dynamicSort("height"));
//  var zMessage = "Z Events Saved";
//  if(zSkip > 0){ zMessage = zMessage + ". " + zSkip + " zEvents skipped."; }
//  bootbox.alert({ message: zMessage, backdrop: true });
  document.getElementById("zMenuButton").innerHTML = watchForZ.length + " Active Z Events";
  rebuildZMenu();

}

function rebuildZMenu(){

  zdt.clear();
  if(typeof watchForZ[0] !== 'undefined' && watchForZ[0] != null){
    zIndex = 0; zNum = 0;
    var h;
    var e;
    var a;
    watchForZ.forEach(function(f){
      h = "<input type=text size=3 id='zh" + zIndex + "' value='" + f.height + "'>";
      e = "<select id='ze" + zIndex + "'>";
      zEvents.forEach(function(z){
        e = e + "<option value='" + z.command + "'";
        if(f.action == z.command){ e = e + " selected=true"; }
        e = e +">" + z.label + "</option>";
      });
      e = e + "</select>";
      a = "<input type=text size=3 id='za" + zIndex + "' value = '" + f.arg + "'>";
      zdt.row.add([h, e, a, "<div class='zdelete'>X</div>"]).draw();
      zdt.page('last').draw('page');
      $('#zh'+zIndex).numpad({ hidePlusMinusButton: true, decimalSeparator: '.' });
      $('#za'+zIndex).numpad({ hidePlusMinusButton: true, decimalSeparator: '.' });
      zIndex++; zNum++;
    });
  }else{ addZMenuRow(); }

}

// add new Blank row to Z Menu
function addZMenuRow(){

  var h = "<input type=text size=3 id='zh" + zIndex + "'>";
  var e = "<select id='ze" + zIndex + "'>";
  zEvents.forEach(function(z){ e = e + "<option value='" + z.command + "'>" + z.label + "</option>"; });
  e = e + "</select>";
  var a = "<input type=text size=3 id='za" + zIndex + "'>";
  zdt.row.add([h, e, a, "<div class='zdelete'>X</div>"]).draw();
  zdt.page('last').draw('page');
  $('#zh'+zIndex).numpad({ hidePlusMinusButton: true, decimalSeparator: '.' });
  $('#za'+zIndex).numpad({ hidePlusMinusButton: true, decimalSeparator: '.' });
  zIndex++; zNum++;

}

//update network settings
function saveNetworkSettings(){
  hideNetworkMenu();
  showOverlay("Saving network settings");
  alert(document.getElementById("wifiNetworkPassword").value);
  $.ajax({
    url: "include/f.php?c=network",
    type: "post",
    data: { "ssid" : document.getElementById("wifiNetworkName").value, "pw" : document.getElementById("wifiNetworkPassword").value },
    complete: (function(data,type){
      console.log(data.responseText);
      hideOverlay();
    })
  });
}

// Show networkMenu
function showNetworkMenu(){
  document.getElementById('networkMenu').style.width = "100%";
}

// Hide zMenu
function hideNetworkMenu(){ document.getElementById('networkMenu').style.width = "0"; }

// Show zMenu
function showZMenu(){
  if(zIndex == 0){ addZMenuRow(); }
  document.getElementById('zMenu').style.width = "100%";
}

// Hide zMenu
function hideZMenu(){ document.getElementById('zMenu').style.width = "0"; }

// Set overlay to visible with given content
function showOverlay(content){
  document.getElementById('overlayContent').innerHTML = content;
  document.getElementById('overlay').style.width = "100%";
  overlayShowTime = new Date().valueOf();
}

// Hide the overlay and empty it's content
function hideOverlay(){
  document.getElementById('overlay').style.width = "0";
  document.getElementById('overlayContent').innerHTML = "";
  overlayShowTime = 0;
}

//Basic settings for all popup touchpads
$.fn.numpad.defaults.gridTpl = '<table class="table modal-content" style="width:80%"></table>';
$.fn.numpad.defaults.backgroundTpl = '<div class="modal-backdrop in"></div>';
$.fn.numpad.defaults.displayTpl = '<input type="text" class="form-control" />';
$.fn.numpad.defaults.buttonNumberTpl =  '<button type="button" class="btn btn-default" style="width:75%"></button>';
$.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn" style="width:100%;"></button>';
$.fn.numpad.defaults.onKeypadCreate = function(){$(this).find('.done').addClass('btn-primary');}

//Update status every second
window.setInterval( function(){ updateStatus(); }, 1000);

//Initialize Octoprint SockJS connection
initSocket();

