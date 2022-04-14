import numpy as np
import requests

import tokenizer

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
    request = {'k': k}
    for key, value in kwargs.items():
        if value is not None:
            request[key] = value

    return requests.post(url=data_accumulator_url, json=request)


def get_ner(req):
    res = requests.post(url='http://localhost:8090/run_ncrf_model?model_name=token-multi', json=req)
    # print(res.content.decode('utf-8'))
    return res.json()[0]


def get_req_for_ner(sentence):
    req = {"sentences": sentence, "tokenized": False}
    return req


def get_entity_from_response(res_dict):
    tokens = res_dict['tokenized_text']
    preds = res_dict['ncrf_preds']
    entities = []
    i = 0
    while i < len(tokens):
        if '-' in preds[i]:
            ent = tokens[i]
            i += 1
            while '-' in preds[i]:
                ent += ' ' + tokens[i]
                i += 1
            entities.append(ent)
        i += 1
    return entities
def tokenize_sentence(sentence):
    tokens = [x[1]+' ' for x in tokenizer.tokenize(sentence)]
    sentence = ''.join(tokens)
    return sentence

# req = get_req_for_ner(text)
# res_dict = get_ner(req)
# entities = get_entity_from_response(res_dict)
# print(entities)
# res = get_transactions_from_db(10,clickTime=dict(start_time='None', end_time='None'), url=None, domain=None, section=None, id=None)
# print(res.content.decode('utf-8'))
