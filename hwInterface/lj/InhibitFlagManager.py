import pymongo

class InhibitFlagManager(object):
    """ InhibitFlagManager: a small utility class that can set/clear an flag
    User interface:
            - setInhibit(): set the inhibit flag to 1
            - clearInhibit(): clear the flag (i.e. set to 0)
            - readInhibitStatus(): read current flag
    """
    def __init__(self, ip="localhost"):
        super(InhibitFlagManager, self).__init__()
        try:
            self.ip = ip
            self.conn = pymongo.MongoClient("mongodb://" + self.ip + ":27017/")
            self.db = self.conn["quad"]
            self.colName = "globalInhibit"
        except Exception as e:
            raise e

    def createCollection(self, maxByte=100000, maxEntry=1):
        """Create a capped collection if not exist
        :returns: None
        """
        if self.colName in self.db.list_collection_names():
            pass
        else:
            self.db.create_collection(self.colName,
                                      capped=True, size=maxByte, max=maxEntry)

    def getCollection(self):
        self.createCollection()
        return self.db[self.colName]

    def setInhibit(self):
        self.getCollection().insert_one({"inhibit": 1})

    def clearInhibit(self):
        self.getCollection().insert_one({"inhibit": 0})

    def readInhibitStatus(self):
        return self.getCollection().find({})[0]["inhibit"]
