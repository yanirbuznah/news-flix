import json

import numpy as np
import requests

scheme = 'url,id,section,time'
sections = ['football', 'basketball', 'soccer', 'tenis']

data_accumulator_url = 'http://localhost:8080/informationrequest'


def make_random_transactions():
    return [('url', np.random.randint(0, 10), np.random.choice(sections), t) for t in range(100)]


def trans_to_ids(trans):
    trans_per_id = {}
    for t in trans:
        id = t['id']
        if id not in trans_per_id.keys():
            trans_per_id[id] = []
        trans_per_id[id].append((t['url'], t['section'], t['clickTime']))
    return trans_per_id


def update_user(user_record, id, new_records):
    new_record = new_records[id]
    for _, theme, _ in new_record:
        user_record[theme] = user_record[theme] + 1 if theme in user_record.keys() else 1
    return user_record


def get_transactions_from_db(k=10, **kwargs):
    request = {'k':k}
    for key,value in kwargs.items():
        if value is not None:
            request[key] = value

    return requests.post(url=data_accumulator_url,json=request)

res = get_transactions_from_db(10,clickTime=dict(startTime='2022-03-29 16:30:00', endTime='2022-03-29 16:33:00'), url=None, domain=None, section=None, id=1717)
print(res.content.decode('utf-8'))
