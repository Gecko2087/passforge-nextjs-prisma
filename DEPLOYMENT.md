# Demo pública de PassForge

Desplegar únicamente contra una base PostgreSQL NUEVA con datos ficticios. No usar la bóveda histórica ni sus credenciales: el repositorio original publicaba un `.env` y contenía un cargador de código remoto.

## Variables del servidor

- `DATABASE_URL`: conexión PostgreSQL privada con pool para el rol dedicado `passforge_runtime`; incluir el parámetro `schema=passforge_demo` en la URL. No usar la cuenta administradora ni una clave de Supabase Data API.
- `BETTER_AUTH_URL`: URL HTTPS exacta del despliegue.
- `BETTER_AUTH_SECRET`: secreto nuevo generado fuera del repositorio, al menos 32 bytes aleatorios.
- `ENCRYPTION_KEY`: clave nueva y exclusiva del servidor.
- `PASSFORGE_DEMO=true`: desactiva registro e inicio por contraseña; crea un visitante anónimo independiente.
- `NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_BETTER_AUTH_URL`: misma URL pública. Nunca incluir claves ni conexión DB en variables `NEXT_PUBLIC_*`.

## Preparación aislada en Supabase

Los SQL están preparados, pero **todavía no se ejecutaron ni verificaron en PostgreSQL**. La creación de la credencial dedicada y la aplicación de las transacciones requieren intervención administradora. Véase la [secuencia de preparación y comprobación](db/README.md).

1. Con una cuenta administradora, ejecutar [el bootstrap SQL](db/demo-bootstrap.sql) **solo si `passforge_demo` aún no existe**. La transacción crea las nueve tablas de Prisma, revoca acceso a `PUBLIC`, `anon` y `authenticated`, y activa `ENABLE` + `FORCE ROW LEVEL SECURITY` sin políticas. Si el esquema ya existe, el script falla para exigir una revisión antes de modificarlo.
2. Crear fuera de este repositorio la credencial PostgreSQL de un rol `passforge_runtime` con `LOGIN`, sin `SUPERUSER`, `BYPASSRLS`, `CREATEDB`, `CREATEROLE` ni `REPLICATION`, sin membresía en otros roles y sin propiedad sobre las tablas. El administrador debe revisar también los permisos heredados de `PUBLIC` y restringir los permisos explícitos del rol al esquema `passforge_demo`. No introducir la contraseña en SQL, Git ni documentación.
3. Con la cuenta administradora, ejecutar [los permisos del rol](db/demo-runtime-access.sql). La segunda transacción comprueba atributos, membresías, propiedad y el estado RLS de las nueve tablas; concede solo `USAGE` del esquema y CRUD de tablas, y crea una política por tabla para ese rol. No crea el rol ni la contraseña.
4. Configurar el secreto `DATABASE_URL` de Vercel con esa credencial dedicada. Mantener `passforge_demo` fuera de los esquemas expuestos por Supabase Data API. El build es `npm run build`; no ejecutar `prisma db push` con el rol de aplicación ni el seed antiguo de cuenta demo compartida.

Las políticas del rol servidor permiten acceder a todas las filas de esas nueve tablas; **no** aíslan a visitantes entre sí. El aislamiento por visitante se aplica en la API de PassForge mediante la sesión y el `userId`. RLS y los permisos impiden el acceso directo de `anon`/`authenticated` y limitan qué rol puede consultar el esquema. Antes de añadir tablas o funciones nuevas, revisar de nuevo grants y RLS: las revocaciones de privilegios por defecto del esquema no sustituyen esa revisión.

Cada visitante recibe una sesión de una hora, con un máximo de 200 consultas a recursos y un cupo global de 100 nuevos espacios por día. El vencimiento se comprueba en la base; una nueva sesión limpia visitantes caducados y sus registros mediante relaciones con borrado en cascada. El límite de autenticación usa almacenamiento en DB.

El cifrado es del lado del servidor y no es cifrado de extremo a extremo. La demo avisa que solo admite claves ficticias. No presentar esta aplicación de portfolio como un gestor auditado para contraseñas reales.

## Verificación

- `npm test`: regresiones de autorización, escritura explícita y generación criptográfica.
- `node tests/demo.integration.mjs`: genera una SQLite temporal, compila Next.js, inicia HTTP local y comprueba cookies reales, dos visitantes, persistencia cifrada, CRUD ajeno rechazado, origen ajeno, cupos y caducidad. Restaura el cliente PostgreSQL al terminar. Volver a ejecutar el build PostgreSQL antes de desplegar; este test produce una compilación para SQLite.

Las pruebas locales no sustituyen la comprobación de las URLs y PostgreSQL remotos. El plan gratuito tiene límites, puede suspender recursos y no ofrece SLA para la demo.
