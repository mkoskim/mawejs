#!/usr/bin/env python
###############################################################################
#
# Local web server
#
###############################################################################

import sys
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

import threading
import webbrowser

#------------------------------------------------------------------------------

HandlerClass = SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

#------------------------------------------------------------------------------

if sys.argv[1:]:
    port = int(sys.argv[1])
else:
    port = 8000

#------------------------------------------------------------------------------

HandlerClass.protocol_version = Protocol
httpd = ServerClass(('127.0.0.1', port), HandlerClass)

#------------------------------------------------------------------------------
# Create server socket
#------------------------------------------------------------------------------

sa = httpd.socket.getsockname()
print("Serving HTTP on", sa[0], "port", sa[1], "...")

#------------------------------------------------------------------------------
# Open server root to browser
#------------------------------------------------------------------------------

webbrowser.open("http://%s:%s" % (sa[0], sa[1]))

#------------------------------------------------------------------------------
# Serve requests
#------------------------------------------------------------------------------

httpd.serve_forever()

