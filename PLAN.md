# Plan pendiente

Estado al cerrar la sesión del 2026-08-30. Los puntos 1 y 2 están hechos y commiteados
en las dos ramas `master`; **falta hacer push y comprobar en producción**.

---

## 0. Lo que se cerró el 2026-08-30

### Punto 1, el bug del SSR: HECHO (`b612cc716e` en el frontend)

`composables/usePublicJson.ts` construye la URL con el origen de la petición
(`useRequestURL()`), así que el fetch pasa por la CDN en vez de resolverse dentro de la
función serverless de Vercel, que no sirve `public/`.

De paso salieron dos cosas más:

- El **menú lateral** también se cargaba en `onMounted`, así que el HTML servido no
  traía ni un enlace a las 83 listas. Es el grafo de enlaces internos del sitio. Ahora
  va en SSR, compartiendo la clave `'lists'` con la portada, así que no cuesta un fetch
  extra. Comprobado en local: 80 listas en el HTML servido.
- El **estado vacío** distingue ya "la búsqueda no encontró nada" de "los datos no
  cargaron", y la página de categoría distingue un 404 de un fallo de carga.

Pendiente: **verificar en producción tras el push**. El síntoma a comprobar es que
`curl https://…/a-topic/llm` deje de devolver `<title>Lista no encontrada`.

### Punto 2, la página de parecidos: HECHO (`823d2a9e` backend, `0f119eaad8` + `ee978cc6e8` frontend)

`/a-similar/<owner@repo>`, sobre la ruta genérica, sin página nueva.

- El artefacto se llama ahora `similar` (antes `related`), porque el nombre del
  directorio tiene que coincidir con `category_type`.
- Cada vecino viaja con `topics`, `created_at` y `pushed_at`, que es lo que necesitan
  los órdenes Hot y New. `shared_topics` **se deja de guardar**: con la lista completa
  de topics al lado, es la intersección de dos listas que el navegador ya tiene.
- El modelo lleva `repo_meta_data` con el repo de origen, así que la página se describe
  sola (la ruta genérica ya lee `repo_meta_data.description`).
- `SimilarTrail.vue`: miga de pan de los últimos 6 saltos en `sessionStorage`. Volver
  sobre tus pasos recorta el rastro en vez de alargarlo.
- **El popover ya no existe** (`afd728b315`). El botón de la tarjeta es un enlace directo
  a `/a-similar/<owner@repo>`: preguntar "qué se parece a esto" merece una página, no
  cinco líneas en un menú del que hay que salir para acabar en el mismo sitio. Se lleva
  por delante un `v-menu` por tarjeta, que es de la misma familia de overlays de Vuetify
  que rompió la hidratación. Los 4.005 repos sin parecidos llegan ahora a una página, así
  que el 404 ahí dice "no similar repositories found" y no "no encontrada".
- `noindex` en estas páginas; el sitemap ya no las incluía porque solo recorre
  `awesome` y `topic`.

**Verificado en producción** pilotando Chrome (ver más abajo): popover con 5 filas y su
motivo, enlace "ver todos", página con sus tarjetas, y la miga de pan apareciendo en el
segundo salto. Sin errores de consola.

### El hallazgo gordo: 12 vecinos de esta calidad no existían

Subir `MAX_RESULTS` de 5 a 12 tal cual daba 100 MB de datos y una cola de basura:
`linenoise` sugería `redis`, `ravendb` y `babel/minify`.

Medido el 2026-08-30, la causa: **por encima de 0,65 el coseno de embedding deja de
distinguir**. Entre los vecinos de `linenoise`, `redis` puntúa 0,74 y `replxx` 0,70, así
que subir `MIN_EMBEDDING_SCORE` se lleva antes al bueno. Y el conjunto de candidatos es
de solo ~20 repos (`EMBEDDING_CANDIDATES = 20`), así que pedir 12 es rascar el fondo.

Lo que sí distingue es el vocabulario: la basura está clavada en 0,00. De ahí
`MIN_CORROBORATION_SCORE = 0.10` — **los embeddings proponen y el vocabulario confirma**.

| suelo de vocabulario | vecinos (media) | mediana | repos sin nada | tamaño |
|---|---|---|---|---|
| 0,00 | 11,99 | 12 | 1 | 100 MB |
| 0,05 | 6,18 | 6 | 2.045 | 53 MB |
| **0,10 (elegido)** | **5,84** | **5** | **3.708** | **49 MB** |
| 0,15 | 2,86 | 2 | 6.190 | 26 MB |

