<?php

$fdir = "/mnt/usb";
$apikey = "ABAABABB";

function copyToUsb($file){

  $status = "{\"status\":0}";
  $source = "http://localhost/downloads/files/local/".$file;
  $target = "/mnt/usb/$file";
  if(usbIsMounted())
    if($result = file_put_contents($target, fopen($source, 'r')))
      $status = "{\"status\":1}";
  echo $status;

}

function uploadFile($file){

  global $fdir, $apikey;
  $saneFile = mb_ereg_replace("([^\w\s\d\-_~,;\[\]\(\).])", '', $file);
  $post = array('file' => new CURLFile($fdir.'/'.$file,'application/octet-stream',$saneFile), 'select' => true, 'print' => 0, 'apikey' => $apikey);
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL,'http://'.$_SERVER['SERVER_ADDR'].'/api/files/local');
  curl_setopt($ch, CURLOPT_POST,1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
  $result = json_decode(curl_exec($ch));
  if($result->{"done"}) echo "{\"status\":1}";
  else echo "{\"status\":0}";
  curl_close ($ch);

}

function listFiles(){

  global $fdir, $apikey;
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL,'http://'.$_SERVER['SERVER_ADDR'].'/api/files?apikey='.$apikey);
  $result=curl_exec ($ch);
  curl_close ($ch);
  $data = json_decode($result);
  foreach($data->{"files"} as $d){
    $temp["name"] = $d->{"name"};
    $temp["origin"] = $d->{"origin"};
    $temp["size"] = $d->{"size"};
    $temp["date"] = $d->{"date"};
    $files[] = $temp;
    $flist[$temp["name"]] = $temp["size"];
    unset($temp);
  }

  if(usbIsMounted){
    if($usbfiles = array_diff(scandir($fdir), array('.', '..'))){
      foreach($usbfiles as $f){
        if(strtolower(substr($f, -6)) == ".gcode" || strtolower(substr($f, -4)) == ".stl"){
          $temp["name"] = $f;
          $temp["origin"] = "usb";
          $temp["size"] = filesize($fdir."/".$f);
          $temp["date"] = filemtime($fdir."/".$f);
          if($flist[$f] != $temp["size"])
            $files[] = $temp;
          unset($temp);
        }
      }
    }
  }
  return($files);
}

function usbIsMounted(){

  $check = shell_exec("df -h|grep '/mnt/usb'");
  if(!(isset($check)) || $check == "") return false;
  else return true;

}

function printerPort(){

  $found = 0;
  $num = 0;
  while($num < 9 && $found == 0){
    $port = "/dev/ttyACM".$num;
    if(file_exists($port)) $found = 1;
    $num++;
  }

  if($found) return($port);
  else return("ERROR");

}

function changeNetworkSettings($ssid, $pw){

  if(isset($pw) && $pw != "") $c = "sudo /var/www/html/OctoGUI/scripts/network-setup.sh \"$ssid\" \"$pw\"";
  else $c = "sudo /var/www/html/OctoGUI/scripts/network-setup.sh \"$ssid\"";
  shell_exec($c);

}

function backupCalibration($commands){

  global $apikey;
  $tmpfile = "/tmp/calibration-backup.gcode";
  if(file_exists($tmpfile)) unlink($tmpfile);
  foreach($commands as $c)
    file_put_contents($tmpfile, $c."\n", FILE_APPEND);
  $saneFile = "calibration-backup.gcode";
  $post = array('file' => new CURLFile($tmpfile,'application/octet-stream',$saneFile), 'select' => false, 'print' => 0, 'apikey' => $apikey);
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL,'http://'.$_SERVER['SERVER_ADDR'].'/api/files/local');
  curl_setopt($ch, CURLOPT_POST,1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
  $result = json_decode(curl_exec($ch));
  if($result->{"done"}) echo "{\"status\":1}";
  else echo "{\"status\":0}";
  curl_close ($ch);

}

function flashFirmware($printeri,$nowipe){

  $fwpath = "/var/www/html/fw";
  $file = $fwpath."/".$printer.".hex";
  if(file_exists($file)){
    echo "OK";
    if($nowipe == "1")
      $cmd = "sudo -u pi /var/www/html/OctoGUI/scripts/fw-wrapper.sh $file -n";
    else
      $cmd = "sudo -u pi /var/www/html/OctoGUI/scripts/fw-wrapper.sh $file";
    echo shell_exec($cmd);
  }
}

switch($_REQUEST['c']){

  case "backupcalibration":
    backupCalibration(json_decode($_POST["data"]));
    break;

  case "port":
    echo "{\"port\":\"".printerPort()."\"}";
    break;

  case "list":
    //List all files on local FS and USB FS if mounted
    echo json_encode(listFiles());
    break;

  case "copyToUsb":
    //Copy file to local FS and select it
    copyToUsb($_REQUEST['f']);
    break;

  case "copy":
    //Copy file to local FS and select it
    uploadFile($_REQUEST['f']);
    break;

  case "delete":
    if(unlink($fdir."/".$_REQUEST['f']))
      echo "{\"status\":1}";
    else
      echo "{\"status\":0}";
    break;

  case "network":
    changeNetworkSettings($_REQUEST["ssid"],$_REQUEST["pw"]);
    echo "{\"status\":1}";
    break;

  case "flash":
    if(isset($_REQUEST['printer'])){
      flashFirmware($_REQUEST['printer'],$_REQUEST['nowipe']);
    }
    break;

  case "connect":
    $ch = curl_init();
    $post = array('command' => "connect","baudrate" => 250000,"port" => printerPort());
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($post));
    curl_setopt($ch, CURLOPT_URL,'http://localhost/api/connection?apikey='.$apikey);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
    curl_exec($ch);
    break;

}

?>
