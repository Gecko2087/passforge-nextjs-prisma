# PassForge - Generador de Contraseñas

Una aplicación web moderna para generar, guardar y gestionar contraseñas de forma segura. Desarrollada como trabajo final para el curso de Next.js 15 y Prisma ORM.

🔗 **Demo en vivo:** [https://passforge-app.netlify.app](https://passforge-app.netlify.app)

## ¿Qué hace esta aplicación?

PassForge está diseñada para resolver el problema de gestionar múltiples contraseñas. Con esta herramienta puedes:

- **Generar contraseñas:** Personaliza la longitud y los grupos de caracteres. La aplicación exige al menos un grupo.
- **Organizar registros:** Guarda una clave generada con un título y una categoría opcional, como "Trabajo" o "Entretenimiento".
- **Copiar bajo demanda:** La lista carga metadatos; el valor se solicita cuando eliges copiarlo.
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

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript.
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

5.  **Cargar datos de prueba (Opcional, solo local):**
    ```bash
    npm run seed
    ```
    Esto crea una cuenta y categorías de ejemplo. El seed elimina y vuelve a crear esa cuenta al ejecutarse; no lo ejecutes sobre una base de datos compartida o de producción.

6.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso de la demo y límites

- En `/login`, elige **Entrar como usuario demo** para crear un espacio aislado sin registro. La sesión de demo vence en una hora.
- Usa contraseñas ficticias en la demo pública. Este proyecto educativo no ha pasado una auditoría de seguridad y no debe usarse para guardar credenciales reales.
- En la bóveda, el listado muestra títulos, categorías y opciones. El valor de una contraseña se pide al servidor al elegir **Copiar**.
- Las rutas de la aplicación y de la API requieren una sesión; revisa el código y la configuración antes de desplegar este proyecto.

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
