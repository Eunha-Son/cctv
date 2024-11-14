let webcam;
let detector;
let myVidoeRec;

let videoFrame;

let state = 0;


let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let icon_person;
let stateIndicator = [];

let recordingTime = '00:00:00'; 
let recordingStartTime = 0; 
let pausedStartTime = 0; 
let pausedTime = 0; 
let totalPausedTime = 0; 

let peopleNumber = 0;

let detedtedObjects = [];

let myWriter;
let writerMsg='';

function preload() {  
  detector = ml5.objectDetector('cocossd');
  
  videoFrame = loadImage('img/Frame.png');
  
  btn_pause[0] = loadImage('img/Pause_dis.png');
  btn_pause[1] = loadImage('img/Pause_a.png');
  
  btn_record[0] = loadImage('img/Rec_pre.png');
  btn_record[1] = loadImage('img/Rec_ing.png');
  btn_record[2] = loadImage('img/Rec_paused.png');
  btn_record[3] = loadImage('img/Rec_saved.png');
  
  btn_stop[0] = loadImage('img/Stop_dis.png');
  btn_stop[1] = loadImage('img/Stop_a.png');
  
//  icon_person = loadImage('img/icon_person.png');
  
  stateIndicator[0] = loadImage('img/Status_prepared.png');
  stateIndicator[1] = loadImage('img/Status_Recording.png');
  stateIndicator[2] = loadImage('img/Status_paused.png');
  stateIndicator[3] = loadImage('img/Status_saved.png');
}

function setup() {
  createCanvas(640,420);
  webcam = createCapture(VIDEO);
  webcam.size(640,336);
  webcam.hide();
  myVideoRec = new P5MovRec();
  
  detector.detect(webcam, gotDetections);
  
  
}

function draw() {
  background(255);
  
  calculateRecordingTime();
  doCOCOSSD();
  
  drawStatusBar(state);
  drawVideoPreview(0,25,640,336);
  drawCounter(state);
  drawStateIndicator(state);
  drawButtons(state);
  writeLog(state);
  
  peopleNumber = 0;
}


//==================== 1.Draw Video Preview
function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
  image(videoFrame, x, y, w, h);
}
function drawStateIndicator(currentState){
  image(stateIndicator[currentState], 100,260,120,24);
}

//==================== 2.Draw Buttons
function drawButtons(currentState){
  let pause_stop_button_number = 0;
  if(currentState == 1){
    pause_stop_button_number = 1;
  }  
  image(btn_pause[pause_stop_button_number], 258, 370, 46, 46);
  image(btn_record[currentState], 320, 370, 46, 46);
  image(btn_stop[pause_stop_button_number], 382, 370, 46, 46);
}

//==================== 3.Draw Status Bar
function drawStatusBar(currentState){
  fill(0, 51);
  noStroke();
  rect(160,2,100,20,0);
  rect(270,2,100,20,0);
  rect(380,2,100,20,0);
  
  textFont('Inter');
  textSize(14);
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.';
  
  if(currentState == 0){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(391,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(CENTER);
    text(recordingTime, 435, 17);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(CENTER);
    text(currentDate, 212, 17);
  }else if(currentState == 1){
    fill(202,38,38);
    noStroke();
    ellipse(391,12,12,12);
    fill(202,38,38);
    noStroke();
    textAlign(CENTER);
    text(recordingTime, 435, 17);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(CENTER);
    text(currentDate, 212, 17);
  }else if(currentState == 2){
    noFill();
    stroke(202,38,38);
    strokeWeight(2);
    ellipse(391,12,11,11);
    fill(202,38,38);
    noStroke();
    textAlign(CENTER);
    text(recordingTime, 435, 17);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(CENTER);
    text(currentDate, 212, 17);
  }else if(currentState == 3){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(391,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(CENTER);
    text(recordingTime, 435, 17);
    textAlign(CENTER);
    text(currentTime, width/2, 17);
    textAlign(CENTER);
    text(currentDate, 212, 17);
  }
}
//==================== 4.Draw State Indicator
function drawStateIndicator(currentState){
  image(stateIndicator[currentState], 285,320,120,30);
}
//==================== 5.Draw Counter
function drawCounter(currentState){
  
  textFont('Inter');
  textSize(14);
  
  if(currentState == 1){
    fill(255);
    textAlign(LEFT);
    text(peopleNumber, 10, 350);

  }else{
    fill(255,153);
    textAlign(LEFT);
    text(peopleNumber, 10, 350);
    tint(255,153);

    tint(255);
  }
}



function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}

//==========================BUTTON ACTION ADDED===============================
function mouseReleased(){
  if(state == 0){
    if(dist(mouseX, mouseY, 343, 393) <= 23){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 0.Main Page.
      recordingStartTime = millis();
      startLog();
      myVideoRec.startRec();
    }
  }else if(state == 1){
    if(dist(mouseX, mouseY, 281, 393) <= 23){ // for Pause BTN
      state = 2; //go to 2.Paused Page from 1.Recording Page.
      pausedStartTime = millis();
    }
    if(dist(mouseX, mouseY, 405, 393) <= 23){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      initializeTimes();
      saveLog();
      myVideoRec.stopRec();
    }
  }else if(state == 2){
    if(dist(mouseX, mouseY, 343, 393) <= 23){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 2.Paused Page.
      totalPausedTime = totalPausedTime + pausedTime;
    }
  }else if(state == 3){
    if(dist(mouseX, mouseY, 343, 393) <= 23){ // for Recording BTN
      state = 0; //go to 0.Main Page from 3.Saved Page.
    }
  }
}


function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}


function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ //1.Recording Page
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)) % 60;
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ //2.Paused Page
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ //3.Saved Page
    recordingTime = '00:00:00';
  }
}

//==========================COCOSSD ADDED===============================
function doCOCOSSD(){
  let tempMsg='';
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,0,254);
      strokeWeight(2);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,0,254);
      textSize(10);
      text(object.label+' '+peopleNumber, object.x, object.y - 5);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4);
      stroke(255,0,254);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
      //개별 사람마다의 X, Y 좌표값 저장
    }
  }
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
  // 현재 레코딩 타임과 함께 tempMsg 저장
}
//==========================WRITER ADDED===============================
function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  let fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}
function saveLog(){
  myWriter.close();
  myWriter.clear();
}
function writeLog(currentState){
  if(currentState == 1){
    myWriter.print(writerMsg);
  }
}


