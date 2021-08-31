#! /usr/bin/python3
# -*- coding: utf-8 -*-


import numpy as np
import pyvisa
import pymongo
import os
from time import sleep

use_python_wrapper = True


def createCollection(self, maxByte=100000):
    if self.colName in self.db.list_collection_names():
        pass
    else:
        self.db.create_collection(self.colName,capped=True, size=maxByte)

def getCollection(self):
    createCollection(self)
    return self.db[self.colName]


class Db_Update(object):
    def __init__(self):
        self.path = os.path.dirname(os.path.realpath(__file__))
        self.resourceManager = pyvisa.ResourceManager(
            "@py" if use_python_wrapper else "")
        self.QuadPlateEntries = np.array(
            ["Q1T", "Q1I", "Q1O", "Q2T", "Q2I", "Q2O", "Q3T", "Q3I", "Q3O", "Q4T", "Q4I", "Q4O", "QB"])

        # Assigning signal generators
        self.idVendor = 1535  # ID Vendor for Teledyne-LeCroy WaveStation2012
        self.idProduct = 2593  # ID Vendor for Teledyne-LeCroy WaveStation2012
        # Load the signal generators - amplifiers connection information.
        self.SG_Amps = np.genfromtxt(
            "{}/sg_amp_connection.dat".format(self.path), dtype="str", skip_header=1)
        self.SG_connection = [{"label": label,
                               "serial": serial,
                               "ch1": ch1,
                               "ch2": ch2,
                               "ch1index": np.where(self.QuadPlateEntries == ch1)[0][0] if ch1 in self.QuadPlateEntries else None,
                               "ch2index":np.where(self.QuadPlateEntries == ch2)[0][0] if ch2 in self.QuadPlateEntries else None,
                               "rm":pyvisa.ResourceManager("@py" if use_python_wrapper else ""),
                               "device":0} for (label, serial, ch1, ch2) in self.SG_Amps]
        self.SG_plateIndices = []
        for plate in self.QuadPlateEntries:
            for i, sg in enumerate(self.SG_connection):
                if plate == sg["ch1"]:
                    self.SG_plateIndices.append((i, 1))
                    break
                elif plate == sg["ch2"]:
                    self.SG_plateIndices.append((i, 2))
                    break
        self.SG_plateIndices = np.array(self.SG_plateIndices)
        for n in range(len(self.QuadPlateEntries)):
            read=[]            
            index, chWhich = self.SG_plateIndices[n]
            sg = self.SG_connection[index]
            resource = "USB0::{}::{}::{}::0::INSTR".format(
                self.idVendor, self.idProduct, sg["serial"])
            while True:
                try:
                    sg["device"] = sg["rm"].open_resource(resource)
                    break
                except:
                    print("No resources found... Sleep 1 sec and try to check again...")
                    sleep(1)
            if sg["device"]:
                try:
                    sg["device"].write("C{}:ARWV?".format(chWhich))
                    chName = sg["device"].read().split(",")[-1].split()[0]
                    sg["device"].write("C{}:BTWV STATE, ON".format(chWhich))
                    sg["device"].write("C{}:BTWV?".format(chWhich))
                    read = sg["device"].read().split(",")
                    frequency = read[20]
                    phase = read[-1]
                    #cycletime = read[11]
                    #nPeriods = cycletime*frequency  #nPeriods=cycletime/Timeperiod,Timeperiod = 1/frequency
                except:
                    print("No resources found")
                try:
                    self.ip="localhost"                                                            
                    self.conn = pymongo.MongoClient("mongodb://" + self.ip + ":27017/")                                                    
                    self.db = self.conn["quad"]                                                                      
                    self.colName = "RFParameters"
                except Exception as e:                                                                                                    
                    raise e                                                                                                                                                      
                getCollection(self).insert_one({"Quad_Plate": self.QuadPlateEntries[n],"frequency":frequency,"phase":phase,"channel_name":chName})                                                                                                        


if __name__ == "__main__":
    update_db = Db_Update()
