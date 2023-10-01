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

/*       Ruta d'Inici     */

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

/*            Ruta d'Afegir    */

app.get('/add', (req, res) => {
    // Aquí pots enviar la pàgina d'afegir o contingut d'afegir
    res.render('sites/add',);
});

app.post('/ActionAdd', upload.array('files'), add)
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
      // Processar fitxers
      if (req.files.length > 0) { objPost.files = [] }
      req.files.forEach(file => {
        objPost.files.push({
          name: file.originalname,
          content: file.buffer
        })
      })
      // Processar altres camps del formulari
      for (let key in req.body) {
        let value = req.body[key]
        if (!isNaN(value)) { // Comprovar si és un número
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


/*    Ruta de Modificar (amb un paràmetre d'URL id)    */
app.get('/edit', getedit)

async function getedit(req, res) {
    let query = url.parse(req.url, true).query;
    try {
      // Llegir el fitxer JSON
      let dadesArxiu = await fs.readFile("./private/productes.json", { encoding: 'utf8' })
      console.log(dadesArxiu)
      let dades = JSON.parse(dadesArxiu)
      console.log(dades)
      // Buscar la nau per nom
      let infoProduct = dades.find(nau => (nau.id == query.id))
      if (infoProduct) {
        // Retornar la pàgina segons la nau trobada
        // Fa servir la plantilla 'sites/item.ejs'
        res.render('sites/edit', { infoProduct: infoProduct })
      } else {
        res.send('Paràmetres incorrectes')
      }
    } catch (error) {
      console.error(error)
      res.send('Error al llegir el fitxer JSON')
    }
}

// Ruta d'Acció d'Esborrar (amb un paràmetre d'URL id)
app.post('/actionEdit', (req, res) => {
    const productId = req.query.id;
    // Aquí pots processar l'identificador productId i realitzar l'acció d'esborrar
    // Després, pots redirigir l'usuari a una altra pàgina com l'Inici o mostrar un missatge d'èxit
    // ...
});

// Ruta de Confirmación de Borrar (con un parámetro de URL id)
app.get('/delete', (req, res) => {
  const productId = req.query.id;
  // Renderizar la página de confirmación de borrado
  // Usa la plantilla 'sites/confirmation.ejs'
  res.render('sites/delete', { title: 'Confirmació d\'Esborrar', productId });
});

// Ruta de Acción de Borrar (con un parámetro de URL id)
app.post('/actionDelete', async (req, res) => {
  const productId = req.query.id;
  try {
    // Leer el archivo JSON
    let dadesArxiu = await fs.readFile('./private/productes.json', { encoding: 'utf8' });
    let dades = JSON.parse(dadesArxiu);

    // Encontrar el índice del producto por ID
    let infoProductIndex = dades.findIndex(producto => producto.id === productId);

    if (infoProductIndex !== -1) {
      // Obtener el nombre del archivo antiguo para borrarlo
      const nombreArchivoAntiguo = dades[infoProductIndex].imatge;

      // Eliminar el producto del array
      dades.splice(infoProductIndex, 1);

      // Escribir los datos actualizados en el archivo JSON
      await fs.writeFile('./private/productes.json', JSON.stringify(dades, null, 2));

      // Borrar el archivo antiguo si existe
      if (nombreArchivoAntiguo) {
        const rutaArchivoAntiguo = path.join('./private', nombreArchivoAntiguo);
        await fs.unlink(rutaArchivoAntiguo);
      }

      // Redirigir al usuario a la página de inicio
      res.redirect('/');
    } else {
      res.send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.send('Error al leer/escribir el archivo JSON o al borrar el archivo antiguo');
  }
});