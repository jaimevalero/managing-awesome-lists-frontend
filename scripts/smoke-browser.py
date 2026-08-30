import json, subprocess, time, urllib.request, sys
import websocket

BASE = sys.argv[1].rstrip('/')
PORT = 9336
chrome = subprocess.Popen(
    ["google-chrome", "--headless", "--disable-gpu", "--no-sandbox", "--window-size=1400,1000",
     f"--remote-debugging-port={PORT}", "--remote-allow-origins=*", "about:blank"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(4)
tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
page = [t for t in tabs if t["type"] == "page"][0]
ws = websocket.create_connection(page["webSocketDebuggerUrl"], suppress_origin=True)
ws.settimeout(2)
mid = [0]; errors = []

def send(method, **params):
    mid[0] += 1
    ws.send(json.dumps({"id": mid[0], "method": method, "params": params}))
    end = time.time() + 20
    while time.time() < end:
        try: msg = json.loads(ws.recv())
        except Exception: continue
        if msg.get("id") == mid[0]: return msg.get("result", {})
        if msg.get("method") == "Runtime.exceptionThrown":
            errors.append(msg["params"]["exceptionDetails"].get("text"))
        elif msg.get("method") == "Runtime.consoleAPICalled" and msg["params"]["type"] == "error":
            errors.append(" ".join(str(a.get("value", a.get("description",""))) for a in msg["params"]["args"])[:200])
    return {}

def ev(expr):
    r = send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
    return r.get("result", {}).get("value")

send("Page.enable"); send("Runtime.enable")

def goto(path, wait=7):
    send("Page.navigate", url=BASE + path); time.sleep(wait)

print("1) portada -> clic en la barra lateral")
goto("/")
ev("document.querySelector('.list-item-custom').click()"); time.sleep(3)
print("   ->", ev("location.pathname"), "|", ev("document.title"))

print("2) portada -> clic en una tarjeta destacada")
goto("/")
ev("document.querySelector('.category-card').click()"); time.sleep(3)
print("   ->", ev("location.pathname"), "|", ev("document.title"))

print("3) pagina de topic -> boton de parecidos (popover)")
goto("/a-topic/rust")
ev("document.querySelector('.related-btn').click()"); time.sleep(3)
print("   filas en el popover:", ev("document.querySelectorAll('.related-row').length"))
print("   motivo mostrado:", ev("document.querySelector('.related-shared')?.textContent?.trim()"))
print("   enlace 'ver todos':", ev("document.querySelector('.related-more')?.textContent?.trim()"))

print("4) 'ver todos' -> pagina de parecidos")
ev("document.querySelector('.related-more').click()"); time.sleep(4)
first = ev("location.pathname")
print("   ->", first, "|", ev("document.title"))
print("   tarjetas:", ev("document.querySelectorAll('.category-card, .repo-link').length"))
print("   miga de pan (1er salto, no debe salir):", ev("document.querySelector('.trail')?.textContent?.trim() || 'ninguna'"))

print("5) segundo salto -> la miga aparece")
ev("document.querySelector('.related-btn').click()"); time.sleep(3)
ev("document.querySelector('.related-more').click()"); time.sleep(4)
print("   ->", ev("location.pathname"))
print("   miga:", ev("document.querySelector('.trail')?.textContent?.replace(/\\s+/g,' ').trim()"))

print("\nerrores de consola:", errors if errors else "ninguno")
ws.close(); chrome.terminate()
