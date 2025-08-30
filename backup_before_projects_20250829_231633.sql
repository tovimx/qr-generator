--
-- PostgreSQL database dump
--

\restrict o8bRZfe3LWFGfkO9XnfON398XWoydfFTZgrTtyYiZycUxsbLkLtSgQ0ZkYnFQee

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id text NOT NULL,
    "ownerUserId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: domains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domains (
    id text NOT NULL,
    "clientId" text NOT NULL,
    hostname text NOT NULL,
    type text DEFAULT 'custom'::text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "primary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.domains OWNER TO postgres;

--
-- Name: links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.links (
    id text NOT NULL,
    "qrCodeId" text NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    "position" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.links OWNER TO postgres;

--
-- Name: qr_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_codes (
    id text NOT NULL,
    "userId" text NOT NULL,
    "shortCode" text NOT NULL,
    title text DEFAULT 'My QR Code'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "redirectType" text DEFAULT 'links'::text NOT NULL,
    "redirectUrl" text,
    "logoSize" integer DEFAULT 30 NOT NULL,
    "logoUrl" text,
    "cornerRadius" integer DEFAULT 0 NOT NULL,
    "fgColor" text DEFAULT '#000000'::text NOT NULL,
    "logoShape" text DEFAULT 'square'::text NOT NULL,
    "clientId" text,
    "domainId" text,
    "position" integer DEFAULT 0 NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.qr_codes OWNER TO postgres;

--
-- Name: scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scans (
    id text NOT NULL,
    "qrCodeId" text NOT NULL,
    "userAgent" text,
    "ipHash" text,
    referer text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.scans OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	88c1d26e-efc8-42fc-b8ca-e5f88edb3d54	{"action":"user_confirmation_requested","actor_id":"65e83c5a-5960-4273-b500-3aee66a670c2","actor_username":"admin@admin.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-02 00:41:11.073971+00	
00000000-0000-0000-0000-000000000000	442c5331-62cb-44e7-a57e-abf0f1d11d04	{"action":"user_signedup","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 00:45:23.056022+00	
00000000-0000-0000-0000-000000000000	176b8c40-2b69-4efc-abd4-fbed9c77a8c7	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 00:45:23.068041+00	
00000000-0000-0000-0000-000000000000	600700d7-5183-4587-971b-abf4d2af81a7	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 01:49:55.576982+00	
00000000-0000-0000-0000-000000000000	b4a777bb-1e72-4af5-9958-09f08d57b588	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 01:49:55.597214+00	
00000000-0000-0000-0000-000000000000	b964135e-9707-4d29-a3b9-eec58b2a63b0	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 02:58:21.462015+00	
00000000-0000-0000-0000-000000000000	af04e655-7210-417f-bbea-c158a0138122	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 03:07:51.356419+00	
00000000-0000-0000-0000-000000000000	912e0edb-36b3-48cc-b099-3ced2979058f	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 03:07:51.367598+00	
00000000-0000-0000-0000-000000000000	ce158414-ef10-4942-b9b1-4c68c914fb1d	{"action":"user_signedup","actor_id":"430c3546-d737-4e22-8afc-4db735cc40de","actor_username":"test-1754104522473@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 03:15:23.510305+00	
00000000-0000-0000-0000-000000000000	21536ac5-47d3-44f2-bcb3-1b8c0a72dfea	{"action":"login","actor_id":"430c3546-d737-4e22-8afc-4db735cc40de","actor_username":"test-1754104522473@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 03:15:23.524033+00	
00000000-0000-0000-0000-000000000000	259e8142-bb19-46fc-81a1-ebde6349b8dc	{"action":"user_signedup","actor_id":"ae0e0aef-ee11-4eb4-98de-7b63bae0c664","actor_username":"test-1754104726106@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 03:18:46.976231+00	
00000000-0000-0000-0000-000000000000	9ab04ff6-67a2-4ac0-964e-cada898bc2d4	{"action":"login","actor_id":"ae0e0aef-ee11-4eb4-98de-7b63bae0c664","actor_username":"test-1754104726106@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 03:18:46.980852+00	
00000000-0000-0000-0000-000000000000	0b25034b-1a1b-427d-a49b-e3a5fef423e3	{"action":"user_signedup","actor_id":"726d7571-2f28-4a38-add9-cd39a02ad69a","actor_username":"test-1754104726540@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 03:18:47.310773+00	
00000000-0000-0000-0000-000000000000	c9702ba4-840a-40e0-b58b-52477856299b	{"action":"login","actor_id":"726d7571-2f28-4a38-add9-cd39a02ad69a","actor_username":"test-1754104726540@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 03:18:47.314017+00	
00000000-0000-0000-0000-000000000000	0a1cc9f8-1b26-4377-80d2-ea59d9fbd307	{"action":"user_signedup","actor_id":"c1118846-4d41-47ec-95e1-f1678476e150","actor_username":"test-1754104728632@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-02 03:18:49.321858+00	
00000000-0000-0000-0000-000000000000	1ef0a14d-db31-4376-a4e6-a801f2a7b8c4	{"action":"login","actor_id":"c1118846-4d41-47ec-95e1-f1678476e150","actor_username":"test-1754104728632@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-02 03:18:49.325034+00	
00000000-0000-0000-0000-000000000000	ad15c5ed-b68c-4edb-9b84-c4c53e72d663	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 05:57:22.164279+00	
00000000-0000-0000-0000-000000000000	f54c8b51-6daa-443c-bbf7-2e0c7644f892	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-02 05:57:22.177745+00	
00000000-0000-0000-0000-000000000000	8cb8b431-178c-4766-8097-8db705ce149b	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 19:40:43.182764+00	
00000000-0000-0000-0000-000000000000	c3400060-f776-4cda-aa71-2a607b47e381	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 19:40:43.207906+00	
00000000-0000-0000-0000-000000000000	fc5da593-2fa5-4130-97e5-53c10f6bd57f	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:45:02.293988+00	
00000000-0000-0000-0000-000000000000	91a7c629-8e30-4abc-86f9-c338e83da1a4	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:45:02.312525+00	
00000000-0000-0000-0000-000000000000	2ce7125f-3660-4563-9513-d6080210d708	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:45:06.622801+00	
00000000-0000-0000-0000-000000000000	46974616-4729-4d84-b820-088a60833fc0	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:45:06.623506+00	
00000000-0000-0000-0000-000000000000	6332f0f8-cdee-464d-bc8f-210a5cb73914	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-03 23:45:06.666723+00	
00000000-0000-0000-0000-000000000000	21a3395c-1b83-4fcf-8cc4-7cc599284c37	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 00:45:36.516621+00	
00000000-0000-0000-0000-000000000000	5e2f1bda-4dbd-4feb-9244-360eeab4a031	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 00:45:36.523652+00	
00000000-0000-0000-0000-000000000000	ad1240fc-8a70-4069-9261-5efe2e21a417	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 01:44:04.032025+00	
00000000-0000-0000-0000-000000000000	89f8a20b-9af1-42e2-a743-be61c21f72d3	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 01:44:04.03836+00	
00000000-0000-0000-0000-000000000000	5d728bb5-9d99-41e3-b83b-26f7fd830b91	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 01:47:17.21554+00	
00000000-0000-0000-0000-000000000000	e9b5ed47-481b-46a4-b7ad-56303d6b117d	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 01:47:17.216457+00	
00000000-0000-0000-0000-000000000000	e70c48bd-2e41-4eb9-a359-19203603648f	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 18:41:35.079718+00	
00000000-0000-0000-0000-000000000000	b49aa12d-9e6d-4a53-8b21-0529c9c22761	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 18:41:35.105973+00	
00000000-0000-0000-0000-000000000000	fd172509-b56e-4d86-8ef3-7b0d26d80dc6	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 18:41:56.644992+00	
00000000-0000-0000-0000-000000000000	638b49c7-cd07-4c38-8280-b61d9cf04d55	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 18:41:56.64757+00	
00000000-0000-0000-0000-000000000000	58118d95-8ccd-4880-b744-b8d73ce38448	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-04 18:42:10.893649+00	
00000000-0000-0000-0000-000000000000	dd13ef41-7501-4915-aaaa-0b47134197f1	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 21:55:26.749012+00	
00000000-0000-0000-0000-000000000000	30a73cc9-fe7c-4764-bcd0-7dc6182cd678	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 21:55:26.772325+00	
00000000-0000-0000-0000-000000000000	25710a98-c08c-4faf-aa95-11e8caf684e8	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 23:38:13.028543+00	
00000000-0000-0000-0000-000000000000	a76ff8f5-c467-40e4-885b-c00e46ca33ff	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-04 23:38:13.046733+00	
00000000-0000-0000-0000-000000000000	b6ba3c31-b80d-4791-be6f-fb8d7e5648f5	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 06:33:21.971331+00	
00000000-0000-0000-0000-000000000000	fd56a484-7b16-441f-ae22-6c2aa895a99b	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 06:33:21.997542+00	
00000000-0000-0000-0000-000000000000	3bea4521-1a7f-4065-9e1b-fc457b77f2be	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 01:21:11.293709+00	
00000000-0000-0000-0000-000000000000	7162d9fe-e7f2-49e5-ae57-71a4fa49979a	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 01:21:25.390508+00	
00000000-0000-0000-0000-000000000000	3e2ccdfb-4bc9-47b9-ab57-ab1016e1a6e5	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 15:25:35.955971+00	
00000000-0000-0000-0000-000000000000	c303f881-cc47-4bb8-ba87-bca0d576f917	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 15:25:35.984783+00	
00000000-0000-0000-0000-000000000000	a567194d-c332-40b8-85da-193822774155	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 15:54:25.047616+00	
00000000-0000-0000-0000-000000000000	d48f2157-7555-4315-8b45-5f63c1401288	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-08 15:54:25.063109+00	
00000000-0000-0000-0000-000000000000	e74f7b3c-81cc-4857-9036-06753a26cc93	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:43:15.06603+00	
00000000-0000-0000-0000-000000000000	4aa29b38-aa06-49c9-b2f6-a0dfdf97d199	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:43:15.064354+00	
00000000-0000-0000-0000-000000000000	ce98852c-d872-44a2-b055-344a25c7de1a	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:43:15.090943+00	
00000000-0000-0000-0000-000000000000	6ebc7285-014d-4bb4-bdc7-4b1f32d77ab9	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-09 23:43:15.095277+00	
00000000-0000-0000-0000-000000000000	bb8ca69f-aa36-42a1-b971-9928a26ca6fe	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 00:31:39.682181+00	
00000000-0000-0000-0000-000000000000	45817fa8-ecb7-464a-ab71-35667314fac0	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 01:38:31.822293+00	
00000000-0000-0000-0000-000000000000	4a13bb69-e7bc-4340-94f7-9887ed16672f	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 01:38:31.84608+00	
00000000-0000-0000-0000-000000000000	aded9e1e-c61a-4190-bbee-2483e0ae8892	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 02:36:48.177996+00	
00000000-0000-0000-0000-000000000000	92d5b60f-421c-4278-b315-d16c07497c58	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 02:36:48.19547+00	
00000000-0000-0000-0000-000000000000	bec88834-7acc-4080-a567-ea362a1a3e1b	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 15:46:25.72822+00	
00000000-0000-0000-0000-000000000000	291cce37-e141-47af-81e3-c406cdc72fbb	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 15:46:25.755795+00	
00000000-0000-0000-0000-000000000000	f9be2409-1c18-41a1-8f06-32597155d0cc	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 01:13:48.064761+00	
00000000-0000-0000-0000-000000000000	4aad5e09-b6ef-492d-81bd-c8d15e3dc09d	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 01:13:48.089566+00	
00000000-0000-0000-0000-000000000000	aa73e7a3-f60a-4042-8a9d-6f385409cbf0	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 03:02:39.49744+00	
00000000-0000-0000-0000-000000000000	d1046271-d9b8-4834-820b-e956f6e2bb1d	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-14 03:02:39.512324+00	
00000000-0000-0000-0000-000000000000	733afe9e-ff6b-47ee-920a-f4435e599623	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 01:18:41.893261+00	
00000000-0000-0000-0000-000000000000	770baf77-a215-4c72-8c55-2d13eedfdcac	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 01:18:41.924452+00	
00000000-0000-0000-0000-000000000000	67a3dab3-586e-4dc1-a4a0-64903e882a00	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 18:05:49.383533+00	
00000000-0000-0000-0000-000000000000	9aac97af-5a4d-460f-a9a3-338b552b51cb	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 18:05:49.409435+00	
00000000-0000-0000-0000-000000000000	243ab69c-8c2f-44aa-93fa-972ff5b1f1d2	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 20:56:09.792682+00	
00000000-0000-0000-0000-000000000000	823e8ad6-3509-4de6-a748-ed0160356990	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 20:56:09.813447+00	
00000000-0000-0000-0000-000000000000	2501561d-1107-46c9-911a-96f2e670ae11	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-16 21:33:16.516429+00	
00000000-0000-0000-0000-000000000000	243a2491-c262-4cc2-8923-c54d6aa93534	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:11:45.597954+00	
00000000-0000-0000-0000-000000000000	45f9f4c3-f5b5-4fa5-9518-c5bdc6d369b2	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:11:45.60751+00	
00000000-0000-0000-0000-000000000000	9033da32-a233-42e2-a177-9d45e33624b5	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:32:48.9561+00	
00000000-0000-0000-0000-000000000000	1da51280-7882-4a44-ba60-8f5767f99a09	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 22:32:48.963759+00	
00000000-0000-0000-0000-000000000000	57c84ae4-c649-4915-b2e9-909e482201da	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 23:57:00.367539+00	
00000000-0000-0000-0000-000000000000	3d9adb64-1b5f-4d7e-8be0-0381f2262f3b	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-16 23:57:00.395785+00	
00000000-0000-0000-0000-000000000000	0b81ebc7-f450-463f-9417-be96025f2ed9	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 16:14:20.003292+00	
00000000-0000-0000-0000-000000000000	c8de93f9-c032-46da-89ae-020173543528	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 16:14:20.028291+00	
00000000-0000-0000-0000-000000000000	9710cdf1-2884-44d9-834b-0558a225ecd4	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 16:23:06.162879+00	
00000000-0000-0000-0000-000000000000	c416a584-0f3f-47da-9cec-fc48905d9f7a	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 16:23:06.172696+00	
00000000-0000-0000-0000-000000000000	6dbac3ad-ae20-48b2-aeea-4f83f094058c	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 17:24:18.360979+00	
00000000-0000-0000-0000-000000000000	0f1b9af8-42a5-4de0-a2da-609cd5865c88	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 17:24:18.38973+00	
00000000-0000-0000-0000-000000000000	b984199d-e36f-4f0d-980d-40c4f241eba5	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 17:52:02.490338+00	
00000000-0000-0000-0000-000000000000	3f884bb5-b14a-4190-8496-75d4f7056d42	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 17:52:02.509867+00	
00000000-0000-0000-0000-000000000000	4ee4477b-0e5c-47ef-b58c-831bd02117e1	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 17:58:57.78981+00	
00000000-0000-0000-0000-000000000000	00e171d7-8da3-48ae-86bf-fb792d3cd29d	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 17:58:57.792577+00	
00000000-0000-0000-0000-000000000000	58ea7016-95ba-42fd-90da-f88528f4bc5e	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-17 18:17:15.365999+00	
00000000-0000-0000-0000-000000000000	2ee3c2bf-c375-4761-8bad-c7f28e6e00c1	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 18:25:34.06822+00	
00000000-0000-0000-0000-000000000000	e56866fb-7a7d-4f9c-909d-12104efe76e2	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 18:25:34.073348+00	
00000000-0000-0000-0000-000000000000	702c668d-c9d4-4b48-a197-daf521ba965f	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 21:39:24.412646+00	
00000000-0000-0000-0000-000000000000	38b2ad88-d272-4015-b63f-d211e6a82e52	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-17 21:39:24.440238+00	
00000000-0000-0000-0000-000000000000	e2d8a394-3f40-4936-8dd9-8e227656d636	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 00:48:00.762754+00	
00000000-0000-0000-0000-000000000000	bd982808-9119-409b-8183-9e7614ae9b7a	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 00:48:00.784593+00	
00000000-0000-0000-0000-000000000000	82ce1fe7-249a-413b-8413-58f7d9cbf4b1	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 01:48:27.403419+00	
00000000-0000-0000-0000-000000000000	f7a05e05-43b5-4e91-9694-787725a32163	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 01:48:27.422639+00	
00000000-0000-0000-0000-000000000000	b3db8c2d-1f33-467b-815c-fcc3e0ee7301	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 05:35:36.026415+00	
00000000-0000-0000-0000-000000000000	3d08ec28-ac73-4843-9d28-2502b67fd289	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 05:35:36.053794+00	
00000000-0000-0000-0000-000000000000	07771e8d-6922-4e6d-bc0d-c4377df178d3	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 18:55:17.443736+00	
00000000-0000-0000-0000-000000000000	0621b70d-6863-4d4d-bc51-7bb16fa7574b	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 18:57:41.670645+00	
00000000-0000-0000-0000-000000000000	620c6d42-ffb7-477a-82dc-875cf9fad555	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 18:57:41.67173+00	
00000000-0000-0000-0000-000000000000	70a6337f-fc33-4bba-a8b5-a66a0c505cc9	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:22:18.085995+00	
00000000-0000-0000-0000-000000000000	4f81f9de-7fdb-4102-bc83-a0f4059b3ead	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:22:18.119272+00	
00000000-0000-0000-0000-000000000000	4427f58c-5c2e-4d95-a6af-177480972fc0	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:55:55.023525+00	
00000000-0000-0000-0000-000000000000	9ec2a07d-d302-4bea-b12e-c2e681874f8e	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:55:55.046315+00	
00000000-0000-0000-0000-000000000000	b1fec08f-3788-4a0a-97ac-5899fd9a9cbe	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:55:56.837188+00	
00000000-0000-0000-0000-000000000000	2282c966-7f91-4828-b463-23adda8c896b	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-18 21:55:56.837962+00	
00000000-0000-0000-0000-000000000000	523a55c7-5a41-436f-bf59-3bcbdf81ba71	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 22:56:22.049309+00	
00000000-0000-0000-0000-000000000000	6ddd1f0e-8d9d-485a-95e0-5bed3e465092	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 22:56:22.07862+00	
00000000-0000-0000-0000-000000000000	6ac8ec5b-361c-4d01-a8f7-37f51771d358	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 23:33:43.027825+00	
00000000-0000-0000-0000-000000000000	46180f00-fd25-411c-9b3a-fb9ed961d978	{"action":"login","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 23:36:57.890805+00	
00000000-0000-0000-0000-000000000000	16a59399-9123-41dc-a21a-7a2d1795c150	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 00:59:31.722635+00	
00000000-0000-0000-0000-000000000000	40f49904-5cd4-482a-b8ce-b7bc0620b225	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-29 22:26:11.383538+00	
00000000-0000-0000-0000-000000000000	27cba336-6f10-433f-af79-3679c9bdbbae	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-29 22:26:11.415371+00	
00000000-0000-0000-0000-000000000000	2d94041f-b86d-4764-85c6-e994202277ba	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-29 22:29:06.602505+00	
00000000-0000-0000-0000-000000000000	fb939c84-1c8f-4c74-ae7b-0886e070fba1	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 02:01:16.078546+00	
00000000-0000-0000-0000-000000000000	0ef952b8-6bfb-4204-b709-1752218e5a24	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 02:01:16.107875+00	
00000000-0000-0000-0000-000000000000	c3b73aca-1d16-484b-94be-cf27d2d2c8a2	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 03:02:57.285782+00	
00000000-0000-0000-0000-000000000000	ded64629-80b3-4ea9-9106-a53b98dbc4c3	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 03:02:57.310561+00	
00000000-0000-0000-0000-000000000000	76523c84-fb1c-4c8a-ac8d-3e56662cef2f	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 03:26:31.916873+00	
00000000-0000-0000-0000-000000000000	a4d819f7-f66c-4205-8ced-eef8388f57ce	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 03:26:31.934746+00	
00000000-0000-0000-0000-000000000000	32cd65d2-e9c0-4b3e-b252-7c17af9457bf	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 04:11:20.82443+00	
00000000-0000-0000-0000-000000000000	62cbad1d-f598-40e9-a06f-ae002bc08160	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 04:11:20.851637+00	
00000000-0000-0000-0000-000000000000	be9dd298-9b44-4d5b-af9f-dd81ea54e2a0	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 04:11:20.920739+00	
00000000-0000-0000-0000-000000000000	7afdbe1d-75c2-4551-b5ab-73ccc32346ca	{"action":"token_refreshed","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 05:06:35.600584+00	
00000000-0000-0000-0000-000000000000	991ae59e-9088-4e06-83c7-f4db8136a0ea	{"action":"token_revoked","actor_id":"a290d46f-deb8-4404-9bab-2280bcdcc9fe","actor_username":"test@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-30 05:06:35.622709+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
470ef754-6095-42ee-9a28-9c35d0a35790	65e83c5a-5960-4273-b500-3aee66a670c2	a4b92c66-0807-4a34-a6ed-b5327249efaf	s256	cuCbV6WLiXDmkLhqAXPb11Zb1z3Jpo4GZUWJrtwsQ9E	email			2025-08-02 00:41:11.078182+00	2025-08-02 00:41:11.078182+00	email/signup	\N
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
65e83c5a-5960-4273-b500-3aee66a670c2	65e83c5a-5960-4273-b500-3aee66a670c2	{"sub": "65e83c5a-5960-4273-b500-3aee66a670c2", "email": "admin@admin.com", "email_verified": false, "phone_verified": false}	email	2025-08-02 00:41:11.064982+00	2025-08-02 00:41:11.065666+00	2025-08-02 00:41:11.065666+00	fe18df13-4196-424c-b86a-7e1e09a280ba
a290d46f-deb8-4404-9bab-2280bcdcc9fe	a290d46f-deb8-4404-9bab-2280bcdcc9fe	{"sub": "a290d46f-deb8-4404-9bab-2280bcdcc9fe", "email": "test@test.com", "email_verified": false, "phone_verified": false}	email	2025-08-02 00:45:23.05292+00	2025-08-02 00:45:23.052976+00	2025-08-02 00:45:23.052976+00	43de3a1e-d65f-4336-b2d1-194e08b26800
430c3546-d737-4e22-8afc-4db735cc40de	430c3546-d737-4e22-8afc-4db735cc40de	{"sub": "430c3546-d737-4e22-8afc-4db735cc40de", "email": "test-1754104522473@example.com", "email_verified": false, "phone_verified": false}	email	2025-08-02 03:15:23.506121+00	2025-08-02 03:15:23.506181+00	2025-08-02 03:15:23.506181+00	b33c8cfd-0e16-4879-b982-7b09a74705fe
ae0e0aef-ee11-4eb4-98de-7b63bae0c664	ae0e0aef-ee11-4eb4-98de-7b63bae0c664	{"sub": "ae0e0aef-ee11-4eb4-98de-7b63bae0c664", "email": "test-1754104726106@example.com", "email_verified": false, "phone_verified": false}	email	2025-08-02 03:18:46.972863+00	2025-08-02 03:18:46.972911+00	2025-08-02 03:18:46.972911+00	01f413f5-ffe3-4722-9d83-0becbcb9d6ae
726d7571-2f28-4a38-add9-cd39a02ad69a	726d7571-2f28-4a38-add9-cd39a02ad69a	{"sub": "726d7571-2f28-4a38-add9-cd39a02ad69a", "email": "test-1754104726540@example.com", "email_verified": false, "phone_verified": false}	email	2025-08-02 03:18:47.308085+00	2025-08-02 03:18:47.308148+00	2025-08-02 03:18:47.308148+00	dcf01baa-de01-49ef-bb5f-231e47e57318
c1118846-4d41-47ec-95e1-f1678476e150	c1118846-4d41-47ec-95e1-f1678476e150	{"sub": "c1118846-4d41-47ec-95e1-f1678476e150", "email": "test-1754104728632@example.com", "email_verified": false, "phone_verified": false}	email	2025-08-02 03:18:49.319026+00	2025-08-02 03:18:49.319071+00	2025-08-02 03:18:49.319071+00	affd2b9d-b5b7-41f3-b16d-edf4319238c0
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
b12519d1-8360-47e7-a0c2-f29238047235	2025-08-02 00:45:23.082306+00	2025-08-02 00:45:23.082306+00	password	27b7ca20-e7f0-458a-9f6c-4962ef12b7d6
c38de946-dc5c-4062-a50e-f0b8985c7e2e	2025-08-02 02:58:21.544494+00	2025-08-02 02:58:21.544494+00	password	1b7e0d46-875c-4fc6-9490-e83779dd6dce
b07a5ab5-5986-4bab-9297-768d8a05c5a6	2025-08-02 03:15:23.53502+00	2025-08-02 03:15:23.53502+00	password	1f3b5a60-cb46-4bfc-995f-ca745972e496
f45c1b9b-be34-46aa-83b8-46009c392592	2025-08-02 03:18:46.984457+00	2025-08-02 03:18:46.984457+00	password	1b1d0ef9-8b65-4f29-b89d-aa50205dcd6d
f08f675f-3c93-4ec2-a87b-6c0a30a6a6f0	2025-08-02 03:18:47.31722+00	2025-08-02 03:18:47.31722+00	password	39184ccc-edb5-4665-afd9-bf7be433aa20
9823269d-41f8-46a1-b9f4-42d06b0b1d69	2025-08-02 03:18:49.328295+00	2025-08-02 03:18:49.328295+00	password	892f17e7-e62c-4a35-a4a3-14efdc7b8ec0
6b6a4b8a-bc17-49b1-ab83-cde580abd4aa	2025-08-04 18:42:10.9043+00	2025-08-04 18:42:10.9043+00	password	cd594f1d-0e53-4af3-ba68-7d036675acc2
cefff0cf-ebbb-484c-8648-351fa823c548	2025-08-07 01:21:11.409083+00	2025-08-07 01:21:11.409083+00	password	d5b742b2-4a70-45f4-a712-4828e8a95496
2dc8ec21-602c-4556-a4d9-0367ef66c3ca	2025-08-07 01:21:25.397549+00	2025-08-07 01:21:25.397549+00	password	05521912-a62f-43bd-b972-b2d6dbcedc88
d0d4052a-6e40-468f-8172-6939f9833770	2025-08-10 00:31:39.778922+00	2025-08-10 00:31:39.778922+00	password	faa425dc-ea4e-4332-95aa-570d10b08279
f170b6c4-ef3e-4b34-99f4-48be7d208d6f	2025-08-16 21:33:16.603357+00	2025-08-16 21:33:16.603357+00	password	5bc5e48b-b605-4942-ac3b-ef3df3d0039a
0737d971-b78a-4b1b-bfab-6683417d89ec	2025-08-17 18:17:15.401528+00	2025-08-17 18:17:15.401528+00	password	a15af48f-8e2b-44ea-9e73-ed1f933c2480
ef662941-55e0-4bba-8b15-13b0dd078551	2025-08-18 18:55:17.559217+00	2025-08-18 18:55:17.559217+00	password	025a2483-088f-4263-b636-4faa73c923d4
f2a8fda7-c662-4c0f-8112-6d9eec152dad	2025-08-19 23:33:43.0993+00	2025-08-19 23:33:43.0993+00	password	b31ca3f6-6a42-4e08-b23c-832327174733
bec45578-634a-4763-b5af-07cf8dde5f64	2025-08-19 23:36:57.895394+00	2025-08-19 23:36:57.895394+00	password	d8e120ca-648d-42a6-b149-6b1666e1ede9
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
90af1c61-0774-4c03-8ea6-600836173411	65e83c5a-5960-4273-b500-3aee66a670c2	confirmation_token	pkce_bc2d0fd94dd11afd47f32a524c224bbc32ec9b250e8eb6a56ea3c1f9	admin@admin.com	2025-08-02 00:41:11.493795	2025-08-02 00:41:11.493795
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	piphltf6uovr	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-02 00:45:23.073659+00	2025-08-02 01:49:55.599771+00	\N	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	2	oshjhekfc4mb	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-02 01:49:55.618079+00	2025-08-02 03:07:51.368935+00	piphltf6uovr	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	5	2hpr7tijioop	430c3546-d737-4e22-8afc-4db735cc40de	f	2025-08-02 03:15:23.530188+00	2025-08-02 03:15:23.530188+00	\N	b07a5ab5-5986-4bab-9297-768d8a05c5a6
00000000-0000-0000-0000-000000000000	6	f5ts4cl7k3it	ae0e0aef-ee11-4eb4-98de-7b63bae0c664	f	2025-08-02 03:18:46.982603+00	2025-08-02 03:18:46.982603+00	\N	f45c1b9b-be34-46aa-83b8-46009c392592
00000000-0000-0000-0000-000000000000	7	kl6ofrmlbavn	726d7571-2f28-4a38-add9-cd39a02ad69a	f	2025-08-02 03:18:47.315317+00	2025-08-02 03:18:47.315317+00	\N	f08f675f-3c93-4ec2-a87b-6c0a30a6a6f0
00000000-0000-0000-0000-000000000000	8	4uou3syf7rua	c1118846-4d41-47ec-95e1-f1678476e150	f	2025-08-02 03:18:49.327068+00	2025-08-02 03:18:49.327068+00	\N	9823269d-41f8-46a1-b9f4-42d06b0b1d69
00000000-0000-0000-0000-000000000000	3	aaap2fvmtcvy	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-02 02:58:21.514028+00	2025-08-02 05:57:22.179003+00	\N	c38de946-dc5c-4062-a50e-f0b8985c7e2e
00000000-0000-0000-0000-000000000000	9	t3hha3gzwuxo	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-02 05:57:22.190736+00	2025-08-03 19:40:43.211067+00	aaap2fvmtcvy	c38de946-dc5c-4062-a50e-f0b8985c7e2e
00000000-0000-0000-0000-000000000000	10	elhln4f3aeod	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-03 19:40:43.230887+00	2025-08-03 23:45:02.314411+00	t3hha3gzwuxo	c38de946-dc5c-4062-a50e-f0b8985c7e2e
00000000-0000-0000-0000-000000000000	4	3vyds56vez5b	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-02 03:07:51.378187+00	2025-08-03 23:45:06.624681+00	oshjhekfc4mb	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	12	5dd62fbrnmdd	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-03 23:45:06.625046+00	2025-08-04 00:45:36.524286+00	3vyds56vez5b	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	13	226a5cw2ca2q	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 00:45:36.533366+00	2025-08-04 01:44:04.040213+00	5dd62fbrnmdd	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	11	espyrfldkpwx	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-03 23:45:02.33052+00	2025-08-04 01:47:17.217073+00	elhln4f3aeod	c38de946-dc5c-4062-a50e-f0b8985c7e2e
00000000-0000-0000-0000-000000000000	15	wepjxgr6frsh	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 01:47:17.217799+00	2025-08-04 18:41:35.115783+00	espyrfldkpwx	c38de946-dc5c-4062-a50e-f0b8985c7e2e
00000000-0000-0000-0000-000000000000	16	mvarfk3lzr2f	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-04 18:41:35.137348+00	2025-08-04 18:41:35.137348+00	wepjxgr6frsh	c38de946-dc5c-4062-a50e-f0b8985c7e2e
00000000-0000-0000-0000-000000000000	14	t57m43phcsyc	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 01:44:04.048974+00	2025-08-04 18:41:56.648882+00	226a5cw2ca2q	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	17	pcf4kunrzlpk	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 18:41:56.650655+00	2025-08-04 21:55:26.775499+00	t57m43phcsyc	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	19	zuvx63vqwp6g	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 21:55:26.794294+00	2025-08-04 23:38:13.05153+00	pcf4kunrzlpk	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	20	aom2acvhuoza	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 23:38:13.066192+00	2025-08-06 06:33:21.999327+00	zuvx63vqwp6g	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	23	xigj7lmfsf5d	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-07 01:21:25.396333+00	2025-08-08 15:25:35.987921+00	\N	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	22	ayjw32qwmljf	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-07 01:21:11.352057+00	2025-08-08 15:54:25.064328+00	\N	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	18	vylliseaqf2a	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-04 18:42:10.902158+00	2025-08-09 23:43:15.096583+00	\N	6b6a4b8a-bc17-49b1-ab83-cde580abd4aa
00000000-0000-0000-0000-000000000000	21	3nbluluvq3rn	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-06 06:33:22.021467+00	2025-08-09 23:43:15.09163+00	aom2acvhuoza	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	26	zc26xmybacp3	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-09 23:43:15.116365+00	2025-08-09 23:43:15.116365+00	vylliseaqf2a	6b6a4b8a-bc17-49b1-ab83-cde580abd4aa
00000000-0000-0000-0000-000000000000	27	hmx3sea6qhxs	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-09 23:43:15.116561+00	2025-08-09 23:43:15.116561+00	3nbluluvq3rn	b12519d1-8360-47e7-a0c2-f29238047235
00000000-0000-0000-0000-000000000000	28	pryd5kivdoow	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-10 00:31:39.734185+00	2025-08-10 01:38:31.847458+00	\N	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	29	5nyxdyx3tvqa	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-10 01:38:31.86076+00	2025-08-10 02:36:48.197295+00	pryd5kivdoow	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	25	3hqeb2v3jnt7	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-08 15:54:25.074587+00	2025-08-11 15:46:25.757648+00	ayjw32qwmljf	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	30	lrq7wscdokwm	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-10 02:36:48.216324+00	2025-08-14 01:13:48.092047+00	5nyxdyx3tvqa	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	32	dgxjy2pqdvst	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-14 01:13:48.117448+00	2025-08-14 03:02:39.513614+00	lrq7wscdokwm	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	33	yuon4tksy7av	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-14 03:02:39.526413+00	2025-08-16 01:18:41.92633+00	dgxjy2pqdvst	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	34	rir75xadbjhq	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-16 01:18:41.949754+00	2025-08-16 18:05:49.420386+00	yuon4tksy7av	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	35	dtltuojng3k2	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-16 18:05:49.447669+00	2025-08-16 18:05:49.447669+00	rir75xadbjhq	d0d4052a-6e40-468f-8172-6939f9833770
00000000-0000-0000-0000-000000000000	31	s324iuvzdctv	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-11 15:46:25.781414+00	2025-08-16 20:56:09.814024+00	3hqeb2v3jnt7	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	36	6t62372fsfh4	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-16 20:56:09.833936+00	2025-08-16 22:11:45.608103+00	s324iuvzdctv	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	37	3nomm6ttn7mv	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-16 21:33:16.557328+00	2025-08-16 22:32:48.965154+00	\N	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	39	nl2kltlsx3ph	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-16 22:32:48.973065+00	2025-08-16 23:57:00.396454+00	3nomm6ttn7mv	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	40	3gjxf35zntef	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-16 23:57:00.417045+00	2025-08-17 16:14:20.030123+00	nl2kltlsx3ph	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	38	wejjmm6no3yl	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-16 22:11:45.617064+00	2025-08-17 16:23:06.173382+00	6t62372fsfh4	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	24	ih2q5ucusgaa	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-08 15:25:36.014793+00	2025-08-17 17:24:18.392782+00	xigj7lmfsf5d	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	41	t3xc3x3sy2dc	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 16:14:20.061047+00	2025-08-17 17:52:02.511801+00	3gjxf35zntef	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	42	4ysaj7u3pbce	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 16:23:06.188373+00	2025-08-17 17:58:57.793159+00	wejjmm6no3yl	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	46	4pejvdmkwoqd	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-17 18:17:15.38903+00	2025-08-17 18:17:15.38903+00	\N	0737d971-b78a-4b1b-bfab-6683417d89ec
00000000-0000-0000-0000-000000000000	43	lluwj2znku33	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 17:24:18.412786+00	2025-08-17 18:25:34.074555+00	ih2q5ucusgaa	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	47	paa7l537exuw	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 18:25:34.081185+00	2025-08-17 21:39:24.442049+00	lluwj2znku33	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	48	66cmwwkjmwuo	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 21:39:24.468007+00	2025-08-18 00:48:00.785228+00	paa7l537exuw	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	49	foiqpogh4nrg	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-18 00:48:00.806388+00	2025-08-18 01:48:27.423284+00	66cmwwkjmwuo	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	50	nfuawjsiweuu	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-18 01:48:27.441711+00	2025-08-18 05:35:36.056404+00	foiqpogh4nrg	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	52	zvh3ytoyllgr	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-18 18:55:17.500756+00	2025-08-18 21:22:18.120716+00	\N	ef662941-55e0-4bba-8b15-13b0dd078551
00000000-0000-0000-0000-000000000000	44	2xrtetyb5b7c	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 17:52:02.526502+00	2025-08-30 03:02:57.31316+00	t3xc3x3sy2dc	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	51	mhxprxjidvoc	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-18 05:35:36.087478+00	2025-08-18 18:57:41.672354+00	nfuawjsiweuu	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	54	y5byaykx5kop	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-18 21:22:18.146955+00	2025-08-18 21:22:18.146955+00	zvh3ytoyllgr	ef662941-55e0-4bba-8b15-13b0dd078551
00000000-0000-0000-0000-000000000000	45	aum5smtm76xn	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-17 17:58:57.796405+00	2025-08-18 21:55:55.049147+00	4ysaj7u3pbce	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	55	w75weu2egj2h	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-18 21:55:55.074747+00	2025-08-18 21:55:55.074747+00	aum5smtm76xn	cefff0cf-ebbb-484c-8648-351fa823c548
00000000-0000-0000-0000-000000000000	53	2zvtaqzebkge	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-18 18:57:41.682929+00	2025-08-18 21:55:56.839434+00	mhxprxjidvoc	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	56	7meckohieutg	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-18 21:55:56.839914+00	2025-08-19 22:56:22.0813+00	2zvtaqzebkge	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	58	vqin3z46dv34	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-19 23:33:43.065651+00	2025-08-19 23:33:43.065651+00	\N	f2a8fda7-c662-4c0f-8112-6d9eec152dad
00000000-0000-0000-0000-000000000000	59	3dolc6t2xzkl	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-19 23:36:57.893396+00	2025-08-19 23:36:57.893396+00	\N	bec45578-634a-4763-b5af-07cf8dde5f64
00000000-0000-0000-0000-000000000000	57	gmrfic5cozqw	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-19 22:56:22.109795+00	2025-08-29 22:26:11.417903+00	7meckohieutg	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	60	cjajaveyib2b	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-29 22:26:11.44453+00	2025-08-30 02:01:16.108791+00	gmrfic5cozqw	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	61	6ncah437lcwi	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-30 02:01:16.130028+00	2025-08-30 03:26:31.936234+00	cjajaveyib2b	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	62	urchjtkxbcmg	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-30 03:02:57.336754+00	2025-08-30 04:11:20.852968+00	2xrtetyb5b7c	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	64	cw2sxe5d7eks	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-30 04:11:20.877478+00	2025-08-30 04:11:20.877478+00	urchjtkxbcmg	f170b6c4-ef3e-4b34-99f4-48be7d208d6f
00000000-0000-0000-0000-000000000000	63	n5z3ctvtueal	a290d46f-deb8-4404-9bab-2280bcdcc9fe	t	2025-08-30 03:26:31.952068+00	2025-08-30 05:06:35.623486+00	6ncah437lcwi	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
00000000-0000-0000-0000-000000000000	65	23azbdxj4c6l	a290d46f-deb8-4404-9bab-2280bcdcc9fe	f	2025-08-30 05:06:35.642873+00	2025-08-30 05:06:35.642873+00	n5z3ctvtueal	2dc8ec21-602c-4556-a4d9-0367ef66c3ca
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
b07a5ab5-5986-4bab-9297-768d8a05c5a6	430c3546-d737-4e22-8afc-4db735cc40de	2025-08-02 03:15:23.525689+00	2025-08-02 03:15:23.525689+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.7258.5 Safari/537.36	187.209.197.66	\N
f45c1b9b-be34-46aa-83b8-46009c392592	ae0e0aef-ee11-4eb4-98de-7b63bae0c664	2025-08-02 03:18:46.981498+00	2025-08-02 03:18:46.981498+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.7258.5 Safari/537.36	187.209.197.66	\N
f08f675f-3c93-4ec2-a87b-6c0a30a6a6f0	726d7571-2f28-4a38-add9-cd39a02ad69a	2025-08-02 03:18:47.314585+00	2025-08-02 03:18:47.314585+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0.2) Gecko/20100101 Firefox/140.0.2	187.209.197.66	\N
9823269d-41f8-46a1-b9f4-42d06b0b1d69	c1118846-4d41-47ec-95e1-f1678476e150	2025-08-02 03:18:49.325649+00	2025-08-02 03:18:49.325649+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15	187.209.197.66	\N
f170b6c4-ef3e-4b34-99f4-48be7d208d6f	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-16 21:33:16.538347+00	2025-08-30 04:11:20.922237+00	\N	aal1	\N	2025-08-30 04:11:20.922161	Next.js Middleware	131.226.34.199	\N
2dc8ec21-602c-4556-a4d9-0367ef66c3ca	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-07 01:21:25.392556+00	2025-08-30 05:06:35.654291+00	\N	aal1	\N	2025-08-30 05:06:35.654216	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	131.226.34.199	\N
0737d971-b78a-4b1b-bfab-6683417d89ec	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-17 18:17:15.378326+00	2025-08-17 18:17:15.378326+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	187.156.7.74	\N
c38de946-dc5c-4062-a50e-f0b8985c7e2e	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-02 02:58:21.49161+00	2025-08-04 18:41:35.165155+00	\N	aal1	\N	2025-08-04 18:41:35.165066	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	187.188.76.41	\N
6b6a4b8a-bc17-49b1-ab83-cde580abd4aa	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-04 18:42:10.894443+00	2025-08-09 23:43:15.135418+00	\N	aal1	\N	2025-08-09 23:43:15.135338	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	131.226.34.199	\N
b12519d1-8360-47e7-a0c2-f29238047235	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-02 00:45:23.068666+00	2025-08-09 23:43:15.140398+00	\N	aal1	\N	2025-08-09 23:43:15.140309	Next.js Middleware	131.226.34.199	\N
ef662941-55e0-4bba-8b15-13b0dd078551	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-18 18:55:17.473276+00	2025-08-18 21:22:18.169537+00	\N	aal1	\N	2025-08-18 21:22:18.169449	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	187.156.7.74	\N
cefff0cf-ebbb-484c-8648-351fa823c548	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-07 01:21:11.325671+00	2025-08-18 21:55:55.087646+00	\N	aal1	\N	2025-08-18 21:55:55.087555	Vercel Edge Functions	54.177.55.201	\N
d0d4052a-6e40-468f-8172-6939f9833770	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-10 00:31:39.713377+00	2025-08-16 18:05:49.469724+00	\N	aal1	\N	2025-08-16 18:05:49.469046	Vercel Edge Functions	54.193.60.60	\N
f2a8fda7-c662-4c0f-8112-6d9eec152dad	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-19 23:33:43.049865+00	2025-08-19 23:33:43.049865+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	200.68.188.180	\N
bec45578-634a-4763-b5af-07cf8dde5f64	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-19 23:36:57.892348+00	2025-08-19 23:36:57.892348+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/139.0.7258.76 Mobile/15E148 Safari/604.1	200.68.188.180	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	430c3546-d737-4e22-8afc-4db735cc40de	authenticated	authenticated	test-1754104522473@example.com	$2a$10$hfQ7Q4iIXHq/QayW0TDkPuXTMdHGrTcHmmvY4RakRxjDfXATmEy9m	2025-08-02 03:15:23.512357+00	\N		\N		\N			\N	2025-08-02 03:15:23.524628+00	{"provider": "email", "providers": ["email"]}	{"sub": "430c3546-d737-4e22-8afc-4db735cc40de", "email": "test-1754104522473@example.com", "email_verified": true, "phone_verified": false}	\N	2025-08-02 03:15:23.480522+00	2025-08-02 03:15:23.534444+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	65e83c5a-5960-4273-b500-3aee66a670c2	authenticated	authenticated	admin@admin.com	$2a$10$NmT0jMsJQ/mf9TXJ7Dov5.S6oTq9fGIl1FGuh4228yyIb8yjgd6.i	\N	\N	pkce_bc2d0fd94dd11afd47f32a524c224bbc32ec9b250e8eb6a56ea3c1f9	2025-08-02 00:41:11.084565+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "65e83c5a-5960-4273-b500-3aee66a670c2", "email": "admin@admin.com", "email_verified": false, "phone_verified": false}	\N	2025-08-02 00:41:11.042464+00	2025-08-02 00:41:11.490419+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	726d7571-2f28-4a38-add9-cd39a02ad69a	authenticated	authenticated	test-1754104726540@example.com	$2a$10$sJOKISdeLTN3/bylouD/DuWH7fk5qKKVBkp17LZr0DrOy7a8PGwzu	2025-08-02 03:18:47.311286+00	\N		\N		\N			\N	2025-08-02 03:18:47.314517+00	{"provider": "email", "providers": ["email"]}	{"sub": "726d7571-2f28-4a38-add9-cd39a02ad69a", "email": "test-1754104726540@example.com", "email_verified": true, "phone_verified": false}	\N	2025-08-02 03:18:47.305168+00	2025-08-02 03:18:47.316856+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ae0e0aef-ee11-4eb4-98de-7b63bae0c664	authenticated	authenticated	test-1754104726106@example.com	$2a$10$nSPOG65xZ1rAdwh4nSUnguMkB7idOp6wFsPuSf7/9VOet8MKGK9fq	2025-08-02 03:18:46.97702+00	\N		\N		\N			\N	2025-08-02 03:18:46.981421+00	{"provider": "email", "providers": ["email"]}	{"sub": "ae0e0aef-ee11-4eb4-98de-7b63bae0c664", "email": "test-1754104726106@example.com", "email_verified": true, "phone_verified": false}	\N	2025-08-02 03:18:46.968624+00	2025-08-02 03:18:46.983987+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a290d46f-deb8-4404-9bab-2280bcdcc9fe	authenticated	authenticated	test@test.com	$2a$10$7obbYl3O.PRFbvaCb53GE.lRBE8Q5CiNV9BAT8RKzyWVlVb1nOb7C	2025-08-02 00:45:23.059854+00	\N		\N		\N			\N	2025-08-19 23:36:57.89226+00	{"provider": "email", "providers": ["email"]}	{"sub": "a290d46f-deb8-4404-9bab-2280bcdcc9fe", "email": "test@test.com", "email_verified": true, "phone_verified": false}	\N	2025-08-02 00:45:23.043895+00	2025-08-30 05:06:35.650861+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c1118846-4d41-47ec-95e1-f1678476e150	authenticated	authenticated	test-1754104728632@example.com	$2a$10$NCzjP6wZdkHVv.Vf7x8LC.w/I5zTIcAvzrsjhMZyd9H/OS9API19S	2025-08-02 03:18:49.322383+00	\N		\N		\N			\N	2025-08-02 03:18:49.325578+00	{"provider": "email", "providers": ["email"]}	{"sub": "c1118846-4d41-47ec-95e1-f1678476e150", "email": "test-1754104728632@example.com", "email_verified": true, "phone_verified": false}	\N	2025-08-02 03:18:49.316746+00	2025-08-02 03:18:49.327973+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9cb3729a-0e1a-4818-8114-ea875794fa8b	7c231f15a3dacd1a2e7d563b7cf1ad5a25b30ba0e0df985b284ebb487e948353	2025-08-14 02:35:01.475408+00	0_init		\N	2025-08-14 02:35:01.475408+00	0
801011dc-ae99-4ff8-ac1c-1f0fe8e7e5b7	751ffec67fbdec4916e9044731a115ee11cb7fd6d269b2ebbd96d2b100416772	2025-08-14 02:35:35.491469+00	20250814023534_multi_domain_phase1	\N	\N	2025-08-14 02:35:34.909884+00	1
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, "ownerUserId", "createdAt", "updatedAt") FROM stdin;
74b95a70-9cb7-45b3-858a-b6aadae4a30f	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-14 02:46:27.992	2025-08-14 02:46:27.992
649e234e-6dee-4995-b4c9-6de537842578	430c3546-d737-4e22-8afc-4db735cc40de	2025-08-14 02:46:29.305	2025-08-14 02:46:29.305
fe60ab92-174a-49f8-b7ac-b04961297810	ae0e0aef-ee11-4eb4-98de-7b63bae0c664	2025-08-14 02:46:29.879	2025-08-14 02:46:29.879
b28cbf16-6834-4fbc-8fd4-c6c324586439	726d7571-2f28-4a38-add9-cd39a02ad69a	2025-08-14 02:46:30.491	2025-08-14 02:46:30.491
0d500ffb-43e7-4191-bf3f-32b022e56bad	c1118846-4d41-47ec-95e1-f1678476e150	2025-08-14 02:46:31.045	2025-08-14 02:46:31.045
\.


--
-- Data for Name: domains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domains (id, "clientId", hostname, type, verified, "primary", "createdAt", "updatedAt") FROM stdin;
ad5adbfb-fc5f-4820-aa52-5e219f4fea7b	0d500ffb-43e7-4191-bf3f-32b022e56bad	localhost:3000	platform	t	t	2025-08-14 02:46:28.435	2025-08-14 02:46:31.268
cf23b9db-85ae-4e2f-9d02-19dcf1b4a15f	74b95a70-9cb7-45b3-858a-b6aadae4a30f	links.tovimx.dev	custom	f	f	2025-08-14 03:15:33.776	2025-08-18 06:05:04.21
b4ab0b6e-98b4-4aee-95f1-a7b9c43606e2	74b95a70-9cb7-45b3-858a-b6aadae4a30f	links.enigma47.mx	custom	f	t	2025-08-17 18:01:10.842	2025-08-18 06:05:04.21
\.


--
-- Data for Name: links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.links (id, "qrCodeId", title, url, "position", "isActive", "createdAt", "updatedAt") FROM stdin;
040d350d-49ce-4b96-8753-7683a6774b55	bdf1446c-1f22-4593-9894-249078155418	Instagram	https://www.instagram.com/enigma47.mx	0	t	2025-08-14 03:30:58.802	2025-08-14 03:30:58.802
90e21c42-8815-4429-b397-75661385135a	bdf1446c-1f22-4593-9894-249078155418	Facebook	https://www.facebook.com/enigma47.mx	1	t	2025-08-14 03:30:58.802	2025-08-14 03:30:58.802
62521245-7a5f-40a3-bec3-4e772d10b13e	bdf1446c-1f22-4593-9894-249078155418	Whatsapp	https://www.instagram.com/enigma47mx	2	t	2025-08-14 03:30:58.802	2025-08-14 03:30:58.802
d1989538-3f26-4ccc-bf65-1e4fa3ebece4	9f411086-721a-4992-ba91-6e94759c0c52	Whatsapp	https://wa.me/5218119889060	0	t	2025-08-18 02:01:48.881	2025-08-18 02:01:48.881
6313280d-23f6-434d-a0a2-d9436f8f8ddc	9f411086-721a-4992-ba91-6e94759c0c52	Facebook	https://www.facebook.com/enigma47.mx	1	t	2025-08-18 02:01:48.881	2025-08-18 02:01:48.881
c39666d9-99bd-4d8c-a07e-188d6675f9b6	9f411086-721a-4992-ba91-6e94759c0c52	Instagram	https://www.instagram.com/enigma47.mx/	2	t	2025-08-18 02:01:48.881	2025-08-18 02:01:48.881
\.


--
-- Data for Name: qr_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_codes (id, "userId", "shortCode", title, "isActive", "createdAt", "updatedAt", "redirectType", "redirectUrl", "logoSize", "logoUrl", "cornerRadius", "fgColor", "logoShape", "clientId", "domainId", "position", "deletedAt") FROM stdin;
bc558892-0afc-4721-8cb8-b2aa93f87da2	a290d46f-deb8-4404-9bab-2280bcdcc9fe	HwgUsixw	QR Code 2	f	2025-08-16 21:41:02.1	2025-08-16 21:41:09.81	links	\N	30	\N	0	#000000	square	74b95a70-9cb7-45b3-858a-b6aadae4a30f	\N	1	2025-08-16 21:41:09.809
5bfd8914-46dc-4fa8-917a-d2e16be1b9a2	a290d46f-deb8-4404-9bab-2280bcdcc9fe	w25JUZRq	QR Code 2	f	2025-08-16 21:41:17.696	2025-08-16 22:12:08.074	links	\N	30	\N	0	#000000	square	74b95a70-9cb7-45b3-858a-b6aadae4a30f	\N	1	2025-08-16 22:12:08.072
26482372-1c42-4027-992d-929fd1f1866d	a290d46f-deb8-4404-9bab-2280bcdcc9fe	TFBOTXmC	QR Code 3	f	2025-08-16 21:54:14.982	2025-08-16 22:12:10.688	links	\N	30	\N	0	#000000	square	74b95a70-9cb7-45b3-858a-b6aadae4a30f	\N	2	2025-08-16 22:12:10.687
9f411086-721a-4992-ba91-6e94759c0c52	a290d46f-deb8-4404-9bab-2280bcdcc9fe	hPtED7ph	Enigma47	t	2025-08-16 22:12:34.521	2025-08-18 21:56:04.702	links	\N	30	https://ykgausbphagfutuielat.supabase.co/storage/v1/object/public/qr-logos/a290d46f-deb8-4404-9bab-2280bcdcc9fe/1755495686978.png	0	#391c01	square	74b95a70-9cb7-45b3-858a-b6aadae4a30f	\N	1	\N
bdf1446c-1f22-4593-9894-249078155418	a290d46f-deb8-4404-9bab-2280bcdcc9fe	X2KCcGoQ	Job Post - Enigma 47	t	2025-08-02 00:49:34.964	2025-08-30 02:03:39.209	url	https://wa.me/5218119889060?text=Hola%20estoy%20interesada%20en%20el%20puesto%20para%20la%20joyeria%20Enigma47	30	https://ykgausbphagfutuielat.supabase.co/storage/v1/object/public/qr-logos/a290d46f-deb8-4404-9bab-2280bcdcc9fe/1754270795522.png	0	#391c01	square	74b95a70-9cb7-45b3-858a-b6aadae4a30f	ad5adbfb-fc5f-4820-aa52-5e219f4fea7b	0	\N
3bed2884-74a1-4d4b-9d62-8ec443d6a19b	a290d46f-deb8-4404-9bab-2280bcdcc9fe	xFhKCPP5	Job Post - Silver and Silver	t	2025-08-30 02:02:18.731	2025-08-30 02:07:15.091	url	https://wa.me/5218119889060?text=Hola%20estoy%20interesada%20en%20el%20puesto%20para%20la%20joyeria%20Silver%26Silver	30	\N	0	#FFFFFF	square	74b95a70-9cb7-45b3-858a-b6aadae4a30f	\N	2	\N
\.


--
-- Data for Name: scans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scans (id, "qrCodeId", "userAgent", "ipHash", referer, "createdAt") FROM stdin;
f7ae4e10-22e7-4112-b408-c4efab325619	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3	\N	2025-08-04 00:03:23.582
20b5335b-b880-4985-b570-357edb5be1ae	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3	\N	2025-08-04 00:03:51.472
5f4748db-75bd-4bb0-815c-527be512e317	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3	\N	2025-08-04 00:05:01.555
5f4e1a08-acf1-42fc-9406-3e51fc839350	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3	http://localhost:3000/q/X2KCcGoQ	2025-08-04 00:18:44.667
780c2ffe-0ee1-4920-9160-287d87c4d9d7	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3	\N	2025-08-04 00:48:58.438
c6892d95-6741-4487-b1de-639e6f532439	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	eff8e7ca506627fe15dda5e0e512fcaad70b6d520f37cc76597fdb4f2d83a1a3	http://localhost:3000/q/X2KCcGoQ	2025-08-04 00:49:20.114
2cf66c9e-5792-4405-ba89-6558f2452809	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	509134256d0007281336937fdafa7f58a8a39869eabe852351b4890c92e7f2e9	\N	2025-08-10 01:04:00.253
cf376a7d-4313-4360-bb7f-0f6396c6cf32	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	509134256d0007281336937fdafa7f58a8a39869eabe852351b4890c92e7f2e9	\N	2025-08-10 01:04:39.131
e2984a1d-0600-4bed-8e3a-ed3a2044cd3d	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:16:27.283
b3e9c925-ca97-45c4-8950-761f5df23c4c	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:18:55.315
f0e2e509-36a6-4e17-8d89-16dc7e4a86c6	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:19:41.523
94e503ee-e9ac-406c-b4a8-d10dccc0d5c5	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:19:59.336
7b2c2384-5f64-40b9-a30b-58d59fdebef4	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:20:02.175
c4342741-026a-4bbb-954f-c8bc3a51df01	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:20:03.22
4a0cf0a0-a42b-4e7c-babd-adffb6b90bbc	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:20:04.029
c100fe73-164d-47d7-9720-e620618ce1e0	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:20:33.567
be5eba95-44b3-4882-8fcf-8a339d54154a	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:20:52.334
e6923fa7-12dc-45c4-a159-f62e12bf4838	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:21:44.663
e41832d8-72b9-4d6d-9dff-a146e45c6f72	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:22:05.602
efed0731-c007-4be3-9cc3-937a52b02407	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:30:59.79
7a784db1-e77c-4089-b620-59a9546d853a	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 03:35:25.484
c7ff6f4d-29b0-4444-8476-cdc9d51d455f	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	bc0a0151d8908057d286aa29e71454463a7c8b312abbc4d4e0c060ad051f6837	\N	2025-08-14 04:29:51.718
5be8c3d9-12c7-47ea-9452-63c692389ffa	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.1.25 (KHTML, like Gecko) Version/8.0 Safari/600.1.25	28ec28c45d0c514b0bb6d0736f5c919d04c1807b3e6c9fbd917c59416eed6f64	\N	2025-08-16 15:48:41.123
8ed77abd-3abc-4948-bcd0-0dd62a1dc9e6	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 18:06:42.523
fd79354e-40ab-4e19-99a8-9c7d1e08cfe2	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 20:57:06.052
ab5b9cbf-3308-452b-bb93-b3194561b066	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 20:57:20.554
77ed76bd-6ddd-460e-b72c-ba8a6737dcd1	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 21:09:15.976
84519b77-0add-4bd5-8cdd-b7ab186d76a8	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 21:20:59.054
b08b9d21-2443-4a7e-b923-267984ee1c2d	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 21:21:23.358
2a5de953-e1f8-4ce4-8a55-b7e8df2abf11	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-16 21:21:58.323
dc4a1a5b-e3a4-4d04-9fa4-fe152ccc1445	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-17 18:01:49.57
9545cd3a-a32b-4c5e-a059-9bf33617009e	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-17 18:49:28.658
a614baab-baf0-463f-9ba8-2111f8d173fc	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 01:48:52.637
e6116298-1410-4044-8103-b1d293f22e71	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 01:49:29.184
f748412e-54e4-46c2-92a4-1f334c97ae48	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 01:57:59.725
2225a2ee-77ad-4a5a-9cfa-8664fd6f55ee	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 02:01:53.246
0ab1c4f0-2fbe-4c24-be0b-7449e8d35bc3	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 02:02:12.174
93b7faa6-b98b-40d8-b2d2-4dbce316bb59	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 05:41:57.14
2306dffc-bea9-4602-9650-a338df496c40	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 05:42:12.315
a1e00c0e-c900-4bdf-9a69-ad5eb0f16ac0	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 19:00:32.49
74958e3a-d4b8-4a14-9d8f-c347e2aba067	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	c8baba6d21ce48122bce91b634a7353d74631909e3a1ad83a97f2f1760d8357b	\N	2025-08-18 20:31:07.496
d0830d3d-089c-4ddf-a9b0-107c42050ce1	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-18 21:57:04.02
916d087e-ecbd-4367-8e62-876a515540b5	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-19 08:56:04.88
d7b2df2b-9982-4206-ac0d-3339e42b0eea	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-19 18:28:42.143
f5116a7b-76a2-4cec-8dd7-fc640a700c2c	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-19 19:34:52.303
426ceb8f-6f62-4a0f-936b-2878d4f2a2b0	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	a7de17fb8d6eb7b8b5990b4a1b96ac045f275ab58bc8aefe0e07e41ddaa14498	\N	2025-08-19 22:17:57.413
49f3183c-866c-4ab9-aec3-9c7f9718221e	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	801b3fe4a9a12840973da1ba9d52b42fa1460b2b6522c14902e3cbeebdd00225	\N	2025-08-19 23:33:14.364
586d331a-d88b-4167-b737-a6aafbade44f	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	801b3fe4a9a12840973da1ba9d52b42fa1460b2b6522c14902e3cbeebdd00225	\N	2025-08-19 23:33:23.677
92ed4d0c-f98d-487d-b99a-493ac49741a0	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	801b3fe4a9a12840973da1ba9d52b42fa1460b2b6522c14902e3cbeebdd00225	\N	2025-08-19 23:33:27.089
fac1a9b4-1399-486f-9904-cdc9269ceb8f	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-20 01:00:50.62
059ca35d-3562-46d4-a4c0-ab393d9d708d	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.1.25 (KHTML, like Gecko) Version/8.0 Safari/600.1.25	4436378c2043c4c659bd3828dba628078f499576606ad828a5d23463eb0f69f2	\N	2025-08-20 10:50:44.114
7c782a57-cd49-41ca-8f07-8f53888f2aa0	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	47ef1d4d95c970970b84461a7ce61b4a812ede3c4dc0dfc0ada6570ac4cc310d	\N	2025-08-20 23:13:32.452
cfab25af-49ad-49ea-a0fc-3809eaf11c3f	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148	47ef1d4d95c970970b84461a7ce61b4a812ede3c4dc0dfc0ada6570ac4cc310d	\N	2025-08-21 01:48:07.674
5ba5ab46-4fda-4ffd-8fae-4323791b8295	bdf1446c-1f22-4593-9894-249078155418	Fuzz Faster U Fool v2.1.0-dev	c17b8ad7a13af05e012c5247b656f91fdd840014486096af13d73727fa616d01	\N	2025-08-22 15:01:54.917
500e3918-5300-4324-8dec-ac649a0d7825	bdf1446c-1f22-4593-9894-249078155418	Fuzz Faster U Fool v2.1.0-dev	c17b8ad7a13af05e012c5247b656f91fdd840014486096af13d73727fa616d01	\N	2025-08-22 15:01:55.654
5e7b66ac-1543-4da6-a149-9af709646751	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	c6ebc388897eb3f9dd87c8e4e7570f62701343a510e3dff0604aa7fce08d3788	\N	2025-08-26 19:37:29.592
7efccc86-ba57-4140-8bda-75178a89b92e	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	3f16c47cfbea8be9543060bfc82f0d022f1b15e0e360c7a16f277c30f9aaf9b7	\N	2025-08-26 20:36:23.305
98eeb3d8-4ded-4e0d-ad12-7149f3283a77	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1	18a5628365b64645bf16ad485cc1233625c07fad1d7799d78481935eb5453210	\N	2025-08-27 02:00:29.763
e3c77739-a866-4100-b3f2-457de4e01c7f	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	44e85cad03cf5070575286eb80036a4eb24ebfa2687e277e1364995606758f54	\N	2025-08-27 04:05:27.373
ddf12ef8-cd47-4519-9a25-f0ed845b8818	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	a83f9e6ac6fdfe4b549979fa5433744f617cafd0573927ba6d00e4d10b7e3d83	\N	2025-08-27 16:50:27.538
2a3f3397-0427-431d-b488-c2663bb258fa	9f411086-721a-4992-ba91-6e94759c0c52	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	a83f9e6ac6fdfe4b549979fa5433744f617cafd0573927ba6d00e4d10b7e3d83	\N	2025-08-27 16:51:55.785
209ee8e3-7d95-499d-9d29-d3416e8586e4	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	8926857e7b064e4399b157ccfdf17c0108564951ac80c550bb351cb478cf3134	\N	2025-08-27 20:07:13.466
a8addbba-23ae-4110-b3ee-2b0417effb80	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	8b7fbb115342ee6cfc092829a3170bf4958b3476dff788ab2338ead8a299d551	\N	2025-08-28 01:04:39.864
7e4c1a8f-d687-41e6-9781-466ceffc6555	bdf1446c-1f22-4593-9894-249078155418	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	44e85cad03cf5070575286eb80036a4eb24ebfa2687e277e1364995606758f54	\N	2025-08-29 02:46:46.219
bed2fb80-a796-427a-b931-0ffa97176d42	3bed2884-74a1-4d4b-9d62-8ec443d6a19b	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-30 02:06:27.897
dda3f598-b00e-4753-b6d2-f65508621967	3bed2884-74a1-4d4b-9d62-8ec443d6a19b	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	3d7c315cd90667d7153569606d730358fddba18fe9d16f5419fd2ac5bbd8663b	\N	2025-08-30 02:07:29.184
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "createdAt", "updatedAt") FROM stdin;
a290d46f-deb8-4404-9bab-2280bcdcc9fe	test@test.com	2025-08-02 00:45:44.136	2025-08-02 00:45:44.136
430c3546-d737-4e22-8afc-4db735cc40de	test-1754104522473@example.com	2025-08-02 03:15:24.192	2025-08-02 03:15:24.192
ae0e0aef-ee11-4eb4-98de-7b63bae0c664	test-1754104726106@example.com	2025-08-02 03:18:48.437	2025-08-02 03:18:48.437
726d7571-2f28-4a38-add9-cd39a02ad69a	test-1754104726540@example.com	2025-08-02 03:18:48.903	2025-08-02 03:18:48.903
c1118846-4d41-47ec-95e1-f1678476e150	test-1754104728632@example.com	2025-08-02 03:18:49.754	2025-08-02 03:18:49.754
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-08-02 00:05:53
20211116045059	2025-08-02 00:05:56
20211116050929	2025-08-02 00:05:58
20211116051442	2025-08-02 00:06:00
20211116212300	2025-08-02 00:06:03
20211116213355	2025-08-02 00:06:05
20211116213934	2025-08-02 00:06:07
20211116214523	2025-08-02 00:06:10
20211122062447	2025-08-02 00:06:12
20211124070109	2025-08-02 00:06:14
20211202204204	2025-08-02 00:06:16
20211202204605	2025-08-02 00:06:19
20211210212804	2025-08-02 00:06:26
20211228014915	2025-08-02 00:06:28
20220107221237	2025-08-02 00:06:30
20220228202821	2025-08-02 00:06:32
20220312004840	2025-08-02 00:06:34
20220603231003	2025-08-02 00:06:38
20220603232444	2025-08-02 00:06:40
20220615214548	2025-08-02 00:06:42
20220712093339	2025-08-02 00:06:45
20220908172859	2025-08-02 00:06:47
20220916233421	2025-08-02 00:06:49
20230119133233	2025-08-02 00:06:51
20230128025114	2025-08-02 00:06:54
20230128025212	2025-08-02 00:06:56
20230227211149	2025-08-02 00:06:58
20230228184745	2025-08-02 00:07:01
20230308225145	2025-08-02 00:07:03
20230328144023	2025-08-02 00:07:05
20231018144023	2025-08-02 00:07:07
20231204144023	2025-08-02 00:07:11
20231204144024	2025-08-02 00:07:13
20231204144025	2025-08-02 00:07:15
20240108234812	2025-08-02 00:07:17
20240109165339	2025-08-02 00:07:19
20240227174441	2025-08-02 00:07:23
20240311171622	2025-08-02 00:07:26
20240321100241	2025-08-02 00:07:31
20240401105812	2025-08-02 00:07:37
20240418121054	2025-08-02 00:07:40
20240523004032	2025-08-02 00:07:48
20240618124746	2025-08-02 00:07:50
20240801235015	2025-08-02 00:07:52
20240805133720	2025-08-02 00:07:54
20240827160934	2025-08-02 00:07:56
20240919163303	2025-08-02 00:07:59
20240919163305	2025-08-02 00:08:02
20241019105805	2025-08-02 00:08:04
20241030150047	2025-08-02 00:08:12
20241108114728	2025-08-02 00:08:15
20241121104152	2025-08-02 00:08:17
20241130184212	2025-08-02 00:08:20
20241220035512	2025-08-02 00:08:22
20241220123912	2025-08-02 00:08:24
20241224161212	2025-08-02 00:08:26
20250107150512	2025-08-02 00:08:28
20250110162412	2025-08-02 00:08:30
20250123174212	2025-08-02 00:08:33
20250128220012	2025-08-02 00:08:35
20250506224012	2025-08-02 00:08:36
20250523164012	2025-08-02 00:08:39
20250714121412	2025-08-02 00:08:41
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
qr-logos	qr-logos	\N	2025-08-04 00:25:08.591889+00	2025-08-04 00:25:08.591889+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-02 00:05:51.287319
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-02 00:05:51.300499
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-08-02 00:05:51.302922
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-02 00:05:51.330073
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-02 00:05:51.352319
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-02 00:05:51.355285
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-08-02 00:05:51.359926
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-02 00:05:51.363038
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-02 00:05:51.365439
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-08-02 00:05:51.368091
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-08-02 00:05:51.372452
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-02 00:05:51.375629
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-02 00:05:51.381727
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-02 00:05:51.384614
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-02 00:05:51.388523
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-02 00:05:51.41001
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-02 00:05:51.412971
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-02 00:05:51.415917
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-02 00:05:51.420398
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-02 00:05:51.425522
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-02 00:05:51.428217
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-02 00:05:51.4331
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-02 00:05:51.451748
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-02 00:05:51.468118
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-02 00:05:51.471888
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-02 00:05:51.475583
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-08-30 00:57:38.205681
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-08-30 00:57:38.524172
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-08-30 00:57:38.547683
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-08-30 00:57:38.603815
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-08-30 00:57:38.624602
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-08-30 00:57:38.637489
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-08-30 00:57:38.702432
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-08-30 00:57:38.721197
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-08-30 00:57:38.726745
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-08-30 00:57:38.752771
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-08-30 00:57:38.819242
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-08-30 00:57:38.903134
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-08-30 00:57:38.931959
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
60517db5-d73e-49ff-806d-4c28af644937	qr-logos	a290d46f-deb8-4404-9bab-2280bcdcc9fe/1754268359240.png	\N	2025-08-04 00:45:59.741569+00	2025-08-30 00:57:38.606006+00	2025-08-04 00:45:59.741569+00	{"eTag": "\\"3ff2c19c2df1f9257072ae872c8d0613\\"", "size": 26154, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T00:46:00.000Z", "contentLength": 26154, "httpStatusCode": 200}	b340444e-4637-4ac3-a546-0b4f7932df78	\N	{}	2
ccfa91b6-491d-4654-8e40-ee883e716b3e	qr-logos	a290d46f-deb8-4404-9bab-2280bcdcc9fe/1754270795522.png	\N	2025-08-04 01:26:35.997952+00	2025-08-30 00:57:38.606006+00	2025-08-04 01:26:35.997952+00	{"eTag": "\\"3ff2c19c2df1f9257072ae872c8d0613\\"", "size": 26154, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-04T01:26:36.000Z", "contentLength": 26154, "httpStatusCode": 200}	4f28a594-87d7-4b5e-acc0-6db8437fc423	\N	{}	2
f54bd4e4-2705-43ec-b116-176bdb419fb6	qr-logos	a290d46f-deb8-4404-9bab-2280bcdcc9fe/1755495686978.png	\N	2025-08-18 05:41:27.205057+00	2025-08-30 00:57:38.606006+00	2025-08-18 05:41:27.205057+00	{"eTag": "\\"3ff2c19c2df1f9257072ae872c8d0613\\"", "size": 26154, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-18T05:41:28.000Z", "contentLength": 26154, "httpStatusCode": 200}	461a6ec1-ed9c-4f4a-8211-e630721c40e3	\N	{}	2
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
qr-logos	a290d46f-deb8-4404-9bab-2280bcdcc9fe	2025-08-30 00:57:38.551236+00	2025-08-30 00:57:38.551236+00
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 65, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: links links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT links_pkey PRIMARY KEY (id);


--
-- Name: qr_codes qr_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_pkey PRIMARY KEY (id);


--
-- Name: scans scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT scans_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: clients_ownerUserId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "clients_ownerUserId_key" ON public.clients USING btree ("ownerUserId");


--
-- Name: domains_clientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "domains_clientId_idx" ON public.domains USING btree ("clientId");


--
-- Name: domains_hostname_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX domains_hostname_key ON public.domains USING btree (hostname);


--
-- Name: qr_codes_shortCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "qr_codes_shortCode_key" ON public.qr_codes USING btree ("shortCode");


--
-- Name: qr_codes_userId_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_userId_deletedAt_idx" ON public.qr_codes USING btree ("userId", "deletedAt");


--
-- Name: qr_codes_userId_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_userId_position_idx" ON public.qr_codes USING btree ("userId", "position");


--
-- Name: scans_qrCodeId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scans_qrCodeId_createdAt_idx" ON public.scans USING btree ("qrCodeId", "createdAt");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: domains domains_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT "domains_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: links links_qrCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.links
    ADD CONSTRAINT "links_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES public.qr_codes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: qr_codes qr_codes_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "qr_codes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: qr_codes qr_codes_domainId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "qr_codes_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES public.domains(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: qr_codes qr_codes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scans scans_qrCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT "scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES public.qr_codes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Give users authenticated access to folder 1g4fzi4_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give users authenticated access to folder 1g4fzi4_0" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'qr-logos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Give users authenticated access to folder 1g4fzi4_1; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give users authenticated access to folder 1g4fzi4_1" ON storage.objects FOR SELECT USING (((bucket_id = 'qr-logos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Give users authenticated access to folder 1g4fzi4_2; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give users authenticated access to folder 1g4fzi4_2" ON storage.objects FOR UPDATE USING (((bucket_id = 'qr-logos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Give users authenticated access to folder 1g4fzi4_3; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give users authenticated access to folder 1g4fzi4_3" ON storage.objects FOR DELETE USING (((bucket_id = 'qr-logos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE _prisma_migrations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public._prisma_migrations TO anon;
GRANT ALL ON TABLE public._prisma_migrations TO authenticated;
GRANT ALL ON TABLE public._prisma_migrations TO service_role;


--
-- Name: TABLE clients; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clients TO anon;
GRANT ALL ON TABLE public.clients TO authenticated;
GRANT ALL ON TABLE public.clients TO service_role;


--
-- Name: TABLE domains; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.domains TO anon;
GRANT ALL ON TABLE public.domains TO authenticated;
GRANT ALL ON TABLE public.domains TO service_role;


--
-- Name: TABLE links; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.links TO anon;
GRANT ALL ON TABLE public.links TO authenticated;
GRANT ALL ON TABLE public.links TO service_role;


--
-- Name: TABLE qr_codes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.qr_codes TO anon;
GRANT ALL ON TABLE public.qr_codes TO authenticated;
GRANT ALL ON TABLE public.qr_codes TO service_role;


--
-- Name: TABLE scans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.scans TO anon;
GRANT ALL ON TABLE public.scans TO authenticated;
GRANT ALL ON TABLE public.scans TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict o8bRZfe3LWFGfkO9XnfON398XWoydfFTZgrTtyYiZycUxsbLkLtSgQ0ZkYnFQee

