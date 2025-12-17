# PassForge - Generador de Contraseñas

Una aplicación web moderna para generar, guardar y gestionar contraseñas de forma segura. Desarrollada como trabajo final para el curso de Next.js 15 y Prisma ORM.

🔗 **Demo en vivo:** [https://passforge-app.netlify.app](https://passforge-app.netlify.app)

## ¿Qué hace esta aplicación?

PassForge está diseñada para resolver el problema de gestionar múltiples contraseñas. Con esta herramienta puedes:

- **Generar contraseñas robustas:** Personaliza la longitud y los caracteres (mayúsculas, números, símbolos) para crear claves imposibles de adivinar.
- **Guardar de forma segura:** Tus contraseñas se almacenan encriptadas en la base de datos, por lo que solo tú puedes verlas.
- **Organizar tu vida digital:** Clasifica tus cuentas en categorías como "Trabajo", "Redes Sociales" o "Entretenimiento".
- **Acceso universal:** Al ser una web app, puedes entrar desde tu computadora o celular.

## Capturas de Pantalla

Aquí puedes ver cómo luce la aplicación:

<div align="center">
  <img src="/public/screenshots/dashboard.png" alt="Dashboard Generador" width="800"/>
  <p><em>Dashboard principal con generador de contraseñas y opciones de configuración</em></p>
</div>

<div align="center">
  <img src="/public/screenshots/categories.png" alt="Categorías" width="800"/>
  <p><em>Gestión de categorías para organizar tus cuentas</em></p>
</div>

<div align="center">
  <img src="/public/screenshots/login.png" alt="Login" width="400"/>
  <p><em>Pantalla de inicio de sesión segura y moderna</em></p>
</div>

> *Nota: Las capturas muestran el diseño responsive y el tema oscuro/claro.*

## Tecnologías Utilizadas

He utilizado un stack moderno para asegurar rendimiento y escalabilidad:

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Estilos**: Tailwind CSS v4 para el diseño y shadcn/ui para componentes accesibles.
- **Backend**: Next.js API Routes para la lógica del servidor.
- **Base de Datos**: PostgreSQL alojada en Supabase, gestionada con Prisma ORM.
- **Autenticación**: Better Auth para un manejo seguro de sesiones.
- **Iconos**: Lucide React.

## Estructura de la Base de Datos

El proyecto utiliza 6 modelos principales definidos en Prisma:

| Modelo | Descripción |
|--------|-------------|
| `User` | Almacena la información de los usuarios registrados. |
| `Session` | Gestiona las sesiones activas de los usuarios. |
| `Account` | Vincula cuentas de proveedores externos (si se implementaran en el futuro). |
| `Verification` | Maneja tokens para verificar emails o recuperar contraseñas. |
| `Category` | Permite a los usuarios crear etiquetas para organizar sus claves. |
| `Password` | Guarda las contraseñas encriptadas y vinculadas a un usuario y categoría. |

**Relaciones clave**:
- Un **Usuario** puede tener muchas **Contraseñas** y **Categorías**.
- Una **Categoría** puede agrupar muchas **Contraseñas**.

## Documentación de la API

La aplicación expone varios endpoints RESTful protegidos:

### Autenticación (`/api/auth/*`)
Manejado por Better Auth. Incluye registro, inicio de sesión, cierre de sesión y gestión de sesiones.

### Categorías (`/api/categories`)
- `GET /api/categories`: Obtiene todas las categorías del usuario actual.
- `POST /api/categories`: Crea una nueva categoría.
  - **Body**: `{ name: string, color: string, description?: string }`
- `GET /api/categories/[id]`: Obtiene una categoría específica.
- `PUT /api/categories/[id]`: Actualiza una categoría.
- `DELETE /api/categories/[id]`: Elimina una categoría.

### Contraseñas (`/api/passwords`)
- `GET /api/passwords`: Lista todas las contraseñas del usuario. Soporta filtrado por categoría `?categoryId=...`.
- `POST /api/passwords`: Guarda una nueva contraseña encriptada.
  - **Body**: `{ title: string, password: string, categoryId?: string, ...config }`
- `GET /api/passwords/[id]`: Obtiene una contraseña desencriptada (solo el dueño).
- `PUT /api/passwords/[id]`: Actualiza una contraseña existente.
- `DELETE /api/passwords/[id]`: Elimina una contraseña.

## Instalación y Configuración Local

Si quieres correr este proyecto en tu máquina, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/password-generator.git
    cd password-generator
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz y completa con tus datos (puedes usar `.env.example` como guía):
    ```env
    DATABASE_URL="postgresql://..."
    DIRECT_URL="postgresql://..."
    ENCRYPTION_KEY="tu-clave-secreta-de-32-caracteres"
    BETTER_AUTH_SECRET="otro-secreto-largo"
    BETTER_AUTH_URL="http://localhost:3000"
    ```

4.  **Preparar la base de datos:**
    ```bash
    npx prisma db push
    npx prisma generate
    ```

5.  **Cargar datos de prueba (Opcional):**
    ```bash
    npm run seed
    ```
    Esto creará un usuario demo (`demo@passforge.com` / `Demo123!`) con categorías listas para usar.

6.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Protección y Seguridad

- **Rutas Frontend**: Un Middleware protege las rutas privadas, redirigiendo al login si no hay sesión activa.
- **API Backend**: Cada endpoint verifica el token de sesión antes de procesar cualquier solicitud, asegurando que los usuarios solo accedan a sus propios datos.
- **Encriptación**: Las contraseñas se encriptan usando AES-256-GCM antes de guardarse en la base de datos.

## Despliegue

El proyecto está optimizado para desplegarse en **Netlify** o **Vercel**.
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

Recuerda configurar las mismas variables de entorno en tu panel de hosting.

## Autor

**Lucas**
Trabajo Práctico Final - Curso Next.js + Prisma ORM

## Licencia

Este proyecto está bajo la licencia MIT. Siéntete libre de usarlo y aprender de él.
