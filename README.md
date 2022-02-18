# quad_control
A web-based GUI for controlling the electrostatic quadrupole system in the Muon g-2 experiment.
Consists of 3 parts:
- `hwInterface`: talks to hardware
- `dataLogger`: periodically reads data from hardware, logs into a MongoDB database
- `httpServer`: a Nodejs server to provide a GUI to user
