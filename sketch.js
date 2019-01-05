// James MacPherson (33453256) - Introduction To Programming Final Project.
// ApeggiSynth

// Description:
// This program displays five circles on the screen that 'strobe' based on the volume of each synth voice. These voices form a chord together.
// Playback is the same for each voice exept that each voice has a different sequence length. This results in a phasing polyrhythmic piece similar to 'John Cage' or 'Steve Reich'.
// FFT is used to create a grid of waveforms as the background.
// This piece should run on its own upon pressing the mouse; no further user input is required.

var env = [];
var triOsc = [];
var analyzer = [];
var myPhrase = [];
var rms = [];
var music = [];
var pattern = [ // hard coded sequence data for each voice.
 [59, 0, 0, 0, 0, 59, 0, 0, 0, 0, 59, 0, 0, 0, 0, 0, 0, 59, 0, 0, 0, 0, 0, 0, 0, 0, 59, 0, 0, 0, 0, 0, 0, 0, 0, 59, 0, 0, 0, 0, 0, 0, 0, 0, 59, 0, 0, 0, 0, 0, 0, 0],
 [61, 0, 0, 0, 0, 61, 0, 0, 0, 0, 61, 0, 0, 0, 0, 0, 0, 61, 0, 0, 0, 0, 0, 0, 0, 0, 61, 0, 0, 0, 0, 0, 0, 0, 0, 61, 0, 0, 0, 0, 0, 0, 0, 0, 61, 0, 0, 0, 0, 0, 0],
 [62, 0, 0, 0, 0, 62, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0],
 [66, 0, 0, 0, 0, 66, 0, 0, 0, 0, 66, 0, 0, 0, 0, 0, 0, 66, 0, 0, 0, 0, 0, 0, 0, 0, 66, 0, 0, 0, 0, 0, 0, 0, 0, 66, 0, 0, 0, 0, 0, 0, 0, 0, 66, 0, 0, 0, 0],
 [69, 0, 0, 0, 0, 69, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0]
];
var maxi = 0;
var low = 0;
var high = 0;

function setup() {
 fft = new p5.FFT();

 var envArray = [ // Individual envelope and frequency assignement for each voice. These functions are stored as an array.
  function playEnv0(time, rate) {
   triOsc[0].freq(midiToFreq(rate)); // Convert midi to frequency and assign it to voice frequency.
   if (!false) { // Only trigger envelope if note present.
    env[0].play();
   }
  },
  function playEnv1(time, rate) {
   triOsc[1].freq(midiToFreq(rate));
   if (!false) {
    env[1].play();
   }
  },
  function playEnv2(time, rate) {
   triOsc[2].freq(midiToFreq(rate));
   if (!false) {
    env[2].play();
   }
  },
  function playEnv3(time, rate) {
   triOsc[3].freq(midiToFreq(rate));
   if (!false) {
    env[3].play();
   }
  },
  function playEnv4(time, rate) {
   triOsc[4].freq(midiToFreq(rate));
   if (!false) {
    env[4].play();
   }
  }
 ];

 // createCanvas(screen.width, screen.height); // Set canvas to screen size.

 myPart = new p5.Part(); // Creates part.
 myPart.setBPM(120); // Set part Beats Per Minute.

 reverb = new p5.Reverb(); // Creates reverb.

 for (var i = 0; i < 5; i++) { // Loop to initilise settings for each voice.
  env[i] = new p5.Env(); // Create envelope for voice.
  env[i].setADSR(0.01, 0.2, 0.2, 0.2); // Set Attack Decay Substain Release time.
  env[i].setRange(1.0, 0); // Set envelope levels.
  env[i].setExp(1); // Make envelope exponential.

  triOsc[i] = new p5.Oscillator('sawtooth'); // Create sawtooth oscillator for voice.
  triOsc[i].amp(env[i]); // Route envelope to amp (volume).
  triOsc[i].start(); // Initilise oscillator.
  triOsc[i].freq(400); // Set base frequency.

  reverb.process(triOsc[i], 2, 0.2); // Route voice to reverb and define reverb settings.

  analyzer[i] = new p5.Amplitude(); // Create analyzer.
  analyzer[i].setInput(triOsc[i]); // Route osillator to analyzer.

  myPhrase[i] = new p5.Phrase(triOsc[i], envArray[i], pattern[i]); // Create new phrase, names phrase (irrelevant in program operation), callsback pattern into the function envArray.
  myPart.addPhrase(myPhrase[i]); // Add phrase to part.
 }
}

function draw() {

 createCanvas(screen.width, screen.height)
 background('black'); // Refreshes screen by drawing background.

 masterVolume(0.25);
 reverb.amp(2);
 myPart.loop();
 myPart.start();

 for (var e = 0; e < 5; e++) { // For each voice analyzer.
  rms[e] = analyzer[e].getLevel(); // Assign analyzer to a variable.
 }


 function waveGridsX(minX, maxX) { // Draw waveforms for the X axis.
  var waveform = fft.waveform();
  beginShape();
  noFill();
  strokeWeight(0.6); // Thin line.
  stroke('red'); // Waveform line is 'red'.
  for (var i = 0; i < waveform.length; i++) {
   var x = map(i, 0, waveform.length, 0, width);
   var y = map(waveform[i], -0.15, 0.15, minX, maxX); // Rescales waveforms size based on volume.
   vertex(x, y);
  }
  endShape();
 }

 function waveGridsY(minX, maxX) { // Draw waveforms for the Y axis.
  var waveform = fft.waveform();
  beginShape();
  noFill();
  strokeWeight(0.5); // Thin line.
  stroke('red'); // Waveform line is 'red'.
  for (var i = 0; i < waveform.length; i++) {
   var x = map(i, 0, waveform.length, 0, width);
   var y = map(waveform[i], -0.15, 0.15, minX, maxX); // Rescales waveforms size based on volume.
   vertex(y, x); // X and Y axis is swapped to create vertical waveform.
  }
  endShape();
 }

 for (var i = 0; i < 2; i++) {
  high = 0; // Resets high.
  low = 0; // Resets low.
  for (var k = 0; k < 4; k++) { // Creates four coordinates for both waveGridsX and waveGridsY.
   if (i === 0) { // Switches maxi value between 'height' or 'width' depending on 'i'.
    (maxi = height / 4);
    high = high + maxi;
    low = high - maxi;
    waveGridsX(low, high); // Draw waveforms on X axis
   }
   if (i == 1) {
    (maxi = width / 4);
    high = high + maxi;
    low = high - maxi;
    waveGridsY(low, high); // Draw waveforms on Y axis
   }
  }
 }

 strokeWeight(1.5); // Thick outline.
 fill('black'); // Fill circles in 'black'.

 ellipse(width / 3, height / 3, rms[0] * height, rms[0] * height); // Draws circles that 'strobe' based on voice volume.
 ellipse(width / 3 + width / 3, height / 3, rms[1] * height, rms[1] * height);
 ellipse(width / 3, height / 3 + height / 3, rms[2] * height, rms[2] * height);
 ellipse(width / 3 + width / 3, height / 3 + height / 3, rms[3] * height, rms[3] * height);
 ellipse(width / 3 + width / 6, height / 3 + height / 6, rms[4] * height, rms[4] * height);

}

function touchStarted() { // Fix to start audio (2018)
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }
  }