Efecto: `linenoise` se queda con sus tres alternativas reales, `ripgrep` pierde
`rag-rat` ★16 y `svgcleaner`, `airflow` pierde `dag-checks` ★9.

**Y esto es el argumento del punto 3.** La mediana es 5, no 12: la señal actual no da
para llenar una página de 12 ni para una navegación larga. La página está construida y
se llenará sola cuando entre una tercera señal, sin tocar el formato.

### El fallo de hidratación que salió al arreglar el SSR (`0f4f32eff2`)

Al desplegar el punto 1, la barra lateral dejó de navegar: la URL cambiaba y la página
no. **No lo introdujo ese commit**; venía del commit de SEO del 2026-08-29
(`55b007391e`). Se había estado escondiendo porque el SSR fallaba en producción y el
servidor no llegaba a renderizar ninguna tarjeta, así que no había nada que hidratar.
Reproducido en `41baec4e50` para confirmarlo.

Causa: Vuetify pinta `v-tooltip` teletransportado a un contenedor de overlays que **no
hidrata**. El árbol del cliente no cuadra con el HTML servido, Vue acaba en
`Cannot read properties of null (reading 'parentNode')` y con el árbol roto desde la
portada el router cambia la URL pero `<NuxtPage>` ya no intercambia el componente.

Arreglo: el `title` nativo del navegador en las tarjetas. Se pierde la animación del
tooltip, se gana que la web navegue.

**La barra lateral vuelve a cargarse en cliente**, así que se pierde el SEO de los
enlaces internos. Además de los tooltips, renderizarla en servidor descuadra los ids que
Vuetify autogenera (`input-3` contra `input-24`). Reintentarlo exige arreglar antes la
hidratación de Vuetify, no meter 80 componentes más en el árbol servido. Queda como
trabajo pendiente con valor real de SEO.

### Cómo verificar el cliente sin extensión de navegador

`scripts/smoke-browser.py` pilota el Chrome de torre por el protocolo de DevTools y
comprueba de punta a punta: barra lateral, tarjetas, popover, enlace "ver todos",
página de parecidos y miga de pan, más los errores de consola. Necesita
`websocket-client` (está en el env conda `epg-crew`):

```
/home/jaimevalero/anaconda3/envs/epg-crew/bin/python scripts/smoke-browser.py https://managing-awesome-lists.vercel.app
```

Esto es lo que faltaba: hasta ahora nada comprobaba el comportamiento en cliente, y por
eso un fallo de hidratación pudo estar un día entero sin que nadie lo viera.

### Efectos colaterales medidos

- `.git` del frontend: 238 MB → **326 MB**. Sigue en pie la decisión de `git push -f`
  con el historial reescrito si molesta.
- `ggreer/the_silver_searcher` **ya no aparece** entre los parecidos de `ripgrep`: tiene
  `emb=0.000`, o sea que ni siquiera entra en los 20 vecinos de embedding. El plan
  anterior daba por hecho que los embeddings lo recuperaban. Merece una mirada:
  probablemente `EMBEDDING_CANDIDATES = 20` se ha quedado corto para un corpus de 25.000.

---

## 1. ~~BUG CRÍTICO: el SSR no encuentra los datos en producción~~ (HECHO, ver punto 0)

**Prioridad máxima**, por encima de cualquier funcionalidad nueva.

### Síntoma

En https://managing-awesome-lists.vercel.app/

```
Featured Lists
No lists found matching ""
```

Y no es solo la portada. `/a-topic/llm` en producción devuelve:

```html
<title>Lista no encontrada</title>
<meta name="robots" content="noindex">
```

Es decir: **todas** las páginas de listas y topics se sirven a los crawlers como "no
encontrada" y encima con `noindex`. El SSR para SEO del commit `55b007391` no está
funcionando en producción.

No se nota navegando porque al entrar desde la barra lateral la navegación es en
cliente y ahí el fetch sí funciona. Falla al entrar por URL directa, al compartir un
enlace y al llegar desde un buscador.

### Diagnóstico

Comprobado el 2026-08-29:

| comprobación | resultado |
|---|---|
| `curl https://…/lists.json` | 200 ✓ |
| `curl https://…/topic/llm.json` | 200 ✓ |
| `curl https://…/` | 200, pero el HTML contiene `No lists found` |
| `curl https://…/a-topic/llm` | 200, pero `<title>Lista no encontrada` |

