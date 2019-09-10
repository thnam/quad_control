#!/bin/sh
kinit -k -t ~/.ssh/.kkt_nt namtran
ssh g2muon@g2quad02 './CAMAC/quad_read_threshold'
