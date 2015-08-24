var five = require("johnny-five");
var raspi = require("raspi-io");
var temporal = require("temporal")
var board = new five.Board({
  io: new raspi()
});
var pulses = 0;
var lastFlowRateTimer = 0;
var MAX_LITERS = 10; //Desired volume in liters
var PULSE_CONVERSION = 7.5 // Constant to convert # of pulses into liters
var solenoidInput = new five.Relay({
  pin: 2
});

board.on("ready", function() {
  solenoidInput.ON();
  this.pinMode(7, five.Pin.INPUT);
  lastFlowPinState = 0;

  // Check Digital Pin to see if theres a change
  this.digitalRead(7, function(value) {
    // send the pin status to flowSignal helper
    flowSignal(value);
  });
  //TODO: switch to temporal
  temporal.loop(1000, volumeChecker);
});

function volumeChecker () {
  var liters = pulses;
  liters /= PULSE_CONVERSION;
  liters /= 60;
  if (liters > MAX_LITERS){
    solenoidInput.OFF();
    console.log("Desired Volume Achieved");
    process.exit();
  }
  console.log(liters);
}

// helper function to keep track of pulses
function flowSignal (value) {
  if (value === 0) {
    lastFlowRateTimer ++;
    return;
  }
  if (value === 1) {
    pulses ++;
  }
  lastFlowPinState = value;
  flowrate = 1000.0;
  flowrate /= lastFlowRateTimer;
  lastFlowRateTimer = 0;
}
