# PassForge: preparación SQL pendiente

Estos archivos se prepararon y comprobaron **sin conexión a ninguna base**. No se creó ningún rol ni contraseña y no se aplicó SQL remoto.

1. Una cuenta administradora ejecuta [`demo-bootstrap.sql`](demo-bootstrap.sql) sobre la base `portfolio-demos` prevista, solo después de confirmar que `passforge_demo` no existe. El script es transaccional y crea exactamente las nueve tablas de [`prisma/schema.prisma`](../prisma/schema.prisma), con RLS forzado y acceso inicial denegado.
2. Un administrador crea por separado el rol PostgreSQL `passforge_runtime` con `LOGIN`, sin `SUPERUSER`, `BYPASSRLS`, `CREATEDB`, `CREATEROLE` ni `REPLICATION`, sin membresía en otros roles y sin propiedad sobre las tablas. Debe revisar los permisos heredados de `PUBLIC` y guardar la contraseña fuera del repositorio. La cuenta de Vercel usa ese rol, no la cuenta propietaria de las tablas.
3. La cuenta administradora ejecuta [`demo-runtime-access.sql`](demo-runtime-access.sql). Este segundo script también es transaccional; falla si el rol tiene atributos elevados, membresías, propiedad de tablas o falta cualquiera de los nueve controles RLS. Sus políticas conceden acceso a todas las filas solo al rol de servidor. El aislamiento entre visitantes lo implementa la aplicación.
4. Vercel usa la URL privada de ese rol con `schema=passforge_demo`. El esquema no debe añadirse a los esquemas expuestos por Supabase Data API. No ejecutar el seed histórico ni `prisma db push` con la cuenta de aplicación.

Esta preparación sigue pendiente de ejecución y verificación en PostgreSQL. RLS protege el acceso al esquema por rol; la política del rol servidor permite todas las filas, por lo que la separación de visitantes depende del control de sesión y `userId` de la aplicación. El plan gratuito puede suspender recursos o limitar disponibilidad y no tiene SLA para esta demo.

Después de la intervención administradora, se pueden comprobar las nueve tablas y sus políticas con una consulta de solo lectura:

```sql
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
       EXISTS (
         SELECT 1 FROM pg_policy AS p
         JOIN pg_roles AS r ON r.oid = ANY (p.polroles)
         WHERE p.polrelid = c.oid AND r.rolname = 'passforge_runtime'
       ) AS runtime_policy
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'passforge_demo' AND c.relkind = 'r'
ORDER BY c.relname;
```

El resultado esperado después de **ambos** scripts son nueve filas, `rls_enabled`, `rls_forced` y `runtime_policy` en `true`, y ambas columnas de acceso API en `false`. Además, `has_schema_privilege('anon', 'passforge_demo', 'USAGE')` y la misma comprobación para `authenticated` deben ser `false`.

La cuenta administradora puede verificar por separado que el rol no recibió atributos elevados ni membresías:

```sql
SELECT r.rolcanlogin AS login_enabled,
       NOT (r.rolsuper OR r.rolbypassrls OR r.rolcreatedb
            OR r.rolcreaterole OR r.rolreplication) AS no_elevated_attributes,
       NOT EXISTS (SELECT 1 FROM pg_auth_members AS m WHERE m.member = r.oid) AS no_memberships
FROM pg_roles AS r
WHERE r.rolname = 'passforge_runtime';
```

Las tres columnas deben ser `true`. Esto no sustituye una revisión de otros grants explícitos o heredados de `PUBLIC` fuera de `passforge_demo`.
