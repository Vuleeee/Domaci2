const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3000;

// Postavite podesavanja za vasu Neo4j bazu podataka
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("StaCuDaJedem", "123qweasdzxc"));
const session = driver.session();

// Definišite rutu za dobijanje svih čvorova
app.get('/nodes', async (req, res) => {
  try {
    const result = await session.run('MATCH (n) RETURN n');
    const nodes = result.records.map(record => record.get('n'));
    res.json(nodes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Zatvorite sesiju i drajver kada završite
process.on('exit', () => {
  session.close();
  driver.close();
});

// Pokrenite server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
