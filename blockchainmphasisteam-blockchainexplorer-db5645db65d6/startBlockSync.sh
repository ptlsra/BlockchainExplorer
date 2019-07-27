#!/bin/bash

# 

printUsage(){
echo ""
echo "USAGE : "
echo "ARGS[1] - EthereumSync.py/QuorumSync.py"
}

if [  ${#@} == 1 ] ; then
python3 scripts/$1
else
printUsage
fi