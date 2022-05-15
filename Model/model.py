import numpy as np
import requests

import tokenizer

scheme = 'url,id,section,time'
sections = ['football', 'basketball', 'soccer', 'tenis']

data_accumulator_url = 'http://limitless-sea-45427.herokuapp.com/informationrequest'


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


def get_ner(reqs):
    text = []
    preds = []
    for req in reqs:
        # response.append(requests.post(url=data_accumulator_url, json=r))
        res = requests.post(url='http://localhost:8090/run_ncrf_model?model_name=token-multi', json=req)
        text.append(res.json()[0]['tokenized_text'])
        preds.append(res.json()[0]['ncrf_preds'])
        # response.append(res.json()[0])
    # print(res.content.decode('utf-8'))
    text = [word for sublist in text for word in sublist]
    preds = [pred for sublist in preds for pred in sublist]
    response = {'tokens': text, 'preds': preds}
    return response


def get_req_for_ner(sentence):
    reqs = []
    sentence = sentence.split()
    sent = ''
    for i,word in enumerate(sentence):
        sent += word + ' '
        if i % 200 == 0 and i != 0:
            reqs.append({"sentences": sent, "tokenized": False})
            sent = ''
    if len(sent) > 0:
        reqs.append({"sentences": sent, "tokenized": False})
    # reqs.append({"sentences": sent, "tokenized": False})
    # req = {"sentences": sentence, "tokenized": False}
    return reqs


def get_entity_from_response(res_dict):
    tokens = res_dict['tokens']
    preds = res_dict['preds']
    entities = []
    i = 0
    while i < len(tokens):
        if '-' in preds[i]:
            ent = tokens[i]
            i += 1
            while i < len(tokens) and '-' in preds[i]:
                ent += ' ' + tokens[i]
                i += 1
            entities.append(ent)
        i += 1
    return entities


def tokenize_sentence(sentence):
    tokens = [x[1] + ' ' for x in tokenizer.tokenize(sentence)]
    sentence = ''.join(tokens)
    return sentence



# import requests
# text = 'גנן גידל דגן בגן'
# localhost_yap = "http://localhost:8000/yap/heb/joint"
# data = '{{"text": "{}  "}}'.format(text).encode('utf-8')  # input string ends with two space characters
# headers = {'content-type': 'application/json'}
# response = requests.get(url=localhost_yap, data=data, headers=headers)
# json_response = response.json()



# text = 'לא הרבה יודעים, אבל כהנא צחק. '
def get_entities_from_text(text):

    sentence = tokenize_sentence(text)
    reqs = get_req_for_ner(sentence)
    res_dict = get_ner(reqs)
    entities = get_entity_from_response(res_dict)
    # print(entities)
    return entities
# entities = get_ner_from_text('לא הרבה יודעים אבל כהנא צחק')
# print(entities)


res = get_transactions_from_db(10,clickTime=None, url=None, domain=None, section=None, id=None)
print(res.content.decode('utf-8'))
