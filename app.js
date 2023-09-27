const express = require('express')
const url = require('url')
const ejs = require('ejs')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs/promises')
const storage = multer.memoryStorage() 
const upload = multer({ storage: storage })

const app = express()

// Configurar el motor de plantilles
app.set('view engine', 'ejs')

// Publicar arxius carpeta ‘public’ 
app.use(express.static('public'))

const port = 3001

// // Configurar direcció ‘/’ 
// app.get('/', getHello)
// async function getHello (req, res) {
// res.send(`Hello World`)
// }

// Activar el servidor
const httpServer = app.listen(port, appListen) 
function appListen () {
console.log(`Example app listening on: http://localhost:${port}`)
}

// Aturar el servidor correctament
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
console.log('Received kill signal, shutting down gracefully');
httpServer.close()
process.exit(0);
}



// Configurar direcció ‘/llistat’ i paràmetres URL 
app.get('/llistat', getLlistat)
async function getLlistat (req, res) {
 let query = url.parse(req.url, true).query;
  if (query.cerca && query.color) {
   res.send(`Aquí tens el llistat de ${query.cerca} de color ${query.color}`)
  } else {
   res.send('Paràmetres incorrectes')
  }
}



// Retornar una pàgina dinàmica de item
app.get('/item', getItem)
async function getItem (req, res) {
  let query = url.parse(req.url, true).query;
  try {
  // Llegir el fitxer JSON
  let dadesArxiu = await fs.readFile("./private/productes.json", { encoding: 'utf8'})
  console.log(dadesArxiu)
  let dades = JSON.parse(dadesArxiu)
  console.log(dades)
  // Buscar la nau per nom
  let infoProd = dades.find(nau => (nau.nom == query.nom))
  if (infoProd) {
  // Retornar la pàgina segons la nau trobada
  // Fa servir la plantilla 'sites/item.ejs'
  res.render('sites/item', { infoProd: infoProd })
  } else {
  res.send('Paràmetres incorrectes')
  }
  } catch (error) {
  console.error(error)
  res.send('Error al llegir el fitxer JSON')
  }
  }


  // Configurar direcció ‘/llistat’ i paràmetres URL
app.get('/search', getSearch)
async function getSearch (req, res) {
let query = url.parse(req.url, true).query;
let noms = []
if (query.country) {
// 'llista' conté un array amb les naus del país
llista = dades.filter(nau => (nau.pais == query.country))
// 'noms' conté un array amb els noms de les naus anteriors
noms = llista.map(nau => { return nau.nom })
res.render('sites/search', { llista: noms })
} else if (query.word) {
// 'llista' conté els noms de les naus que la descripció conté la paraula
llista = dades.filter(nau => ((nau.descripcio).toLowerCase().indexOf(query.word.toLocaleLowerCase()) != -1))
// 'noms' conté un array amb els noms de les naus anteriors ‘
noms = llista.map(nau => { return nau.nom })
res.render('sites/search', { llista: noms })
} else {
// 'noms' conté un array amb els noms de totes les naus ‘
noms = dades.map(nau => { return nau.nom })
res.render('sites/search', { llista: noms })
}
}



// Ruta d'Inici
app.get('/', (req, res) => {
    // Aquí pots enviar la pàgina d'inici o contingut d'inici
    res.render('sites/inici', );
});

// Ruta d'Afegir
app.get('/add', (req, res) => {
    // Aquí pots enviar la pàgina d'afegir o contingut d'afegir
    res.render('sites/add', { title: 'Afegir Producte' });
});

// Ruta de Modificar (amb un paràmetre d'URL id)
app.get('/edit', (req, res) => {
    const productId = req.query.id;
    // Aquí pots processar l'identificador productId i enviar la pàgina de modificació
    // o contingut de modificació basat en l'ID
    res.render('sites/edit', { title: 'Modificar Producte', productId });
});

// Ruta de Confirmació d'Esborrar (amb un paràmetre d'URL id)
app.get('/delete', (req, res) => {
    const productId = req.query.id;
    // Aquí pots processar l'identificador productId i enviar la pàgina de confirmació
    // d'esborrar o contingut de confirmació d'esborrar basat en l'ID
    res.render('sites/confirmation', { title: 'Confirmació d\'Esborrar', productId });
});

// Ruta d'Acció d'Esborrar (amb un paràmetre d'URL id)
app.get('/actionDelete', (req, res) => {
    const productId = req.query.id;
    // Aquí pots processar l'identificador productId i realitzar l'acció d'esborrar
    // Després, pots redirigir l'usuari a una altra pàgina com l'Inici o mostrar un missatge d'èxit
    // ...
});