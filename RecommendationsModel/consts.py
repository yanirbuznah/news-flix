
data_accumulator_url = 'http://limitless-sea-45427.herokuapp.com/informationrequest'
nlp_proxy_url = 'https://nlp-proxy.herokuapp.com/get_url'
nemo_route = '/run_ncrf_model?model_name=token-multi'
scheme = ['url','section','clicktime','clickedheader']
sections = ["section section-blue", "section section-red", "section section-orange", "section section-grey", "section section-green"]
SECTIONS_DICT = {section:i for i, section in enumerate(sections)}
preference_db_url = 'http://preferences-db-proxy.herokuapp.com'
set_user_route =  '/set_user_sections_counter_and_preferences'
get_suer_route = '/get_user'
save_entities_route = '/save_entities'