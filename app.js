const express = require('express')
const url = require('url')
const ejs = require('ejs')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs/promises')
const storage = multer.memoryStorage() 
const upload = multer({ storage: storage })

const app = express()

const port = 3000

// Configurar direcció ‘/’ 
app.get('/', getHello)
async function getHello (req, res) {
res.send(`Hello World`)
}

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