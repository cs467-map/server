# City Data

Downloaded from natural earth.

Used `shp2pgsql` to convert the shapefile into a postgresql query/instert file. Used `psql -f thatfile.sql` to get it into a temp database

Created country table with

```SQL
CREATE TABLE country(id SERIAL NOT NULL, name VARCHAR(100), code VARCHAR(3));
```

Inserted from DB with

```SQL
INSERT INTO country (name, code) SELECT DISTNICT(sov0name) as name, sov_a3 as code FROM temptable;
```

Created city table with

```SQL
CREATE TABLE city (id SERIAL NOT NULL, name VARCHAR(100), country\_id
INTEGER REFERENCES country(id), lat NUMERIC, lng NUMERIC);
```

Inserted with

```sql
INSERT INTO city(name, country\_id, lat, lng) 
SELECT temptable.name,c.id, latitude, longitude 
FROM temptable 
JOIN country AS c ON temptable.sov0name = c.name;
```

Copied these with `\copy (SELECT * FROM country)` to `'\Users\user\...\MyFileName.csv\' with csv`

# Beaches

Using coastline data from the natural earth site, I have created a table using `shp2pgsql`.

Then, I created a temp table from the city data, with postgis point geoms instead of lon/lat, using `ST_MakePoint(lon, lat)`
Since this was actually wrong, and had no srid, I had to 

Then, I merged these tables and used the `ST_DWithin` function from postgis with the following command: 

```sql
ALTER TABLE st_setsrid
ALTER TABLE coastline
ALTER COLUMN geom TYPE geometry(MULTILINESTRING, 4326)
USING ST_SetSRID(geom,4326)

SELECT id, ST_SetSRID(ST_MakePoint(lon, lat), 4326) 
INTO TABLE citygeom FROM city;

SELECT DISTINCT(cg.id), COALESCE(ST_DWithin(cl.geom:geography, cg.st_setsrid::geography, 80000), false) 
INTO TABLE beaches FROM coastline cl 
RIGHT JOIN citygeom cg ON ST_DWithin(cl.geom::geography, cg.st_setsrid::geography, 80000);
```

80,000 references meters, which is roughly 50 miles. This is from city center to coastline, and since some travellers might be willing to drive further, I have decided to include all cities that could 'reasonably'