var hotLoadZLift = 0;

var printerStatus = "Checking...";
var api = "http://" + window.location.host + "/api/";
var apikey = "ABAABABB";
var etemp = "--";
var etempTarget = "--";
var btemp = "--";
var btempTarget = "--";
var tempCount = 1;
var sock = new SockJS('http://' + window.location.host + '/sockjs?apikey='+apikey);
var sortBy = "name";
var sortRev = false;
var fileTimeout = new Date().valueOf();
var printerId;
var headedBed = false;
var currentZ;
var returnZ;
var returnE;
var watchLogFor = [];
var watchForZ = [];
var hotLoading = false;
var maxZHeight = 0;
var currentSpeed = 100;
var pauseTimeout = 0;
var pauseTemp = 0;
var dt;
var bah = 1;

for(l = 0;l <= 20;l++){
  watchForZ[l] = { 'height': (l * 5), 'action' : "Yay, " + (l * 5) };
}

var calibrateString = [];
calibrateString['eris'] = [ "M202 Z1850", "G69 S2", "G68", "G30 S2", "M202 Z400", "M500", "G4 S2", "M115" ];
calibrateString['orion'] = [ "G69 S2", "M117 ENDSTOPS CALIBRATED", "G68 ", "M117 HORIZONTAL RADIUS CALIBRATED", "G30 S2 ", "M117 Z Height Calibrated", "G4 S2", "M500", "M117 CALIBRATION SAVED", "M115" ];
calibrateString['rostock_max_v3'] = [ "G69 S2", "M117 ENDSTOPS CALIBRATED", "G68 ", "M117 HORIZONTAL RADIUS CALIBRATED", "G30 S2 ", "M117 Z Height Calibrated", "G4 S2", "M500", "M117 CALIBRATION SAVED", "M115" ];

var loadFilamentString = [];
loadFilamentString['eris'] = [ "G28", "M109 S220", "G91", "G1 E530 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['orion'] = [ "G28", "M109 S220", "G91", "G1 E560 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];
loadFilamentString['rostock_max_v3'] = [ "G28", "M109 S220", "G91", "G1 E750 F5000", "G1 E100 F150", "G90", "G92 E0", "M104 S0", "M84", "M115" ];

