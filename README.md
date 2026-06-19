# UTP Marketplace - Backend

API REST para la plataforma de compra/venta de estudiantes de la UTP.

## ✅ Lo que ya está hecho

- Registro y login (solo correos `@utp.ac.pa`)
- Publicar productos con hasta 5 imágenes (sube a Cloudinary)
- Listar productos con filtro por categoría y búsqueda por texto
- Ver detalle de un producto (incluye WhatsApp del vendedor)
- Marcar producto como vendido / eliminarlo
- 8 categorías fijas: Libros, Calculadoras, Apuntes, Laptops, Monitores, Celulares, Electrónica, Otros
- Contraseñas encriptadas (bcrypt) y autenticación con JWT
- Límite de peticiones (rate limiting) para evitar abuso

## ⚠️ Antes de correr esto en tu máquina

### 1. Configura el acceso de red en Atlas (importante para producción)

Cuando despliegues a Render/Railway, esos servidores tienen IPs dinámicas.
Ve a Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
Sin esto, tu backend en producción NO podrá conectar a la base de datos.

### 2. Crea una cuenta gratis en Cloudinary

1. Ve a https://cloudinary.com/users/register/free
2. En el Dashboard copia: Cloud Name, API Key, API Secret
3. Pégalos en tu archivo `.env`:
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Instala dependencias y corre

```bash
npm install
npm run dev
```

El servidor corre en `http://localhost:5000`

## 📋 Endpoints disponibles

### Autenticación
| Método | Ruta | Descripción | Requiere login |
|---|---|---|---|
| POST | `/api/auth/register` | Registrarse (name, email, password, whatsapp) | No |
| POST | `/api/auth/login` | Iniciar sesión (email, password) | No |
| GET | `/api/auth/me` | Ver mi perfil | Sí |

### Productos
| Método | Ruta | Descripción | Requiere login |
|---|---|---|---|
| GET | `/api/products/categories` | Lista de las 8 categorías | No |
| GET | `/api/products?category=Libros&search=calculo&page=1` | Listar/buscar productos | No |
| GET | `/api/products/:id` | Detalle de un producto | No |
| GET | `/api/products/mine` | Mis productos publicados | Sí |
| POST | `/api/products` | Publicar producto (multipart/form-data con campo `images`) | Sí |
| PATCH | `/api/products/:id/status` | Marcar vendido/disponible | Sí |
| DELETE | `/api/products/:id` | Eliminar mi producto | Sí |

### Cómo enviar el token (rutas protegidas)
```
Authorization: Bearer <token_que_recibiste_en_login>
```

### Ejemplo: publicar producto desde el frontend (Vue)
```javascript
const formData = new FormData();
formData.append('title', 'Calculadora TI-84');
formData.append('description', 'En buen estado, poco uso');
formData.append('price', 25);
formData.append('category', 'Calculadoras');
formData.append('images', fileInput.files[0]); // puedes agregar hasta 5

await axios.post('http://localhost:5000/api/products', formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
});
```

### El botón de WhatsApp en el frontend
El endpoint de detalle de producto (`GET /api/products/:id`) devuelve `seller.whatsapp`.
En tu frontend Vue, el botón debe abrir un link así:
```javascript
const numeroLimpio = producto.seller.whatsapp.replace(/[^0-9]/g, '');
const mensaje = encodeURIComponent(`Hola, vi tu producto "${producto.title}" en UTP Marketplace, ¿sigue disponible?`);
const link = `https://wa.me/507${numeroLimpio}?text=${mensaje}`;
// 507 es el código de Panamá - ajusta si tus usuarios ya incluyen el código
```

## 🚀 Desplegar a producción (Render, gratis)

1. Sube este código a un repositorio de GitHub (el `.gitignore` ya excluye `.env`)
2. Ve a https://render.com → New → Web Service → conecta tu repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. En la pestaña **Environment**, agrega manualmente todas las variables que están en tu `.env` local (MONGODB_URI, JWT_SECRET, CLOUDINARY_*, FRONTEND_URL apuntando a tu dominio de Vue en producción)
6. Deploy

## 🔒 Notas de seguridad

- El JWT_SECRET en `.env` es un placeholder — cámbialo por una cadena larga y aleatoria antes de producción
- La contraseña de tu base de datos ya fue compartida en esta conversación; considera regenerarla en Atlas → Database Access antes de lanzar oficialmente
