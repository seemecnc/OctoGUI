<?php

$fdir = "/mnt/usb";
$apikey = "ABAABABB";

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

  return($files);
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

switch($_REQUEST['c']){

  case "port":
    echo "{\"port\":\"".printerPort()."\"}";
    break;

  case "list":
    //List all files on local FS and USB FS if mounted
    echo json_encode(listFiles());
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

}

?>
