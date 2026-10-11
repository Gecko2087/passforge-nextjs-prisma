# Demo pública de PassForge

Desplegar únicamente contra una base PostgreSQL NUEVA con datos ficticios. No usar la bóveda histórica ni sus credenciales: el repositorio original publicaba un `.env` y contenía un cargador de código remoto.

## Variables del servidor

- `DATABASE_URL`: conexión PostgreSQL privada con pool; usar una cuenta dedicada a este esquema.
- `BETTER_AUTH_URL`: URL HTTPS exacta del despliegue.
- `BETTER_AUTH_SECRET`: secreto nuevo generado fuera del repositorio, al menos 32 bytes aleatorios.
- `ENCRYPTION_KEY`: clave nueva y exclusiva del servidor.
- `PASSFORGE_DEMO=true`: desactiva registro e inicio por contraseña; crea un visitante anónimo independiente.
- `NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_BETTER_AUTH_URL`: misma URL pública. Nunca incluir claves ni conexión DB en variables `NEXT_PUBLIC_*`.

Aplicar `npx prisma db push` una vez a la base NUEVA y vacía. No usar `--accept-data-loss` ni apuntar a la base histórica. El build es `npm run build`; no ejecutar el seed antiguo de cuenta demo compartida.

Cada visitante recibe una sesión de una hora, con un máximo de 200 consultas a recursos y un cupo global de 100 nuevos espacios por día. El vencimiento se comprueba en la base; una nueva sesión limpia visitantes caducados y sus registros mediante relaciones con borrado en cascada. El límite de autenticación usa almacenamiento en DB.

El cifrado es del lado del servidor y no es cifrado de extremo a extremo. La demo avisa que solo admite claves ficticias. No presentar esta aplicación de portfolio como un gestor auditado para contraseñas reales.

## Verificación

- `npm test`: regresiones de autorización, escritura explícita y generación criptográfica.
- `node tests/demo.integration.mjs`: genera una SQLite temporal, compila Next.js, inicia HTTP local y comprueba cookies reales, dos visitantes, persistencia cifrada, CRUD ajeno rechazado, origen ajeno, cupos y caducidad. Restaura el cliente PostgreSQL al terminar. Volver a ejecutar el build PostgreSQL antes de desplegar; este test produce una compilación para SQLite.

Las pruebas locales no sustituyen la comprobación de las URLs y PostgreSQL remotos. El plan gratuito tiene límites y no garantiza disponibilidad permanente.
