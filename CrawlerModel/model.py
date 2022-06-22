import requests
import consts
import tokenizer
nemo_url = requests.get(consts.nlp_proxy_url).json()['url']
nemo_url_route = nemo_url + consts.nemo_route
print(nemo_url)



def get_ner(reqs):
    text = []
    preds = []
    for req in reqs:
        res = requests.post(url=nemo_url_route, json=req)
        text.append(res.json()[0]['tokenized_text'])
        preds.append(res.json()[0]['ncrf_preds'])

    text = [word for sublist in text for word in sublist]
    preds = [pred for sublist in preds for pred in sublist]
    response = {'tokens': text, 'preds': preds}
    return response

def check_if_server_enabled():
    global nemo_url, nemo_url_route
    if requests.get(url=nemo_url).status_code == 200:
        return True
    nemo_url = requests.get(consts.nlp_proxy_url).json()['url']
    if requests.get(url=nemo_url).status_code == 200:
        nemo_url_route = nemo_url + consts.nemo_route
        return True


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


def get_entities_from_text(text):

    sentence = tokenize_sentence(text)
    reqs = get_req_for_ner(sentence)
    res_dict = get_ner(reqs)
    entities = get_entity_from_response(res_dict)

    return entities

