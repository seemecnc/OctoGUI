var minOverlayTime = 3000; // Minimum time to show the Overlay w/ message

var sock = new SockJS('http://' + window.location.host + '/sockjs?apikey='+apikey);
var api = "http://" + window.location.host + "/api/";
var apikey = "ABAABABB";
var printerStatus = "Checking...";
var etemp = "--";          // Current Nozzel Temperature
var etempTarget = "--";    // Current Nozzel Target Temperature
var btemp = "--";          // Current Bed Temperature
var btempTarget = "--";    // Current Bed Target Temperature
var sortBy = "name";       // Sort Order
var sortRev = false;       // Sort order reverse flag
var printerId;             // Printer profile ID
var heatedBed = false;     // Heated Bed Flag
var currentZ;              // Current Z height
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

// GCODE to Load filament
var loadFilamentString = [];
loadFilamentString['eris'] = [ "G28", "M109 S220", "G91", "G1 E530 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['orion'] = [ "G28", "M109 S220", "G91", "G1 E560 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['rostock_max_v3'] = [ "G28", "M109 S220", "G91", "G1 E750 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];

// GCODE to unload filament
var unloadFilamentString = [];
unloadFilamentString['eris'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['orion'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['rostock_max_v3'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-840", "M104 S0", "G90", "G92 E0", "M84", "M115" ];

// GCODE to unload filament mid-print
var hotUnloadString = [];
hotUnloadString['eris'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "G90", "G92 E0" ];
hotUnloadString['orion'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "G90", "G92 E0" ];
hotUnloadString['rostock_max_v3'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-830", "G90", "G92 E0" ];

// GCODE to load filament mid-print
var hotLoadString = [];
hotLoadString['eris'] = [ "G91", "G1 E530 F5000", "G1 E80 F150", "G90", "G92 E0" ];
hotLoadString['orion'] = [ "G91", "G1 E560 F5000", "G1 E80 F150", "G90", "G92 E0" ];
hotLoadString['rostock_max_v3'] = [ "G91", "G1 E750 F5000", "G1 E100 F150", "G90", "G92 E0" ];


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
    sendCommand("M115");
  }

}

// SockJS message handling
sock.onmessage = function(e) {

  //Only process "current" messages
  if (typeof e.data.current !== 'undefined'){
    var t;
    //watch for Z height actions
    if(typeof watchForZ[0] !== 'undefined'){
      if(printerStatus == "Printing" && currentZ == e.data.current.currentZ && currentZ >= watchForZ[0]['height'] && currentZ != null){
        spottedZ(watchForZ[0]['action'],watchForZ[0]['arg']);
        watchForZ.splice(0,1);
        document.getElementById("zMenuButton").innerHTML = watchForZ.length + " Active Z Events";
      }
    }
    currentZ = e.data.current.currentZ;
    document.getElementById('currentZ').innerHTML = currentZ;
    if (e.data.current.progress.completion !== null){ document.getElementById('currentPercent').innerHTML = e.data.current.progress.completion.toFixed(2); }
    document.getElementById('currentPrintTime').innerHTML = humanTime(e.data.current.progress.printTime);
    document.getElementById('currentPrintTimeLeft').innerHTML = humanTime(e.data.current.progress.printTimeLeft);
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

// Actions to take when Z height is hit
function spottedZ(action,arg){

  switch(action){

    case "Speed":
      console.log("Setting speed to " + arg + " at z: " + currentZ);
      setSpeedFactor(arg);
      break;

    case "Filament":
      console.log("Changing Filament at z: " + currentZ);
      printCommand("pause");
      liftOnPause = true;
      break;

    case "ExtruderTemp":
      console.log("Setting Extruder Temp to " + arg + " at z: " + currentZ);
      setExtruderTemp(arg);
      break;

    case "BedTemp":
      console.log("Setting Bed Temp to " + arg + " at z: " + currentZ);
      setBedTemp(arg);
      break;

    case "FanSpeed":
      console.log("Setting Fan Speed to " + arg + " at z: " + currentZ);
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
      console.log("Return E: " + returnE + " - Return XY: " + returnX + "/" + returnY);
      if(returnX == null || returnY == null){ alert("Return coordinates not available. Resume print and try again"); }
      break;

    case "firmwareInfo": // Use Firmware info to verify printer model
      var pId;
      var fw = log.replace(/FIRMWARE_NAME:/,'');
      var fwd = log.replace(/.*_DATE:/,'');
      var fwp = log.replace(/.*MACHINE_TYPE:/,'');
      fw = fw.replace(/\ .*/,'');
      fwd = fwd.replace(/\ .*/,'');
      document.getElementById('firmwareInfo').style.visibility = "visible";
      document.getElementById('firmwareInfo').innerHTML = fw;
      document.getElementById('firmwareDate').style.visibility = "visible";
      document.getElementById('firmwareDate').innerHTML = fwd;
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
        default:
          pId = 'default';
          console.log("Printer ("+fwp+") not supported!");
          break;
      }
      if(pId != printerId && printerStatus != "Printing" && printerStatus != "Paused" ){ setPrinterProfile(pId); }
      delete watchLogFor[key]; watchLogFor.length--;

      //Init trap for Comm Error if it's not alreay set
      if(typeof watchLogFor['COMMERROR'] == 'undefined'){ watchLogFor['COMMERROR'] = 'sufficient'; watchLogFor.length++; }
      break;

    case "filamentInfo": // Update amount of filament used
      document.getElementById('filamentInfo').style.visibility = "visible";
      document.getElementById('filamentInfo').innerHTML = log;
      delete watchLogFor[key]; watchLogFor.length--;
      break;

    case "hideOverlay": // Set the Overlay to hidden
      var curTime = new Date().valueOf();
      if(overlayShowTime > 0 && (overlayShowTime + minOverlayTime >= curTime)){ setTimeout(hideOverlay, overlayShowTime + minOverlayTime - curTime); }
      else{ hideOverlay(); }
      delete watchLogFor[key]; watchLogFor.length--;
      break;
  }
}

// Find the current IP of the client and update it on screen
function getClientIP() {
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
  pc.createDataChannel("");
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);
  pc.onicecandidate = function(ice){
    if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
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
    if (typeof calibrateString[printerId] !== 'undefined'){
      bootbox.confirm("Make sure the print bed is clear and there is no filament hanging from the extruder.", function(result){
        if(result){
          sendCommand(calibrateString[printerId]);
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

        if(jdata.current.state == "Operational"){
          if(printerStatus != "Operational"){
            hotLoading = false;
            liftOnly = false;
            liftOnPause = false;
            if(typeof calibrateString[printerId] !== 'undefined'){ document.getElementById('calibratePrinter').style.visibility = "visible"; }
            else { document.getElementById('calibratePrinter').style.visibility = "hidden"; }
            if(typeof loadFilamentString[printerId] !== 'undefined'){ document.getElementById('loadFilament').style.visibility = "visible"; }
            else { document.getElementById('loadFilament').style.visibility = "hidden"; }
            if(typeof unloadFilamentString[printerId] !== 'undefined'){ document.getElementById('unloadFilament').style.visibility = "visible"; }
            else { document.getElementById('unloadFilament').style.visibility = "hidden"; }
          }
        }else{
          if(jdata.current.state != printerStatus){
            document.getElementById('calibratePrinter').style.visibility = "hidden";
            document.getElementById('loadFilament').style.visibility = "hidden";
            document.getElementById('unloadFilament').style.visibility = "hidden";
          }
        }

        //Update filament and firmware info when printer enters Operational state
        if(printerStatus != "Operational" && jdata.current.state == "Operational" && typeof watchLogFor['filamentInfo'] == 'undefined'){
          watchLogFor['firmwareInfo'] = "FIRMWARE";
          watchLogFor.length++;
          watchLogFor['filamentInfo'] = "Printed filament";
          watchLogFor.length++;
          sendCommand("M115");
        }else{ //In case the M115 command gets lost in the shuffle
          if(typeof watchLogFor['filamentInfo'] !== 'undefined' && printerStatus == "Operational"){ sendCommand("M115"); }
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

  //Shut down the hot end if paused too long
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
          etemp = "--";
          btemp = "--";
        }
      })
    });
  }else{
    etemp = "--";
    btemp = "--";
  }
  document.getElementById('currentStatus').innerHTML = printerStatus;
  document.getElementById('extruderTemp').innerHTML = etemp;
  document.getElementById('bedTemp').innerHTML = btemp;
  document.getElementById('extruderTempTarget').innerHTML = etempTarget;
  document.getElementById('eTempInput').value = etempTarget;
  document.getElementById('bedTempTarget').innerHTML = btempTarget;
  document.getElementById('bTempInput').value = btempTarget;
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
  page = page || 0;
  $.ajax({
    url: "include/f.php?c=list",
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      if(type == "success"){
        jdata = JSON.parse(data.responseText);
        dt.clear();
        if(jdata == null){ dt.draw(); }
        else{
          var sortString;
          if(sortRev){ sortString = "-" + sortBy; }
          else{ sortString = sortBy; }
          var files = jdata.sort(dynamicSort(sortString));
          files.forEach(function(f){ dt.row.add([ f.origin, f.name ]); });
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

// Home all Axis and disabled the stepper motors. TODO: Setup motor enable/disable fuctions/buttons
function homePrinter(){
  if(printerStatus == "Printing"){
    bootbox.alert({
      message: "Print job in progress. Cancel the job if you really want to home the print head.",
      backdrop: true
    });
  }else{
    $.ajax({
      url: api+"printer/printhead?apikey="+apikey,
      type: "post",
      contentType:"application/json; charset=utf-8",
      data: JSON.stringify({ 'command': "home", 'axes': [ 'x', 'y', 'z' ] }),
      success: (function(){
        sendCommand("M84");
      })
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
      sendCommand( [ "G28", "90", "G0 X" + returnX + " Y" + returnY + " Z" + returnZ +" F1440 E2", "G92 E" + returnE ] );
    }else{ sendCommand( [ "G28", "90", "G0 Z" + returnZ +" F1440 E2", "G92 E" + returnE ] ); }
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
      watchLogFor['stateToPaused'] = 'Paused';
      watchLogFor.length++;
    }
    if(printerStatus == "Paused") { resumeHotLoad(); }
  }else{
    if(command == "start" && printerStatus == "Paused"){ c = JSON.stringify({ 'command': "pause", 'action': 'toggle' }); resumeHotLoad(); }
    else{ c = JSON.stringify({ 'command': command }); }
  }
  if(command == "cancel"){
    bootbox.confirm("Are you sure you want to cancel the current print job?.", function(result){
      if(result){
        showOverlay("Canceling print job");
        watchLogFor["hideOverlay"] = "Operational"; watchLogFor.length++;
        $.ajax({ url: api+"job?apikey="+apikey, type: "post", contentType:"application/json; charset=utf-8", data: c, success: (function(){ setExtruderTemp(0); if(heatedBed){ setBedTemp(0); } }) });
      }
    });
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
          if(heatedBed) {
            document.getElementById('bedTempDisplay').style.visibility = "visible";
            document.getElementById('bedTempSet').style.visibility = "visible";
          }else {
            document.getElementById('bedTempDisplay').style.visibility = "hidden";
            document.getElementById('bedTempSet').style.visibility = "hidden";
          }
          //if(printerId == 'eris'){ document.getElementById('fanControl').style.visibility = "hidden"; }
          //else { document.getElementById('fanControl').style.visibility = "visible"; }
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
  }
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
  console.log("Setting flow factor to: "+flow);
  var c = { "command":"feedrate", "factor":flow};
  $.ajax({
    url: api+"printer/printhead?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(c),
    success: (function(){
      currentFlow = flow;
      document.getElementById('flowFactor').value = currentFlow;
    })
  });
}

// Set the speed factor (percent)
function setSpeedFactor(speed){
  console.log("Setting speed factor to: "+speed);
  sendCommand("M220 S" + speed);
  currentSpeed = speed;
  document.getElementById('speedFactor').value = currentSpeed;
}

// One off inits, tasks, etc to be done after page is loaded
function startupTasks(){
  dt = $('#filesList').DataTable( {
    columns: [ { title: "L" }, { title: "Name" } ],
    searching: false,
    fixedHeader: false,
    ordering: false,
    info: false,
    pageLength: 4,
    lengthChange: false,
    select: { items: "row", single: true},
    fnDrawCallback: function() { $("#filesList thead").remove(); }
  } );

  // Onclick handlers for file list
  $('#filesList tbody').on( 'click', 'tr', function () {
    var origin = this.cells[0].innerHTML;
    var name = this.cells[1].innerHTML;
    switch(origin){
      case "local":
        bootbox.prompt({
          title: name,
          inputType: 'checkbox',
          inputOptions: [
            { text: 'Load ' + name + ' for printing', value: '1' },
            { text: 'Print ' + name + ' now', value: '2' },
            { text: 'Copy ' + name + ' to USB', value: '3' },
            { text: 'Delete ' + name, value: '4' }],
            callback: function (result) {
              if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                switch(r){
                  case "1": selectFile("local/" + name); break;
                  case "2":
                    selectFile("local/" + name,true);
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
        selectFile(origin + "/" + name);
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
    onKeypadClose: function(){ setFactor(Number(document.getElementById('flowFactor').value)); },
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
  getPrinterProfile();
  updateFiles();
}

function saveZMenu(){

  hideZMenu();
  if(printerStatus == "Printing" || printerStatus == "Paused"){
    bootbox.alert({ message: "You cannot modify Z events while printing", backdrop: true });
  }else{
    if(zNum > 0){
      watchForZ = [];
      var zCurrent = 0;
      var zVal;
      zdt.page('first').draw('page');
      while(zCurrent < zIndex){
        if(zCurrent % 6 == 0 && zCurrent > 0){ zdt.page('next').draw('page'); }
        if(document.getElementById('zh'+zCurrent) != null && $.isNumeric(document.getElementById('zh'+zCurrent).value)){
          watchForZ[zCurrent] = { 'height': Number(document.getElementById('zh'+zCurrent).value), 'action': document.getElementById('ze'+zCurrent).value, 'arg': document.getElementById('za'+zCurrent).value };
        }
        zCurrent++;
      }
    }
    watchForZ.sort(dynamicSort("height"));
    bootbox.alert({ message: "Z Events Saved", backdrop: true });
    document.getElementById("zMenuButton").innerHTML = watchForZ.length + " Active Z Events";
    rebuildZMenu();
  }

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

  if(printerStatus == "Printing" || printerStatus == "Paused"){
    bootbox.alert({ message: "You cannot modify Z events while printing", backdrop: true });
  }else{
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

}

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

//Update status every second
window.setInterval( function(){ updateStatus(); }, 1000);

//Basic settings for all popup touchpads
$.fn.numpad.defaults.gridTpl = '<table class="table modal-content" style="width:80%"></table>';
$.fn.numpad.defaults.backgroundTpl = '<div class="modal-backdrop in"></div>';
$.fn.numpad.defaults.displayTpl = '<input type="text" class="form-control" />';
$.fn.numpad.defaults.buttonNumberTpl =  '<button type="button" class="btn btn-default" style="width:75%"></button>';
$.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn" style="width:100%;"></button>';
$.fn.numpad.defaults.onKeypadCreate = function(){$(this).find('.done').addClass('btn-primary');}