var unloadFilamentString = [];
unloadFilamentString['eris'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['orion'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "M104 S0", "G90", "G92 E0", "M84", "M115" ];
unloadFilamentString['rostock_max_v3'] = [ "G28", "M109 S220", "G91", "G1 E30 F75", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-830", "M104 S0", "G90", "G92 E0", "M84", "M115" ];

var hotUnloadString = [];
hotUnloadString['eris'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "G90", "G92 E0" ];
hotUnloadString['orion'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-600", "G90", "G92 E0" ];
hotUnloadString['rostock_max_v3'] = [ "G91", "G1 E-75 F5000", "G90", "G92 E0", "G4 S3", "G91", "G1 E-830", "G90", "G92 E0" ];

var hotLoadString = [];
hotLoadString['eris'] = [ "G91", "G1 E530 F5000", "G1 E80 F150", "G90", "G92 E0" ];
hotLoadString['orion'] = [ "G91", "G1 E560 F5000", "G1 E80 F150", "G90", "G92 E0" ];
hotLoadString['rostock_max_v3'] = [ "G91", "G1 E750 F5000", "G1 E100 F150", "G90", "G92 E0" ];


sock.onopen = function(){
  sock.send( JSON.stringify({"throttle": 2} ));
  if(typeof watchLogFor['filamentInfo'] == 'undefined' && printerStatus != "Closed" && printerStatus != "Connecting" && printerStatus != "Detecting serial port"){
    watchLogFor['firmwareInfo'] = "FIRMWARE";
    watchLogFor.length++;
    watchLogFor['filamentInfo'] = "Printed filament";
    watchLogFor.length++;
    sendCommand("M115");
  }
}

sock.onmessage = function(e) {
  if (typeof e.data.current !== 'undefined'){
    var t;
    //watch for Z height actions
    if(typeof watchForZ[0] !== 'undefined'){
      if(printerStatus == "Printing" && currentZ == e.data.current.currentZ && currentZ >= watchForZ[0]['height'] && currentZ != null){
        spottedZ(watchForZ[0]['action']);
        watchForZ.splice(0,1);
      }
    }
    currentZ = e.data.current.currentZ;
    document.getElementById('currentZ').innerHTML = currentZ;
    if (e.data.current.progress.completion !== null){ document.getElementById('currentPercent').innerHTML = e.data.current.progress.completion.toFixed(2); }
    document.getElementById('currentPrintTime').innerHTML = humanTime(e.data.current.progress.printTime);
    document.getElementById('currentPrintTimeLeft').innerHTML = humanTime(e.data.current.progress.printTimeLeft);
    if(watchLogFor.length > 0){
      for(var i in watchLogFor){
        for(var l in e.data.current.logs){
          if(t = e.data.current.logs[l].includes(watchLogFor[i])){ spottedLog(i, e.data.current.logs[l]); }
        }
      }
    }
  }
};

function spottedZ(action){
  console.log("We hit Z" + currentZ + "! Action: " + action);
}

function spottedLog(key, log){
  log = log.replace(/Recv:\ /,'');
  switch(key){

    case "E":
      returnE = log.replace(/.*\ E/,'');
      returnE = returnE.replace(/\*.*/,'');
      break;

    case "stateToPaused":
      console.log("Printer is paused. Last E is " + returnE);
      if(returnE > 0) { document.getElementById('hotUnload').style.visibility = "visible"; }
      delete watchLogFor[key]; watchLogFor.length--;
      delete watchLogFor["E"]; watchLogFor.length--;
      break;

    case "firmwareInfo":
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
      if(pId != printerId){ setPrinterProfile(pId); }
      delete watchLogFor[key]; watchLogFor.length--;
      break;

    case "filamentInfo":
      document.getElementById('filamentInfo').style.visibility = "visible";
      document.getElementById('filamentInfo').innerHTML = log;
      delete watchLogFor[key]; watchLogFor.length--;
      break;

    case "hideOverlay":
      hideOverlay();
      delete watchLogFor[key]; watchLogFor.length--;
      break;

  }
}

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

function fanControl(c){
  var gcode;
  if(c == "on"){ sendCommand("M106"); }
  else { sendCommand("M107"); }
}

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

function setBedTemp(target){
  $.ajax({
    url: api+"printer/bed?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify({"command":"target","target":target})
  });
  btempTarget = target;
  document.getElementById('bedTempTarget').innerHTML = btempTarget;
  document.getElementById('bTempInput').value = btempTarget;
}

function updateConnectionStatus(){

  $.ajax({
    url: api+"connection?apikey="+apikey,
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      if(type == "success"){
        jdata = JSON.parse(data.responseText);
        if(printerStatus == "Printing" && jdata.current.state != "Printing" && jdata.current.state != "Paused" && typeof watchForZ[0] !== 'undefined'){ watchForZ = []; console.log("Clearing Z events"); }
        if(printerStatus != "Operational" && jdata.current.state == "Operational" && typeof watchLogFor['filamentInfo'] == 'undefined'){
          watchLogFor['firmwareInfo'] = "FIRMWARE";
          watchLogFor.length++;
          watchLogFor['filamentInfo'] = "Printed filament";
          watchLogFor.length++;
          sendCommand("M115");
        }else{
          if(typeof watchLogFor['filamentInfo'] !== 'undefined' && printerStatus == "Operational"){ sendCommand("M115"); }
        }
        printerStatus = jdata.current.state;
        if(printerStatus.includes("Error: Z-probe failed")){ connectPrinter("connect"); printerStatus = "Connecting"; }
        if(printerStatus.includes("Failed to autodetect serial port")){ connectPrinterManual(); printerStatus = "Connecting"; }
      }else{
        printerStatus = "Unknown";
      }
    })
  });
}

function updateStatus(){

  updateConnectionStatus();
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

function selectFile(file){
  $.ajax({
    url: api+"files/" + file +"?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify({"command":"select"}),
    success: (function(){ updateStatus(); })
  });
}

function setSortBy(s){
  if(sortBy == s){
    if(sortRev){ sortRev = false; }
    else{ sortRev = true; }
  }else{ sortRev = false; }
  sortBy = s;
  updateFiles();
}

function transferFile(file){
  var text;
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
      updateFiles();
      updateStatus();
    })
  });
}

