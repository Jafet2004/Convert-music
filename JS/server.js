const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// Conexión a MySQL
const conexion = mysql.createConnection({
    host: "127.0.0.1",
    database: "Convert_music",
    user: "root",
    password: "Jy221104"
});

conexion.connect((err) => {
    if (err) {
        console.error("Error de conexión a la base de datos:", err.message);
        process.exit(1);
    } else {
        console.log("Conexión exitosa a la base de datos");
    }
});

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // GET: Servir archivos estáticos
    if (req.method === 'GET') {
        let safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
        let filePath = path.join(__dirname, safePath === '/' ? 'login.html' : safePath);

        if (path.extname(filePath) === '') {
            filePath += '.html';
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/html' });
                res.end(`<h1>${err.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error'}</h1><p>${err.message}</p>`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });

        return;
    }

    // POST: LOGIN
    if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { user_name, pass } = JSON.parse(body);

                if (!user_name || !pass) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Datos incompletos' }));
                    return;
                }

                const query = 'SELECT * FROM usuarios WHERE user_name = ? AND pass = ?';
                conexion.query(query, [user_name, pass], (err, results) => {
                    if (err) {
                        console.error("Error en la consulta:", err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Error del servidor' }));
                        return;
                    }

                    if (results.length > 0) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: 'Login exitoso',
                            redirect: 'index.html',
                            user: results[0]
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Usuario o contraseña incorrectos' }));
                    }
                });
            } catch (err) {
                console.error("Error al procesar el JSON:", err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Formato de datos inválido' }));
            }
        });

        return;
    }

    // POST: REGISTRO - Versión mejorada
    if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                console.log('Body recibido:', body); // ← Ver el body crudo
                const userData = JSON.parse(body);
                console.log('Datos parseados:', userData); // ← Ver datos parseados

                // Validación mejorada
                const requiredFields = {
                    'primer_nombre': 'Primer nombre',
                    'primer_apellido': 'Primer apellido',
                    'correo_electronico': 'Correo electrónico',
                    'user_name': 'Nombre de usuario',
                    'pass': 'Contraseña'
                };

                const missingFields = Object.keys(requiredFields)
                    .filter(field => !userData[field] || userData[field].trim() === '');

                if (missingFields.length > 0) {
                    const missingFieldsNames = missingFields.map(field => requiredFields[field]);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ 
                        success: false, 
                        message: `Faltan campos requeridos: ${missingFieldsNames.join(', ')}`,
                        missingFields: missingFields
                    }));
                }

                // Insertar en MySQL con manejo de errores mejorado
                const query = `
                    INSERT INTO usuarios 
                    (primer_nombre, primer_apellido, correo_electronico, user_name, pass, pais, ciudad)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                conexion.query(query, [
                    userData.primer_nombre,
                    userData.primer_apellido,
                    userData.correo_electronico,
                    userData.user_name,
                    userData.pass,
                    userData.pais || null,
                    userData.ciudad || null
                ], (err, result) => {
                    if (err) {
                        console.error('Error en MySQL:', err);
                        let errorMessage = 'Error al registrar usuario';
                        if (err.code === 'ER_DUP_ENTRY') {
                            if (err.message.includes('correo_electronico')) {
                                errorMessage = 'El correo electrónico ya está registrado';
                            } else if (err.message.includes('user_name')) {
                                errorMessage = 'El nombre de usuario ya está en uso';
                            }
                        }
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ 
                            success: false, 
                            message: errorMessage,
                            mysqlError: err.message
                        }));
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Usuario registrado exitosamente',
                        userId: result.insertId
                    }));
                });

            } catch (err) {
                console.error('Error al procesar el registro:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Error en el formato de los datos',
                    errorDetails: err.message
                }));
            }
        });
        return;
    }

    // Ruta no encontrada
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Ruta no encontrada');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor accediendo en http://localhost:${PORT}`);
});