Los ficheros estáticos **sí** se sirven. Lo que falla es leerlos desde dentro.

Causa: `useAsyncData('lists', () => $fetch('/lists.json'))` en `pages/index.vue:238` y
`$fetch('/${type}/${name}.json')` en `pages/a-[type]/[[name]].vue:48`. En Vercel, un
`$fetch` con ruta relativa durante el SSR se resuelve **dentro de la función
serverless**, y esa función no sirve `public/` — de eso se encarga la CDN. Resultado:
404 interno, `data` a `null`, y se pinta el estado vacío.

Localmente no se ve porque `node .output/server/index.mjs` sirve los estáticos y el SSR
desde el mismo proceso.

### Arreglos candidatos

1. **URL absoluta con el origen de la petición** (el más general, sirve para los dos
   casos):
   ```ts
   const url = useRequestURL()
   $fetch(`${url.origin}/topic/${name}.json`)
   ```
   El SSR pasa por la CDN. Un salto de red extra, pero correcto.
2. **Importar el JSON en build** — solo vale para `lists.json`, que es pequeño. No sirve
   para los 26.000 ficheros de topic.
3. **Ruta de servidor que lea de `serverAssets`** — más limpio conceptualmente, pero
   habría que meter 51.000 ficheros en los assets del servidor.

Recomendado: el 1.

### Bug secundario, de paso

El estado vacío miente. Cuando no hay búsqueda activa dice literalmente
`No lists found matching ""`, que no significa nada. Hay que distinguir "la búsqueda no
encontró nada" de "los datos no cargaron" — si el segundo caso hubiera dicho "no se
pudieron cargar las listas", este bug se habría visto el primer día.

---

## 2. ~~DECIDIDO: página completa de parecidos, para navegar sin fin~~ (HECHO, ver punto 0)

`/a-similar/<owner@repo>` con la rejilla completa, no solo el popover de 5.

El objetivo no es "ver más resultados", es **saltar de parecido en parecido sin
frenar**, como quien se pierde en un scroll infinito. Eso cambia tres cosas respecto a
lo que habíamos hablado:

### Sale casi gratis en frontend, y el bucle se cierra solo

La ruta `pages/a-[type]/[[name]].vue` ya es genérica: hace
`$fetch('/${type}/${name}.json')`. Si el JSON tiene forma de categoría
(`category_type`, `category_name`, `repos_data`, `frecuent_topics`) la página funciona
con su buscador, su orden Hot/Top/New y su paginación **sin escribir una línea**.

Y lo mejor: esa página pinta `TableComponent` → `RepoCard`, y **`RepoCard` ya lleva el
botón de parecidos**. O sea que cada tarjeta de la página de parecidos ofrece sus
propios parecidos. Con un enlace "ver todos" al final del popover, el bucle infinito se
cierra sin código nuevo.

### El formato de datos: más barato de lo estimado

La estimación anterior de ~50 MB asumía guardar el `RepoModel` entero. No hace falta:
`RepoCard` solo necesita `full_name`, `description`, `stargazers_count`, `language`,
`topics`, `created_at` y `pushed_at`. De eso ya se guardan los cuatro primeros, así que
**basta añadir `created_at`, `pushed_at` y la lista completa de topics** a
`SimilarRepoModel`. Unos 100 bytes más por vecino: de 26 MB a ~35-40 MB, no a 50.

Ojo: `created_at` y `pushed_at` no son opcionales aquí, son lo que necesitan los órdenes
Hot y New para funcionar en esa página.

Hay que decidir además si el artefacto pasa a llamarse `similar` (y el directorio
`public/similar/`) o se queda en `related` y la URL es `/a-related/…`. La ruta genérica
exige que el nombre del directorio y el del tipo coincidan.

### Lo que la navegación infinita empeora, y hay que tener en cuenta

**El ruido se acumula.** Encadenando saltos, una sugerencia mala en el puesto 4 no es un
resultado malo: es la puerta a un vecindario entero equivocado. Con 5 resultados por
página y 3 saltos, un 20% de ruido por página se convierte en la mitad del recorrido
perdido. Dos consecuencias:

1. En la página conviene enseñar **más de 5** (10-12) para que haya elección real en
   cada salto, aunque el popover siga enseñando 5.
