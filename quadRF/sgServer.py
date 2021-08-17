#! /usr/bin/python3
#-*- codiing: utf-8 -*-

import socket
import select
import numpy as np
import pyvisa
from datetime import datetime
from time import sleep
import queue
import json
import os, sys

"""
Socket settings
"""
# Host and port settings for the socket server.
Host = "0.0.0.0"
Port = 5050
RecvBuffsize = 2048*32

"""
Signal generator and Pyvisa settings
"""
use_python_wrapper = True if "linux" in sys.platform else False # Python wrapper to open the pyvisa resource manager.
idVendor, idProduct = 1535, 2593 # Teledyne-LeCrody WaveStation2012.
QuadPlateEntries = np.array(["Q1T", "Q1I", "Q1O", "Q2T", "Q2I", "Q2O", "Q3T", "Q3I", "Q3O", "Q4T", "Q4I", "Q4O", "QB"])
WaveformMaximumThreshold = 0.002 # The maximum absolute amplitude of a signal to be sent to the SGs should be higher than the threshold.

def sendCommand(device, cmd, sleepTime=0.5):
    device.write(cmd)
    if cmd[-1] == "?": # query
        output = device.read()
        return output
    else:
        sleep(sleepTime)

class SGBackendServer(object):
    def __init__(self):
        self.path = os.path.dirname(os.path.realpath(__file__))
        self.resourceManager = pyvisa.ResourceManager("@py" if use_python_wrapper else "")
        self.SG_Amps = np.genfromtxt(f"{self.path}/sg_amp_connection.dat", dtype="str", skip_header=1) # Load the signal generators - amplifiers connection information.
        self.SG_connection = [ {"label":label,
								"serial":serial,
								"ch1":ch1, 
								"ch2":ch2, 
								"ch1index":np.where(QuadPlateEntries == ch1)[0][0] if ch1 in QuadPlateEntries else None,
								"ch2index":np.where(QuadPlateEntries == ch2)[0][0] if ch2 in QuadPlateEntries else None,
								"rm":pyvisa.ResourceManager("@py" if use_python_wrapper else ""), 
								"device":0} for (label, serial, ch1, ch2) in self.SG_Amps ]
        self.SG_plateIndices = [] # Mapping from the quad plate to (SG, channel).
        for plate in QuadPlateEntries:
            for i, sg in enumerate(self.SG_connection):
                if plate == sg["ch1"]:
                    self.SG_plateIndices.append((i, 1)) # i-th sg, ch1
                    break
                elif plate == sg["ch2"]:
                    self.SG_plateIndices.append((i, 2)) # i-th sg, ch2
                    break
        self.SG_plateIndices = np.array(self.SG_plateIndices)

        self.openSocketServer()

    def openSocketServer(self):
        # Make a socket object: (address family: IPv4 (AF_INET), type: TCP (SOCK_STREAM)).
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # Guarantee that recv() would never block indefinitely.
        self.server_socket.setblocking(0)

        # Handle the WinError 10048 when the port is occupied.
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        # Open the socket server.
        print("Waiting for a client to join...")
        self.server_socket.bind((Host, Port))
        self.server_socket.listen()

        inputs = [ self.server_socket ]
        outputs = [ self.server_socket ]
        message_queues = {}

        while inputs:
            print("Wating for an event from the clients...")
            ready_to_read, ready_to_write, in_error = select.select(inputs, outputs, inputs)

            for s in ready_to_read:
                if s is self.server_socket:
                    client_socket, client_addr = self.server_socket.accept()
                    print(f"New connection from {client_addr}.")
                    client_socket.setblocking(0)
                    inputs.append(client_socket)
                    message_queues[client_socket] = queue.Queue()
                else:
                    try:
                        msg = s.recv(RecvBuffsize).decode()
                        if msg:
                            print(f"Received from {s.getpeername()}: {msg}")
                            if s not in outputs: outputs.append(s)
                            message_queues[s].put(msg)
                        else:
                            print(f"Empty msg received from {s.getpeername()}, closing the connection.")
                            s.close()
                            if s in inputs: inputs.remove(s)
                            if s in outputs: outputs.remove(s)
                            del message_queues[s]
                    except ConnectionResetError:
                        print(f"Client {s.getpeername()} shut down the connection.")
                        s.close()
                        if s in inputs: inputs.remove(s)
                        if s in outputs: outputs.remove(s)
                        del message_queues[s]

            
            for s in ready_to_write:
                try:
                    next_msg = message_queues[s].get_nowait()
                except queue.Empty:
                    print(f"Output queue for {s.getpeername()} is empty, removing from the output list.")
                    outputs.remove(s)
                else:
                    print(f"Dealing with the msg from {s.getpeername()}: {next_msg}")
                    self.client_socket = s
                    try:
                        data = json.loads(next_msg)
                        if data["cmd"] == "shutdownServer":
                            self.sendMessage("Shutdown the backend server.")
                            for s in inputs: s.close()
                            for s in outputs: s.close()
                            inputs = outputs = []
                            print("Shutting down the server.")

                        elif data["cmd"] == "debug":
                            self.debug(data)

                        elif data["cmd"] == "sendWaveform":
                            self.sendWaveform(data)

                        elif data["cmd"] == "turnOutput":
                            self.turnOutput(data)
                        
                        elif data["cmd"] == "updateStatus":
                            self.updateStatus()

                        else:
                            self.sendMessage("Data type unrecognized.")

                    except pyvisa.errors.VisaIOError:
                        self.sendMessage("[ VisaIOError ] Some signal generators might have been powered off abnormally. Please check.")
                    
                    except json.decoder.JSONDecodeError:
                        self.sendMessage("[ JSONDecodeError ] Data type unrecognized. Please check.")

                    # except Exception as e:
                    #     self.sendMessage(f"[ Error ] {e}")
            
            for s in in_error:
                print(f"Handling exceptional condition for {s.getpeername()}.")
                inputs.remove(s)
                if s in outputs: outputs.remove(s)
                s.close()
                del message_queues[s]
    
    def sendMessage(self, message):
        """ Send general message to the client (JSON format). """
        jsondata = {"type": "message", "content": message}
        print(f"Sending this message to the client: {jsondata}")
        self.client_socket.send(f"{json.dumps(jsondata)}".encode())
    
    def sendSGData(self, sg, data):
        """ Send signal generator data to the client (JSON format). """
        jsondata = {"type": "data", "ch1": sg["ch1"], "ch2": sg["ch2"], "data": data.strip()}
        print(f"Sending this data to the client: {jsondata}")
        self.client_socket.send(f"{json.dumps(jsondata)}".encode())

    def initSG(self, sg):
        if not sg["device"]:
            try:
                sg["device"] = sg["rm"].open_resource(f"USB0::{idVendor}::{idProduct}::{sg['serial']}::0::INSTR")
                print(f"Successfully connected to {sg['serial']}.")
            except Exception as e:
                # print(f"Exception has occurred: {e}")
                print(f"Failed to connect to {sg['serial']}.")
                self.sendSGData(sg, "DISCONNECTED")
                return
        try:
            sendCommand(sg["device"], "ROSC EXT") # Set reference clock "external".
            rosc = sendCommand(sg["device"], "ROSC?")
            self.sendSGData(sg, rosc)
            if "EXT" not in rosc: raise Exception("ROSC setting has not been done properly.")

            for i, ch in enumerate(["ch1index", "ch2index"]):
                if sg[ch] != None:
                    sendCommand(sg["device"], f"C{i+1}:OUTP LOAD, 50, PLRT, NOR") # Set output impedance 50 Ohm, polarity normal.
                    outp = sendCommand(sg["device"], f"C{i+1}:OUTP?")
                    self.sendSGData(sg, outp)

                    outp = sendCommand(sg["device"], f"C{i+1}:ARWV?")
                    self.sendSGData(sg, outp)
        except Exception as e:
            print(f"Exception has occurred: {e}")

    def sendWaveform(self, data, csvLeng=100000):
        waveformSpan = float(data["waveformSpan"])
        waveformData = np.array(data["waveformData"].split(","), dtype=float)
        plate_index = np.where(QuadPlateEntries == data["target"])[0][0]

        sg_index, ch = self.SG_plateIndices[plate_index]
        sg = self.SG_connection[sg_index]
        if 10*waveformData.size > csvLeng:
            raise Exception("Seems like the ARWV works properly only if the CSVLENG is greater than at least 10 times of the number of the waveform points. Check this once again.")

        if not sg["device"]:
            print(f"Signal generator for the plate {data['target']} has not been initiated.\nInitiating...")
            self.initSG(sg)
        
        if np.max(np.abs(waveformData)) < WaveformMaximumThreshold:
            raise Exception("Received a virutally empty signal! Please check the waveform again.")
        
        try:
            chData = "\n".join(np.char.mod("%f", waveformData)) # Convert to the string format which SG can read.
            wvName = datetime.now().strftime("%H%M%S") # Waveform name: current time.
            wvSlot = "50" if ch == 1 else "51" # Waveform slot: M50 for ch1 and M51 for ch2.
            
            sendCommand(sg["device"], f"C{ch}:BSWV WVTP, SINE")
            sendCommand(sg["device"], f"WVCSV M{wvSlot}, WAVENM, {wvName}, CSVLENG, {csvLeng}, CSVDATA,Amplitude\n{chData}", sleepTime=1)
            sendCommand(sg["device"], f"C{ch}:ARWV INDEX, {wvSlot}, NAME, {wvName}")
            sendCommand(sg["device"], f"C{ch}:BSWV FRQ, {1e6/waveformSpan}, OFST, 0")
            sendCommand(sg["device"], f"C{ch}:BTWV STATE, ON, GATE_NCYC, NCYC, TRSR, EXT")
            sendCommand(sg["device"], f"C{ch}:BTWV STATE, ON, GATE_NCYC, GATE, PLRT, POS")

            outp = sendCommand(sg["device"], f"C{ch}:ARWV?")
            self.sendSGData(sg, outp)
        except Exception as e:
            print(f"Exception has occurred: {e}")

    def turnOutput(self, data):
        if data["target"] == 'All':
            opened_resources = self.resourceManager.list_opened_resources()
            sg_list = []
            for sg in self.SG_connection:
                if sg["device"] in opened_resources:
                    sg_list.append(sg)
            ch_list = [1, 2]
        else:
            plate_index = np.where(QuadPlateEntries == data["target"])[0][0]
            sg_index, ch = self.SG_plateIndices[plate_index]
            sg_list = [ self.SG_connection[sg_index] ]
            ch_list = [ ch ]

        for sg in sg_list:
            if not sg["device"]:
                print(f"Signal generator for the plate {data['target']} has not been initiated.\nInitiating...")
                self.initSG(sg)
            
            for ch in ch_list:
                try:
                    sendCommand(sg["device"], f"C{ch}:OUTP {data['state']}")
                    outp = sendCommand(sg["device"], f"C{ch}:OUTP?")
                    self.sendSGData(sg, outp)
                except Exception as e:
                    print(f"Exception has occurred: {e}")

    def debug(self, data):
        plate_index = np.where(QuadPlateEntries == data["target"])[0][0]
        sg_index, ch = self.SG_plateIndices[plate_index]
        sg = self.SG_connection[sg_index]

        sendCommand(sg["device"], data["runCommand"])
    
    def updateStatus(self):
        opened_resources = self.resourceManager.list_opened_resources()
        for sg in self.SG_connection:
            if sg["device"] in opened_resources:
                for i, ch in enumerate(["ch1index", "ch2index"]):
                    if sg[ch] == None: continue
                    # Read waveform name
                    outp = sendCommand(sg["device"], f"C{i+1}:ARWV?")
                    self.sendSGData(sg, outp)
                    # Read output state
                    outp = sendCommand(sg["device"], f"C{i+1}:OUTP?")
                    self.sendSGData(sg, outp)
            else:
                self.initSG(sg)

        


        

if __name__ == "__main__":
    server = SGBackendServer()