function deleteFile(origin, file){
  switch(origin){
    case "local":
      $.ajax({
        url: api+ "files/local/" + file + "?apikey=" +apikey,
        type: "delete",
        contentType:"application/json; charset=utf-8",
        complete: (function(data,type){
          if(data.status == 204){ updateFiles(); }
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
          if(jdata.status == 1){ updateFiles(); }
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
          if(data.status == 204){ updateFiles(); }
          else{ alert("Error deleting " + file); }
        })
      });
      break;
  }
}

function updateFiles(){
  $.ajax({
    url: "include/f.php?c=list",
    type: "get",
    contentType:"application/json; charset=utf-8",
    complete: (function(data,type){
      if(type == "success"){
        jdata = JSON.parse(data.responseText);
        var sortString;
        if(sortRev){ sortString = "-" + sortBy; }
        else{ sortString = sortBy; }
        var files = jdata.sort(dynamicSort(sortString));
        dt.clear().draw();
        files.forEach(function(f){
          /*
          switch(f.origin){
            case "local":
              cell.innerHTML = "L " + f.name;
              cell.onclick = function() { bootbox.prompt({
                title: f.name,	
                inputType: 'checkbox',
                inputOptions: [
                  { text: 'Load ' + f.name + ' for printing', value: '1' },
                  { text: 'Print ' + f.name + ' now', value: '2' },
                  { text: 'Delete ' + f.name, value: '3' }],
                  callback: function (result) {
                    if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                      switch(r){
                        case "1": selectFile("local/" + f.name); break;
                        case "2": selectFile("local/" + f.name); printCommand("start"); break;
                        case "3": deleteFile(f.origin, f.name); break;
                      }
                    }); }
                  }
              });
              };
              break;
            case "sdcard":
              cell.innerHTML = "S " + f.name;
              cell.onclick = function() { selectFile(f.origin + "/" + f.name); };
              break;
            case "usb":
              cell.innerHTML = "U " + f.name;
              cell.onclick = function() { bootbox.prompt({
                title: f.name,
                inputType: 'checkbox',
                inputOptions: [
                  { text: 'Copy ' + f.name + ' to local storage', value: '1' },
                  { text: 'Delete ' + f.name + ' from USB', value: '2' } ],
                  callback: function (result) {
                    if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                      switch(r){
                        case "1": transferFile(f.name); break;
                        case "2": deleteFile(f.origin, f.name); break;
                      }
                    }); }
                  }
              });
              };
              break;
          }*/
          dt.row.add([ f.origin, f.name ]).draw();
        });
      }
    })
  });
}