2. Esto sube muchísimo el valor del **grafo de estrellas** (sección 3): la calidad por
   salto deja de ser un detalle y pasa a ser lo que hace o rompe la función.

**Hace falta saber por dónde has venido.** Perderse es divertido; no poder volver, no.
Una miga de pan con los últimos saltos (`airflow ← dagster ← kestra`) es barata y
convierte el paseo en algo del que se puede salir.

### SEO

`noindex` en estas páginas. 25.000 páginas de 5 repos es contenido fino a escala, justo
lo que se evitó con `MIN_TOPIC_REPOS`. Y arreglar antes lo de la sección 1, o nacerán ya
rotas.

### Sobre el tamaño en git

LFS no aplica (los límites de GitHub son por fichero, y el mayor aquí son 1.770 bytes).
El coste real es que cada pasada mensual reescribe los 25.000 ficheros y `.git` ya va
por 238 MB. Decisión tomada: si molesta, `git push -f` con el historial reescrito.

### Aparcado para otro día

El "TikTok de repos": una tarjeta a pantalla completa, deslizas y aparece otro repo
parecido. Es la misma estructura de datos que esto — la navegación infinita ya es el
90% del trabajo.

---

## 3. MUERTO POR CAUSA EXTERNA: grafo de estrellas (filtrado colaborativo)

> **GitHub cerró el dato el 30 de junio de 2026.** Comprobado el 2026-08-30, ver
> "Por qué no se puede" justo debajo. Todo lo que sigue en esta sección es el diseño
> que ya no se puede construir; se conserva porque el razonamiento sobre las señales
> sigue siendo válido, no porque haya nada que hacer.

### Por qué no se puede

