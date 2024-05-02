const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const { sequelize, Item, User } = require('./sequelizeConfig');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Sincronizar el modelo con la base de datos para crear la tabla si no existe
sequelize.sync();

// Middleware para manejar JSON
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'MiTienditaMX CRUD API',
      description: 'API para el CRUD de items y users',
      version: '0.9.7',
    },
  },
  apis: ['server.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Obtener todos los items existentes.
 *     description: Obtener todos los items
 *     responses:
 *       200:
 *         description: Retorna todos los items
 */
app.get('/items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los items' });
  }
});

/**
 * @swagger
 * /items/{item}:
 *   get:
 *     summary: Buscar items por nombre.
 *     description: Buscar items por su nombre por defecto.
 *     parameters:
 *       - in: path
 *         name: item
 *         schema:
 *           type: string
 *         description: Nombre por defecto del item a buscar.
 *         required: true
 *     responses:
 *       200:
 *         description: Retorna los items que coinciden con el nombre por defecto.
 *       400:
 *         description: Error en los datos enviados.
 *       500:
 *         description: Error interno del servidor.
 */
app.get('/items/:item', async (req, res) => {
    const { item } = req.params;
  
    try {
      const query = 'SELECT * FROM items WHERE defaultName LIKE ?';
      const values = [`%${item}%`];
  
      const [rows] = await pool.query(query, values);
      res.json(rows);
    } catch (error) {
      console.error('Error al buscar items:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});


/**
 * @swagger
 * /items:
 *   post:
 *     summary: Registrar un nuevo item.
 *     description: Registrar un nuevo item.
 *     parameters:
 *       - in: body
 *         name: item
 *         description: Datos del item a registrar
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             availableItems:
 *               type: integer
 *               description: Cantidad de items disponibles.
 *             brand:
 *               type: string
 *               description: Marca del item.
 *             defaultImageURL:
 *               type: string
 *               description: URL de la imagen por defecto del item.
 *             defaultName:
 *               type: string
 *               description: Nombre por defecto del item.
 *             price:
 *               type: number
 *               format: double
 *               description: Precio del item.
 *     responses:
 *       201:
 *         description: Item registrado correctamente.
 *       400:
 *         description: Error en los datos enviados.
 *       500:
 *         description: Error interno del servidor.
 */
app.post('/items', async (req, res) => {
    const { availableItems, brand, defaultImageURL, defaultName, price } = req.body;
  
    // Validar si se proporcionaron todos los campos necesarios
    if (!availableItems || !brand || !defaultImageURL || !defaultName || !price) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Insertar el nuevo item en la base de datos
      await pool.query('INSERT INTO items (availableItems, brand, defaultImageURL, defaultName, price) VALUES (?, ?, ?, ?, ?)', [availableItems, brand, defaultImageURL, defaultName, price]);
      
      console.log('Item registrado correctamente');
      res.status(201).json({ message: 'Item registrado correctamente' });
    } catch (error) {
      console.error('Error al registrar item:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Actualizar un item existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del item a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availableItems:
 *                 type: integer
 *                 description: Cantidad de items disponibles.
 *               brand:
 *                 type: string
 *                 description: Marca del item.
 *               defaultImageURL:
 *                 type: string
 *                 description: URL de la imagen por defecto del item.
 *               defaultName:
 *                 type: string
 *                 description: Nombre por defecto del item.
 *               price:
 *                 type: number
 *                 format: double
 *                 description: Precio del item.
 *     responses:
 *       200:
 *         description: Item actualizado correctamente.
 *       400:
 *         description: Error en los datos enviados.
 *       500:
 *         description: Error interno del servidor.
 */
app.put('/items/:id', async (req, res) => {
    const itemId = req.params.id;
    const { availableItems, brand, defaultImageURL, defaultName, price } = req.body;
  
    // Validar si se proporcionaron todos los campos necesarios
    if (!availableItems || !brand || !defaultImageURL || !defaultName || !price) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Actualizar el item en la base de datos
      await pool.query('UPDATE items SET availableItems = ?, brand = ?, defaultImageURL = ?, defaultName = ?, price = ? WHERE id = ?', [availableItems, brand, defaultImageURL, defaultName, price, itemId]);
      
      console.log('Item actualizado correctamente');
      res.status(200).json({ message: 'Item actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar item:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios existentes.
 *     description: Obtener todos los usuarios
 *     responses:
 *       200:
 *         description: Retorna todos los usuarios
 */
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

/**
 *  @swagger
 *  /users/{id}:
 *    get:
 *      summary: Obtener un usuario por su ID.
 *      description: Obtener un usuario específico por su ID.
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID del usuario a obtener.
 *          schema:
 *            type: integer
 *      responses:
 *        200:
 *          description: Retorna el usuario con el ID especificado.
 *        404:
 *          description: El usuario no existe.
 */

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Registrar un nuevo usuario.
 *     description: Registrar un nuevo usuario
 *     parameters:
 *       - in: body
 *         name: user
 *         description: Datos del usuario a registrar
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
  
    // Validar si se proporcionaron todos los campos necesarios
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insertar el nuevo usuario en la base de datos
      await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
      
      console.log('Usuario registrado correctamente');
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @swagger
 * /users/{id}/addresses:
 *   put:
 *     summary: Agregar una nueva dirección al usuario.
 *     description: Agregar una nueva dirección al usuario especificado por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario al que se le agregará la dirección.
 *         schema:
 *           type: integer
 *       - in: body
 *         name: address
 *         description: Dirección a agregar al usuario
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 *     responses:
 *       200:
 *         description: Dirección agregada correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
app.put('/users/:id/addresses', async (req, res) => {
    const userId = req.params.id;
    const { street, city, country } = req.body;
  
    // Validar si se proporcionaron todos los campos necesarios
    if (!street || !city || !country) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Obtener las direcciones actuales del usuario
      const [rows] = await pool.query('SELECT addresses FROM users WHERE id = ?', [userId]);
      if (!rows.length) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const currentAddresses = rows[0].addresses || [];
      const newAddress = { street, city, country };
      const updatedAddresses = [...currentAddresses, newAddress];
  
      // Actualizar las direcciones del usuario en la base de datos
      await pool.query('UPDATE users SET addresses = ? WHERE id = ?', [JSON.stringify(updatedAddresses), userId]);
      
      console.log('Dirección agregada correctamente');
      res.status(200).json({ message: 'Dirección agregada correctamente' });
    } catch (error) {
      console.error('Error al agregar dirección:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión de usuario.
 *     description: Verificar credenciales de usuario para iniciar sesión.
 *     parameters:
 *       - in: body
 *         name: user
 *         description: Credenciales de usuario para iniciar sesión.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       400:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error interno del servidor.
 */
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Validar si se proporcionaron email y password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios' });
    }
  
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }
  
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
          const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
          return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
      } else {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
