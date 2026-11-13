# Mini-Frontend REST API — Manager de Produse
URL API utilizat: `https://jsonplaceholder.typicode.com/posts`
Rezolvarea CORS (API Public): Serverul JSONPlaceholder trimite header-ul HTTP `Access-Control-Allow-Origin: *`, permitand cereri `fetch` direct din GitHub Pages
Status 200 OK (GET): Parsam raspunsul JSON, normalizam campurile si randam produsele în DOM cu `createElement` si `textContent` (sau afisam starea „lista goala" pentru `[]`).
Status 201 Created (POST): Trimitem datele din `FormData` ca JSON (`Content-Type: application/json`), iar la confirmarea `201` inseram produsul direct in lista (`prepend`) fara re-fetch.
Status 200 OK (DELETE): Folosim delegarea evenimentelor pe `<ul id="products-list">`, apelam `DELETE /posts/:id` si eliminam produsul din DOM la confirmare.
Status 4xx (Client Error): Verificam `!response.ok`, extragem mesajul de eroare returnat de server și il afisam utilizatorului langa formular (`#form-feedback`).
Status 5xx (Server Error): Detectat prin `!response.ok`; afisam codul de status si informam utilizatorul ca serverul intampina o problema tehnica.
Erori de retea (Offline / DNS / CORS blocat): Capturate in blocul `catch (error)` si tratate printr-un mesaj in interfata, plus design responsive validat la 360px.