[Anuncio de GitHub](https://github.blog/changelog/2026-06-30-upcoming-access-restrictions-to-public-api-endpoints-and-ui-views/):
`/repos/{owner}/{repo}/stargazers` y `/repos/{owner}/{repo}/subscribers` pasan a ser
solo para admins y colaboradores, `/users/{username}/subscriptions` queda deprecado
devolviendo vacío, y las vistas web `/stargazers` y `/watchers` también se cierran. El
motivo declarado: *"misuse of public stargazer/watcher data for spam and user data
collection activities"*.

Medido el 2026-08-30 con nuestro token (clásico, scopes `repo, user`):

| prueba | resultado |
|---|---|
| `/repos/apache/airflow/stargazers` | **404** |
| `/repos/jaimevalero/managing-awesome-lists/stargazers` (propio) | 200 |
| GraphQL `stargazers { nodes }` de un repo ajeno | `stargazerCount: 4346`, **`nodes: []`** |
| sin token | 401 |

Devuelve 404 en vez de 403 para no filtrar ni la existencia. **El cálculo de coste del
plan original (891.729 peticiones, 7 días) estaba hecho sobre una capacidad que ya no
existe.**

### El rodeo que se descartó, y por qué

`/users/{login}/starred` **no** está restringido, así que el grafo se puede leer del
otro lado: sacar logins de los contribuidores de los repos del corpus y pedirle a cada
persona qué ha marcado. Medido sobre 15 repos semilla: 1.377 usuarios únicos con 15
peticiones, y la primera página de estrellas de un usuario trae 11,6 repos del corpus de
cada 100 (19%), con 24 de cada 25 usuarios aportando algo. Presupuesto: ~1.000
peticiones de semilla + ~30.000 de usuarios ≈ 6-9 h. Viable.

Se descartó igualmente, por dos razones:

1. **Es la puerta de al lado de la que acaban de tapiar.** El motivo declarado del cierre
   es frenar exactamente esta agregación; `/users/X/starred` es el siguiente candidato
   obvio. Montar un crawler de 9 h y un pipeline encima es construir sobre arena.
2. **Los contribuidores no son los que marcan.** Es un proxy con sesgo de perfil, no la
   señal que el plan quería. Y encima las semillas más estrelladas disparan el límite
   secundario por tiempo de CPU: dos esperas de 60 s en las primeras 10 peticiones
   (calcular los contribuidores de `torvalds/linux` es carísimo de servir).

**GH Archive** (el firehose de eventos, donde `WatchEvent` es dar una estrella) no
aparece en el anuncio y hoy seguiría teniendo el dato. Se descartó por riesgo: es la otra
puerta a lo mismo que GitHub dice querer cerrar, y puede desaparecer sin aviso. Descargar
tampoco cabía: quedan 9 GB libres en torre.

Se llegaron a escribir `StargazerDownloader.py` y `CoStarSimilarity.py` (con las dos
correcciones de sesgo: coseno contra la popularidad y `1/log` contra los usuarios
prolíficos). Se borraron al desistir; están en el historial de esta sesión si algún día
GitHub reabre el dato.

### Qué queda de todo esto

El diagnóstico que motivaba el punto 3 **sigue en pie**: la mediana es de 5 vecinos, no
12, y la señal de texto no da para más. Lo que cambia es que hay que sacarle más a las
señales que sí controlamos, en vez de esperar una tercera. Ver el punto 6.

---

### (Diseño original, ya no construible)

La mejor idea de la sesión. Ataca de raíz el problema que las heurísticas solo parchean.

### Por qué

El grafo usuario → repo → usuario → repo es **profundo** (a diferencia de lista → repo,
que tiene dos niveles) y cada arista es un aval humano deliberado. Es el grafo donde un
paseo aleatorio significa algo, y es lo que mueve las recomendaciones de Amazon.

Resolvería el caso que quedó pendiente: quien tiene estrella en `airflow` la tiene en
`dagster` y `prefect`; casi nadie estrella `airflow-config`. Distingue satélites de
alternativas **sin heurísticas**, porque la gente ya hizo esa distinción.

### Coste medido (2026-08-29)

25.487 repos, 89.172.969 estrellas en total, mediana 370 por repo.

| estrategia | peticiones | tiempo a 5.000/h |
|---|---|---|
| todos los stargazers | 891.729 | 178 h = 7 días ❌ |
| muestra de 200 por repo | 50.974 | 10 h ✓ |
| muestra de 50 por repo | 12.743 | 3 h ✓ |

Con mediana 370, muestrear 200 por repo captura casi toda la audiencia real del 60% del
corpus. Solo se muestrea fino la cabeza, que es donde sobran datos.

### Límites secundarios de la API (el riesgo real)

Se manifiestan como 403/429 con `Retry-After` **mientras el contador primario parece
intacto**. Los que aplican:

- concurrencia máxima 100 peticiones (el código ya es secuencial),
- ~900 puntos por minuto (no muerde si se respeta el presupuesto horario),
- **tiempo de CPU del servidor** (~90 s por cada 60 s reales): este sí. Una query de 50
  repos × 100 stargazers es cara de servir y dispara este límite aunque los puntos vayan
  sobrados. Bajar a lotes de 10-20 repos para campos caros.

Diseño que lo neutraliza: **nadie espera el resultado**. Crawler lento (~1 petición por
segundo, que es lo que GitHub recomienda), reanudable con un fichero por repo como
`var/repo`, respetando `Retry-After` al pie de la letra y con backoff exponencial con
jitter para los 502 (que es como GitHub dice "esa query era demasiado gorda").

**Optimización que elimina casi todo el coste recurrente**: para este trabajo REST le
gana a GraphQL, porque las peticiones condicionales con `ETag` que devuelven 304 **no
consumen cuota primaria** y GraphQL no tiene ese mecanismo. Y como el
`stargazers_count` ya se conoce de la pasada de metadatos, solo hay que recrawlear los
repos cuyo contador se haya movido de forma apreciable. La primera vez se pagan las
10-14 horas; a partir de ahí, un porcentaje pequeño.

### Dónde va, en el backend

- `downloaders/StargazerDownloader.py` — el crawler reanudable, hermano de
  `RepoListDownloader` y `EmbeddingDownloader`.
- `var/stars/<owner@repo>.json` — caché, un fichero por repo con los identificadores
  hasheados. No hace falta guardar quién es cada usuario, solo la co-ocurrencia.
- `helpers/CoStarSimilarity.py` — matriz item-item normalizada, al lado de
  `RepoSimilarity`.
- `RepoSimilarity` **no hay que rediseñarlo**: ya fusiona rangos de N señales, y la
  ausencia de señal ya se maneja sola (los embeddings ya son opcionales). Añadir la
  tercera señal es añadir una lista más al bucle de fusión y su umbral.

### Trampas conocidas

1. **Sesgo de popularidad**: la co-ocurrencia cruda hace que todo se parezca a
   `freeCodeCamp`. Normalizar con coseno o Jaccard, y penalizar a los usuarios
   prolíficos con `1/log(sus estrellas)`. Es la lección del IDF otra vez.
2. **Sesgo de muestreo**: la API devuelve los stargazers de más antiguo a más nuevo.
   Los 200 primeros son early adopters — muestra sesgada, discutiblemente buena. Para
   audiencia actual hay que saltar a páginas aleatorias con la cabecera `Link`.
3. **Arranque en frío**: 16% de los repos tiene menos de 10 estrellas y 35% menos de
   100. Ahí el colaborativo no dice nada y el texto sí. No sustituye a lo que hay: es
   una tercera señal, dominante en la cabeza y ausente en la cola.

### En el frontend: ninguna sección nueva

Para quien mira la pantalla la pregunta es la misma ("¿qué se parece a esto?"). Dos
listas de parecidos para comparar es enseñar la implementación, no ayudar. Lo que
pasaría es que `airflow` empezaría a sacar `dagster` y nadie se enteraría de por qué.

Lo único que sí merece aparecer es **el motivo**, en la línea que ya se pinta debajo de
cada sugerencia: donde ahora pone "comparten #grep #rust", podría poner "también les
gusta a quienes usan airflow".

### Lo que sí sería una categoría nueva (fase 2)

El grafo de estrellas permite **descubrir comunidades**: conjuntos de repos que la misma
gente marca junta, sin que nadie los haya etiquetado.

- `/a-awesome/…` → lo que un **curador eligió** poner junto.
- `/a-topic/…` → lo que un **autor declaró** que era su repo.
- `/a-cluster/…` → lo que la **gente usa junto**, aunque nadie lo haya dicho.

El problema clásico de los clusters es que un grupo sin nombre no se puede presentar, y
la solución ya está en casa: `get_frecuent_topics()` los bautizaría con los topics más
frecuentes de sus miembros.

Primero la señal en la fusión y medir cuánto mejora `airflow`. Los clusters después.

---

## 6. LO SIGUIENTE: el embedding ya sabe la respuesta, pero está cortada

Medido el 2026-08-30, al desistir del punto 3. **`EMBEDDING_CANDIDATES = 20` es el cuello
de botella**, y explica tanto el caso `airflow` como que `the_silver_searcher` haya
desaparecido de `ripgrep`.

Puesto de cada buen vecino en la lista de embeddings de su origen:

| | puesto | coseno | pasa el umbral 0,65 | entra con el tope 20 |
|---|---|---|---|---|
| ripgrep → the_silver_searcher | 78 | 0,706 | sí | **no** |
| airflow → dagster | 273 | 0,679 | sí | **no** |
| airflow → prefect | 763 | 0,658 | sí | **no** |
| airflow → kestra | 1.789 | 0,641 | no | no |

O sea: **el embedding ya sabe que `dagster` se parece a `airflow`** —que es exactamente lo
que el grafo de estrellas iba a resolver— pero el corte a 20 lo mata antes de que llegue a
competir en la fusión. Con 25.000 repos, 20 candidatos es un corte pensado para un corpus
mucho más pequeño.

Y el suelo de corroboración los aguantaría:

| | vocabulario | sobrevive a `MIN_CORROBORATION_SCORE = 0.10` |
|---|---|---|
| airflow → dagster | 0,147 | **sí** |
| airflow → prefect | 0,203 | **sí** |
| ripgrep → the_silver_searcher | 0,064 | no (solo comparten `command-line-tool`) |

### Qué hacer

1. Subir `EMBEDDING_CANDIDATES` de 20 a unos 300 y medir sobre los repos testigo. El
   riesgo es admitir 300 candidatos por repo, la mayoría ruido: **el suelo de
   corroboración es justo lo que tiene que filtrarlos**, y por eso el orden importa —
   esto se mide *después* de tenerlo puesto, no antes.
2. Vigilar el coste: la pasada completa tarda hoy 3,8 min; con 15 veces más candidatos
   por repo hay que volver a medirla.
3. `the_silver_searcher` seguiría fuera. Bajar el suelo a 0,05 lo recupera pero deja
   entrar basura (medido: la media sube a 6,18 pero vuelven `svgcleaner` y `rag-rat`).
   Ese caso pide otra idea, no otro umbral.

**El diagnóstico del punto 3 sigue siendo cierto** —la mediana de 5 vecinos es poca cosa—
pero la salida no era una tercera señal: era dejar de estrangular la segunda.

---

## 4. Ideas descartadas, con el porqué (para no repetirlas)

### PageRank sobre el grafo de curación: NO

Medido el 2026-08-29 sobre las 83 listas (27.042 aristas lista→repo, 24.004 repos).
**Da peor resultado que contar.**

| PageRank, top 5 | contar en cuántas listas está |
|---|---|
| `lbonanomi/go` ★7 | `awesome-awesomeness` (12 listas) |
| `tony/claude-code-riper-5` ★92 | `tensorflow` ★193k (8) |
| `yfgeek/BlockVotes` ★282 | `apache/airflow` ★46k (7) |

Coincidencia entre los dos top-100: **5%**.

Por qué falla: el grafo es bipartito y de dos niveles (los repos no tienen aristas de
salida), así que sin recursión PageRank degenera en un grado de entrada ponderado por
`1/tamaño_de_la_lista`. En la web enlazar poco significa selectividad; aquí el tamaño de
una lista mide amplitud del tema, no criterio. Con listas de 0 a 3.259 entradas, estar
en una de 12 puntúa cien veces más que estar en `awesome-awesomeness`. Y la profundidad
que lo salvaría no existe: solo 149 de 27.042 aristas son lista→lista (0,55%).

**Pero el dato sí vale.** La pertenencia a listas mide criterio de curador y es
ortogonal a las estrellas:

- **Joyas**: 78 repos en 3 o más listas con menos de 3.000 estrellas — `m2cgen`
  (6 listas, ★2.944), `cossacklabs/themis` (6, ★1.945), `shell2http` (4, ★1.468).
- **Hype**: 190 repos con más de 40.000 estrellas en **una sola** lista — `freeCodeCamp`
  ★454k, `system-design-primer` ★348k.

Un simple "en cuántas listas está" se queda con el 95% del valor y es explicable al
usuario ("en 4 listas curadas"). Aviso: es señal **escasa**, el 90% de los repos
(21.577 de 24.004) aparece en exactamente una lista. Funciona como distintivo sobre la
minoría interesante, no como orden global.

### Nodos de vuelta en el grafo de parecidos: NO

Probado. Traen alcance (airflow es el vecino #7 de dagster en la vuelta, aunque en la
ida sea el #85) pero también ruido: `linenoise` pasaba a sugerir `lapce`, `eza` y
`websurfx` (un buscador web), y `age` empeoraba. Recall sin precisión no sirve.

### Detectar obra derivada mirando la descripción: NO

Probado y revertido el mismo día. Las buenas alternativas son justo las que se describen
contra el original ("a small self-contained alternative to readline"), así que echaba a
`replxx` y `Crossline` de `linenoise` y metía basura. **Solo se mira el nombre**: un
plugin se llama como lo que extiende, una alternativa no.

### Ordenar "hot" por estrellas/día: NO

En topics maduros daba prácticamente el mismo orden que Top, así que sobraba como
opción. Sustituido por la fórmula de Reddit, `log10(estrellas) − edad_en_años`, con la
penalización topada a tres años (sin tope, en `static-site-generator` un repo de 9
estrellas adelantaba a next.js y a hugo).

---

## 5. Estado actual y cómo regenerar

- Similitud: `RepoSimilarity` fusiona vocabulario (topics+descripción+lenguaje pesados
  por IDF) y embeddings (`nomic-embed-text` en el ollama local), más la popularidad con
  medio peso. Máximo 1 de las 5 plazas para obra derivada.
- La pasada completa de `create_related_repos()` tarda **3,9 minutos** (~160
  embeddings/s, no 15 como estimé al principio) y genera 25.189 ficheros, 26 MB.
- Ollama tiene que estar arrancado al lanzar la pasada mensual. Si no responde, la
  similitud sale solo con vocabulario, que es bastante peor: `age` no encuentra nada y
  `ripgrep` pierde `the_silver_searcher`.
- El límite de inotify quedó arreglado de forma persistente en
  `/etc/sysctl.d/90-inotify.conf` (524288 watches). Sin eso, `nuxt dev` no arranca:
  entre `dist/`, `public/topic` y `public/related` son ~85.000 ficheros.
- Cuidado: la opción `ignore` de `nuxt.config.ts` **no** vale para excluir del watcher,
  porque excluye esos JSON también del servidor y las páginas dejan de encontrar sus
  datos. Solo `vite.server.watch.ignored` y `nitro.watchOptions.ignored`.
