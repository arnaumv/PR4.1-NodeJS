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
function appListen() {
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






// Ruta d'Inici
app.get('/', getInici)

async function getInici(req, res) {
    let query = url.parse(req.url, true).query;
    let datos = [];

    try {
        // Leer el archivo JSON
        let dadesArxiu = await fs.readFile("./private/productes.json", { encoding: 'utf8' });
        let dades = JSON.parse(dadesArxiu);


        // Si no se especifica un país o una palabra clave, obtén todos los datos
        datos = dades;


        // Mapear los datos para obtener solo los campos 'id', 'nom' e 'imatge'
        const resultados = datos.map(producto => {
            return {
                id: producto.id,
                nom: producto.nom,
                imatge: producto.imatge
            };
        });

        res.render('sites/inici', { llista: resultados });
    } catch (error) {
        console.error(error);
        res.send('Error al leer el archivo JSON');
    }
}










// Ruta d'Afegir
app.get('/add', (req, res) => {
    // Aquí pots enviar la pàgina d'afegir o contingut d'afegir
    res.render('sites/add',);
});

app.post('/add', upload.array('files'), add)
async function add(req, res) {
    let arxiu = "./private/productes.json"
    let postData = await getPostObject(req)
    try {
        // Llegir el fitxer JSON
        let dadesArxiu = await fs.readFile(arxiu, { encoding: 'utf8' })
        let dades = JSON.parse(dadesArxiu)

        // Determine the next ID
        let nextId = 1; // Initialize with 1 if there are no existing items
        if (dades.length > 0) {
            const lastItem = dades[dades.length - 1];
            nextId = lastItem.id + 1;
        }

        // Add the "id" field to postData
        postData.id = nextId;

        // Guardem la imatge a la carpeta 'public' amb un nom únic
        if (postData.files && postData.files.length > 0) {
            let fileObj = postData.files[0];
            const uniqueID = uuidv4()
            const fileExtension = fileObj.name.split('.').pop()
            let filePath = `${uniqueID}.${fileExtension}`
            await fs.writeFile('./public/images/' + filePath, fileObj.content);
            // Guardem el nom de l'arxiu a la propietat 'imatge' de l'objecte
            postData.imatge = 'images/' + filePath;
            // Eliminem el camp 'files' perquè no es guardi al JSON
            delete postData.files;
        }
        
        dades.push(postData) // Afegim el nou objecte (que ja té el nou nom d’imatge)
        let textDades = JSON.stringify(dades, null, 4) // Ho transformem a cadena de text (per guardar-ho en un arxiu)
        await fs.writeFile(arxiu, textDades, { encoding: 'utf8' }) // Guardem la informació a l’arxiu
        //res.send(`S'han afegit les dades ${textDades}`)
        res.redirect('/'); // Redirigimos a la página de inicio
    } catch (error) {
        console.error(error)
        res.send('Error al afegir les dades')
    }
}

async function getPostObject(req) {
    return new Promise(async (resolve, reject) => {
      let objPost = {};
      // Process files
      if (req.files.length > 0) { objPost.files = [] }
      req.files.forEach(file => {
        objPost.files.push({
          name: file.originalname,
          content: file.buffer
        })
      })
      // Process other form fields
      for (let key in req.body) {
        let value = req.body[key]
        if (!isNaN(value)) { // Check if is a number (example: "2ABC" is not a 2)
          let valueInt = parseInt(value)
          let valueFlt = parseFloat(value)
          if (valueInt && valueFlt) {
            if (valueInt == valueFlt) objPost[key] = valueInt
            else objPost[key] = valueFlt
          }
        } else {
          objPost[key] = value
        }
      }
      resolve(objPost)
    })
  }


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