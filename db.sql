CREATE TABLE spatial_ref_sys ( 
  	srid       INTEGER NOT NULL PRIMARY KEY, 
  	auth_name  VARCHAR(256), 
  	auth_srid  INTEGER, 
  	srtext     VARCHAR(2048), 
  	proj4text  VARCHAR(2048) 
);

CREATE TABLE geometry_columns ( 
  	f_table_catalog    VARCHAR(256) NOT NULL, 
  	f_table_schema     VARCHAR(256) NOT NULL,
  	f_table_nam        VARCHAR(256) NOT NULL, 
  	f_geometry_column  VARCHAR(256) NOT NULL, 
  	coord_dimension    INTEGER NOT NULL, 
  	srid               INTEGER NOT NULL, 
  	type               VARCHAR(30) NOT NULL 
);

CREATE TABLE users (
  	id serial NOT NULL,
  	name character varying(80) NOT NULL,
  	pass character(40) NOT NULL,
  	email character varying(100) NOT NULL,
  	privilege integer NOT NULL DEFAULT 0,
  	CONSTRAINT utilisateur_pkey PRIMARY KEY (id)
);

CREATE TABLE route (
	id SERIAL PRIMARY KEY,
	name VARCHAR,
	date DATE,
	level INTEGER,
	owner INTEGER REFERENCES user(id)
);
CREATE TABLE poi (
	id SERIAL PRIMARY KEY,
	name VARCHAR,
	description TEXT,
	date DATE,
	owner INTEGER REFERENCES user(id)
);

SELECT AddGeometryColumn( 'route', 'geom', 4326, 'MULTILINESTRING', 3 );
