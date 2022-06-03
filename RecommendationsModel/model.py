import numpy as np
import requests

import tokenizer

scheme = 'url,id,section,time'
sections = ["section section-blue", "section section-red", "section section-orange", "section section-grey", "section section-green"]
SECTIONS_DICT = {section:i for i, section in enumerate(sections)}

data_accumulator_url = 'http://limitless-sea-45427.herokuapp.com/informationrequest'
yap_url= 'http://localhost:8090/run_ncrf_model?model_name=token-multi'


def make_random_transactions():
    return [('url', np.random.randint(0, 10), np.random.choice(sections), t) for t in range(100)]


def trans_to_ids(trans):
    trans_per_id = {}
    for t in trans:
        id = t['id']
        if id not in trans_per_id.keys():
            trans_per_id[id] = []
        trans_per_id[id].append((t['url'], t['section'], t['clicktime'],t.get('clickedheader','')))
    return trans_per_id

def update_preferences(user_record):
    counter = user_record['sections_counter']
    preferences = (-np.array(counter)).argsort(kind='stable')

    user_record['preferences'] = [int(preferences[i]) for i in range(len(preferences))]
    return user_record

def update_counter_and_ner(user_record, new_record):
    ners = set(user_record.get('ner',[]))
    for _, theme, _, text in new_record:
        entities = get_entities_from_text(text)
        ners.update(set(entities))
        index = SECTIONS_DICT[theme]
        user_record['sections_counter'][index] += 1

    user_record['ner'] = list(ners)
    return user_record




def update_user(user_record, new_record):
    user_record = update_counter_and_ner(user_record, new_record)
    user_record = update_preferences(user_record)
    return user_record

def update_users(old_records, new_records):
    updated_records = []
    for record in old_records:
        record = update_user(record, new_records[record['_id']])
        updated_records.append(record)
    return updated_records


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
        res = requests.post(url=yap_url, json=req)
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

#
# res = get_transactions_from_db(10,clickTime=None, url=None, domain=None, section=None, id=None)
# print(res.content.decode('utf-8'))
