#!/usr/bin/env python3
"""
Very simple HTTP server in python for logging requests
Usage::
    ./server.py [<port>]
"""
import logging
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

import crawler
import json


class S(BaseHTTPRequestHandler):

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()


    def do_GET(self):
            logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
            if self.path == '/':
                self._set_headers()
                ners = crawler.entities
                self.wfile.write(json.dumps(ners,ensure_ascii=False).encode('utf-8'))
            else:
                self.send_response(code=404)




def run(server_class=HTTPServer, handler_class=S, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')


def wait_until(timeout, period=0.25):
    mustend = time.time() + timeout
    while time.time() < mustend:
        if crawler.entities: return True
        time.sleep(period)
    return False


if __name__ == '__main__':
    import os

    wait_until(timeout=60, period=10)
    port = int(os.environ.get('PORT', 1234))
    run(port=port)
