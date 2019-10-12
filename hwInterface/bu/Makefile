CXX = g++
CXXFLAGS+=-g -O2 -std=c++11 -Wall 
CXXFLAGS+=-Iinclude -I$(G2QUAD_COMPILETIME_PATH)/include
CXXFLAGS+=-I$(BUTOOL_COMPILETIME_PATH)/include

LIBS = -L$(BUTOOL_LINK_PATH)/lib -lBUException
LIBS += -L$(G2QUAD_RUNTIME_PATH)/lib -lg2quad -lAddressTable
LIBS += -lreadline -pthread
LIBS += -Wl,-rpath=$(BUTOOL_COMPILETIME_PATH)/lib
LIBS += -Wl,-rpath=$(G2QUAD_COMPILETIME_PATH)/lib

src = ./src
obj = ./obj

targets = test pulserStatus setPulseMode getFaultPattern readPulserTiming\
					configPulser configRFPulser armSparkDetection

all: $(targets)

.PHONY: all clean

%: $(obj)/%.o
	@echo "Linking $@ ..."
	@$(CXX) -o $@ $^ $(LIBS)

$(obj)/%.o: $(src)/%.cc  
	@mkdir -p $(obj)
	@echo "Compiling $@ ..."
	@$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(obj)/*.o $(targets)
