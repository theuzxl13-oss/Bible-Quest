"""Gera um modelo 3D (GLB) a partir de uma imagem com o TRELLIS.2 (Microsoft, MIT) no Hugging Face (gratuito)."""
import shutil
import sys
import time

from gradio_client import Client, handle_file

img, saida = sys.argv[1], sys.argv[2]
seed = int(sys.argv[3]) if len(sys.argv) > 3 else 1
t0 = time.time()
# a chave do Hugging Face é injetada pelo proxy do ambiente; aqui vai só um marcador
c = Client('https://microsoft-trellis-2.hf.space/', token='hf_proxy-injected', verbose=False)
c.predict(api_name='/start_session')
pre = c.predict(handle_file(img), api_name='/preprocess_image')
print('pré-processada', time.time() - t0, flush=True)
c.predict(handle_file(pre), seed, '1024', api_name='/image_to_3d')
print('3D gerado', time.time() - t0, flush=True)
glb, dl = c.predict(300000, 2048, api_name='/extract_glb')
shutil.copy(dl or glb, saida)
print('GLB salvo em', saida, time.time() - t0, flush=True)
