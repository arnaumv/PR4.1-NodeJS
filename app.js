const express = require('express');
const url = require('url');
const ejs = require('ejs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

const port = 3000;

// Configurar direcció ‘/’ 
app.get('/', getHello);
function getHello(req, res) {
    res.send(`Hello World`);
}

// ...

// Configurar direcció ‘/llistat’ i paràmetres URL 
app.get('/llistat', getLlistat);
function getLlistat(req, res) {
    let query = url.parse(req.url, true).query;
    if (query.cerca && query.color) {
        res.send(`Aquí tens el llistat de ${query.cerca} de color ${query.color}`);
    } else {
        res.send('Paràmetres incorrectes');
    }
}

// ...

// Configurar direcció ‘/item’ i paràmetres URL 
app.get('/item', getItem);
function getItem(req, res) {
    let query = url.parse(req.url, true).query;
    try {
        // Llegir el fitxer JSON
        let dadesArxiu = await fs.readFile("./private/productes.json", { encoding: 'utf8' });
        console.log(dadesArxiu);
        let dades = JSON.parse(dadesArxiu);
        console.log(dades);
        // Buscar la nau per nom
        let infoProd = dades.find(nau => (nau.nom == query.nom));
        if (infoProd) {
            // Retornar la pàgina segons la nau trobada
            // Fa servir la plantilla 'sites/item.ejs'
            res.render('sites/item', { infoProd: infoProd });
        } else {
            res.send('Paràmetres incorrectes');
        }
    } catch (error) {
        console.error(error);
        res.send('Error al llegir el fitxer JSON');
    }
}

// Afegir ruta per a Afegir
app.get('/add', getAdd);
function getAdd(req, res) {
    // Aquí pots enviar una pàgina HTML per afegir productes amb enllaços al teu estil CSS
    res.render('sites/add', { title: 'Afegir Producte' });
}

// Afegir ruta per a Modificar
app.get('/edit', getEdit);
function getEdit(req, res) {
    let query = url.parse(req.url, true).query;
    // Processar l'identificador productId i enviar una pàgina HTML de modificació amb enllaços al teu estil CSS
    // ...
}

// Afegir ruta per a Confirmació d'Esborrar
app.get('/delete', getConfirmation);
function getConfirmation(req, res) {
    let query = url.parse(req.url, true).query;
    // Processar l'identificador productId i enviar una pàgina HTML de confirmació d'esborrar amb enllaços al teu estil CSS
    // ...
}

// Afegir ruta per a Acció d'Esborrar
app.get('/actionDelete', performDelete);
function performDelete(req, res) {
    let query = url.parse(req.url, true).query;
    // Processar l'identificador productId i realitzar l'acció d'esborrar
    // Després, pots redirigir l'usuari a una altra pàgina com l'Inici o mostrar un missatge d'èxit
    // ...
}

// ...

// Activar el servidor
const httpServer = app.listen(port, appListen);
function appListen() {
    console.log(`Example app listening on: http://localhost:${port}`);
}

// Aturar el servidor correctament
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    httpServer.close();
    process.exit(0);
}
