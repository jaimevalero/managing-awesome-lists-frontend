"""Prueba de humo del comportamiento en cliente, pilotando Chrome por DevTools.

Existe porque nada comprobaba el cliente: un fallo de hidratacion que rompia toda la
navegacion estuvo un dia entero sin que nadie lo viera, porque el HTML servido estaba
perfecto y curl no ve mas que eso.

Necesita websocket-client, que esta en el env conda epg-crew:

    /home/jaimevalero/anaconda3/envs/epg-crew/bin/python scripts/smoke-browser.py \
        https://managing-awesome-lists.vercel.app
"""
import json
import subprocess
import sys
import time
import urllib.request

import websocket

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000").rstrip('/')
# Un repo que el backend dejo sin fichero de parecidos: son 4.005, y llegar ahi tiene
# que decir "no hay parecidos", no "no encontrada"
REPO_WITHOUT_SIMILAR = "0rpc@zerorpc-python"
PORT = 9337

chrome = subprocess.Popen(
    ["google-chrome", "--headless", "--disable-gpu", "--no-sandbox", "--window-size=1400,1000",
     f"--remote-debugging-port={PORT}", "--remote-allow-origins=*", "about:blank"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(4)

tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
ws = websocket.create_connection(
    [t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"], suppress_origin=True)
ws.settimeout(2)
message_id = [0]
errors = []
failures = []


def send(method, **params):
    message_id[0] += 1
    ws.send(json.dumps({"id": message_id[0], "method": method, "params": params}))
    deadline = time.time() + 20
    while time.time() < deadline:
        try:
            message = json.loads(ws.recv())
        except Exception:
            continue
        if message.get("id") == message_id[0]:
            return message.get("result", {})
        if message.get("method") == "Runtime.exceptionThrown":
            errors.append(message["params"]["exceptionDetails"].get("text"))
        elif (message.get("method") == "Runtime.consoleAPICalled"
              and message["params"]["type"] == "error"):
            errors.append(" ".join(
                str(a.get("value", a.get("description", ""))) for a in message["params"]["args"])[:200])
    return {}


def evaluate(expression):
    result = send("Runtime.evaluate", expression=expression, returnByValue=True, awaitPromise=True)
    return result.get("result", {}).get("value")


def goto(path, wait=7):
    send("Page.navigate", url=BASE + path)
    time.sleep(wait)


def check(name, actual, expected_in):
    ok = expected_in in str(actual)
    print(f"  {'OK ' if ok else 'FALLA'} {name}: {actual}")
    if not ok:
        failures.append(f"{name}: esperaba '{expected_in}', vino '{actual}'")


send("Page.enable")
send("Runtime.enable")

print("1) la barra lateral navega")
goto("/")
evaluate("document.querySelector('.list-item-custom').click()")
time.sleep(3)
check("ruta", evaluate("location.pathname"), "/a-awesome/")
check("titulo", evaluate("document.title"), "recursos")

print("2) las tarjetas destacadas navegan")
goto("/")
evaluate("document.querySelector('.category-card').click()")
time.sleep(3)
check("ruta", evaluate("location.pathname"), "/a-awesome/")

print("3) el boton de parecidos lleva directo a su pagina")
goto("/a-topic/rust")
check("hay boton", evaluate("document.querySelectorAll('.similar-btn').length > 0"), "True")
evaluate("document.querySelector('.similar-btn').click()")
time.sleep(4)
check("ruta", evaluate("location.pathname"), "/a-similar/")
check("titulo", evaluate("document.title"), "Similar to")
check("sin miga en el primer salto",
      evaluate("document.querySelector('.trail') === null"), "True")

print("4) segundo salto: aparece la miga de pan")
evaluate("document.querySelector('.similar-btn').click()")
time.sleep(4)
check("ruta", evaluate("location.pathname"), "/a-similar/")
check("miga", evaluate("document.querySelector('.trail')?.textContent?.replace(/\\s+/g,' ').trim()"), "›")

print("5) un repo sin parecidos lo dice, no da error")
goto(f"/a-similar/{REPO_WITHOUT_SIMILAR}")
check("mensaje", evaluate("document.body.textContent.includes('No similar repositories found')"), "True")

print(f"\nerrores de consola: {errors if errors else 'ninguno'}")
if errors:
    failures.append(f"{len(errors)} errores de consola")

ws.close()
chrome.terminate()

if failures:
    print("\nFALLOS:")
    for failure in failures:
        print(" -", failure)
    sys.exit(1)
print("\nTodo correcto.")
