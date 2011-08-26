import sys
import os

rev = 5;
output = '../build/gee.min.js';
string =  "/*\n";
string += " * gee.js - http://georgealways.github.com/gee\n";
string += " * \n";
string += " * George Michael Brower - http://georgemichaelbrower.com\n";
string += " * Jono Brandel - http://jonobr1.com\n";
string += " */\n";

os.system("java -jar compiler.jar --js ../src/gee.js --js_output_file ../build/gee.min.js");

src_file = open(output,'r');
string += src_file.read() + "\n";

dep_file = open(output,'w');
dep_file.write(string);
dep_file.close();