function humanTime(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

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

function connectPrinterManual(){
  var c = { 'command': "connect","baudrate": 250000,"port":"/dev/ttyACM0" };
  $.ajax({
    url: api+"connection?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(c),
    success: (function(){
      updateStatus();
    })
  });
}

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

function resumeHotLoad(){
  document.getElementById('hotUnload').style.visibility = "hidden";
  if(hotLoading){
    sendCommand( ["90", "G0 Z" + returnZ +" F1440 E2", "G92 E" + returnE ] );
    document.getElementById('hotLoad').style.visibility = "hidden";
    hotLoading = false;
    returnE = 0;
  }
}

function printCommand(command){

  var c;
  if(command == "pause"){
    c = JSON.stringify({ 'command': "pause", 'action': 'toggle' });
    if(printerStatus == "Printing" && currentZ < (maxZHeight - hotLoadZLift - 10)) {
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
  $.ajax({
    url: api+"job?apikey="+apikey,
    type: "post",
    contentType:"application/json; charset=utf-8",
    data: c,
    success: (function(){
      if(command == "cancel"){ setExtruderTemp(0); }
    })
  });
}

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

function setPrinterProfile(newPrinterId){
  connectPrinter("disconnect");
  $.ajax({
    url: api+"printerprofiles/" + newPrinterId + "?apikey="+apikey,
    type: "patch",
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify({"profile":{"default":1}}),
    success: (function(){
      getPrinterProfile();
      bootbox.alert("New printer detected. Press OK to reconnect", function(){ connectPrinter("connect"); });
    })
  });

}

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
          if(typeof calibrateString[printerId] !== 'undefined'){ document.getElementById('calibratePrinter').style.visibility = "visible"; }
          else { document.getElementById('calibratePrinter').style.visibility = "hidden"; }
          if(typeof loadFilamentString[printerId] !== 'undefined'){ document.getElementById('loadFilament').style.visibility = "visible"; }
          else { document.getElementById('loadFilament').style.visibility = "hidden"; }
          if(typeof unloadFilamentString[printerId] !== 'undefined'){ document.getElementById('unloadFilament').style.visibility = "visible"; }
          else { document.getElementById('unloadFilament').style.visibility = "hidden"; }
          if(typeof loadFilamentString[printerId] !== 'undefined'){ document.getElementById('loadFilament').style.visibility = "visible"; }
          else { document.getElementById('loadFilament').style.visibility = "hidden"; }
          if(printerId == 'eris'){ document.getElementById('fanControl').style.visibility = "hidden"; }
          else { document.getElementById('fanControl').style.visibility = "visible"; }
        }
      }
    })
  });
}

function pauseUnload(){
  if(printerStatus == "Paused" && typeof hotUnloadString[printerId] !== 'undefined' && currentZ < (maxZHeight - hotLoadZLift - 10)){
    if(returnE > 0){
      hotLoading = true;
      returnZ = currentZ;
      if(hotLoadZLift > 0){ moveHead('z',hotLoadZLift); }
      else{ moveHead('z',(maxZHeight - 15)); }
      sendCommand(hotUnloadString[printerId]);
      document.getElementById('hotUnload').style.visibility = "hidden";
      document.getElementById('hotLoad').style.visibility = "visible";
      pauseTimeout = new Date().valueOf();
    }else{ alert("Error. Last extruder position not found. Please Resume your print, then pause to try again."); }
  }
}

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

function setSpeedFactor(speed){
  console.log("Setting speed factor to: "+speed);
  sendCommand("M220 S" + speed);
}

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
            { text: 'Delete ' + name, value: '3' }],
            callback: function (result) {
              if(typeof result !== 'undefined' && result != null){ result.forEach(function(r){
                switch(r){
                  case "1": selectFile("local/" + name); break;
                  case "2": selectFile("local/" + name); printCommand("start"); break;
                  case "3": deleteFile(origin, name); break;
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
                  case "1": transferFile(name); break;
                  case "2": deleteFile(origin, name); break;
                }
              }); }
            }
        });
        break;
    }
  } );

  getClientIP();
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
  document.getElementById('apiKey').innerHTML = apikey;
  document.getElementById('speedFactor').value = currentSpeed;
  getPrinterProfile();
  updateFiles();
}

function showOverlay(content){
  document.getElementById('overlayContent').innerHTML = content;
  document.getElementById('overlay').style.width = "100%";
}

function hideOverlay(){
  document.getElementById('overlay').style.width = "0";
  document.getElementById('overlayContent').innerHTML = "";
}

window.setInterval( function(){ updateStatus(); }, 1000);

$.fn.numpad.defaults.gridTpl = '<table class="table modal-content" style="width:80%"></table>';
$.fn.numpad.defaults.backgroundTpl = '<div class="modal-backdrop in"></div>';
$.fn.numpad.defaults.displayTpl = '<input type="text" class="form-control" />';
$.fn.numpad.defaults.buttonNumberTpl =  '<button type="button" class="btn btn-default" style="width:75%"></button>';
$.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn" style="width:100%;"></button>';
$.fn.numpad.defaults.onKeypadCreate = function(){$(this).find('.done').addClass('btn-primary');}
