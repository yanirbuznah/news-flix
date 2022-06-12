import ast
import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
# import requests
import requests

import model

preference_db_url = 'http://preferences-db-proxy.herokuapp.com'
# preference_db_url_update = 'http://localhost:4000/get_user'


class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        self._set_response()
        self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])  # <--- Gets the size of data
        post_data = self.rfile.read(content_length).decode('utf-8')  # <--- Gets the data itself
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                     str(self.path), str(self.headers), post_data)
        if self.path == '/':

            self.post_root(post_data)
        elif self.path == '/save_entities':
            self.post_save_entities(post_data)
        else:
            self.send_response(code=404)

    def post_save_entities(self, post_data):
        json_data = ast.literal_eval(post_data)
        id = json_data['id']
        sentence = json_data['sentence']
        sentence = model.tokenize_sentence(sentence)
        req = model.get_req_for_ner(sentence)
        res_dict = model.get_ner(req)
        entities = model.get_entity_from_response(res_dict)
        # print(entities)
        self._set_response()

    def get_users_preferences(self,records):
        contents = []
        for id, record in records.items():
            res = requests.get(preference_db_url +'/get_user', params={'_id': id})
            content = res.content.decode('utf-8')
            if content == '-1': # no user found
                continue
            content = json.loads(content)
            contents.append(content)
        return contents

    def update_users_preferences(self, updated_users):
        for user in updated_users:
            logging.info('updating user: {}'.format(user))
            res = requests.post(preference_db_url + '/set_user_sections_counter_and_preferences', json=user)
            logging.info(res.content.decode('utf-8'))

    def post_root(self, post_data):
        # get user old preferences
        json_data = ast.literal_eval(post_data)
        new_records = model.trans_to_ids(json_data)
        old_preferences = self.get_users_preferences(new_records)

        # change the records accordingly
        # new_records = model.trans_to_ids(json_data)

        # update the user in th DB
        updated_users = model.update_users(old_preferences, new_records)
        self.update_users_preferences(updated_users)
        self._set_response()
        self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))


def run(server_class=HTTPServer, handler_class=S, port=9000):
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


def main():
    import os

    port = int(os.environ.get("PORT",'9000'))
    run(port=port)



if __name__ == "__main__":
    main()
