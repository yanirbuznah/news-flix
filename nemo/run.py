import os
import subprocess
pwd = os.getcwd()
subprocess.Popen(f"start /wait {pwd}\\yapproj\\src\\yap\\yap api",shell=True)
print('yap api started')

# cd to nemo
os.chdir(f'{pwd}\\nerH')
subprocess.Popen(f"start /wait uvicorn api_main:app --port 8090",shell=True)
print('nemo started')

os.chdir('../')
print(os.getcwd())
subprocess.Popen(f"start /wait ngrok http 8090",shell=True)
print('ngrok started')
import time
time.sleep(5)

import requests
url = requests.get('http://localhost:4040/api/tunnels').json()['tunnels'][0]['public_url']
print(url)
res = requests.get('https://nlp-proxy.herokuapp.com/set_url?url='+url)


print(requests.get('https://crawler-newsflix.herokuapp.com'))
