const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3000;


const uri = "bolt://localhost:7687";
const user = "neo4j";
const password = "123qweasdzxc";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();





app.get('/jela-po-rejtingu', async (req, res) => {
  try {
    const minRejting = 4;
    const jelaPoRejt = await izvuciJelaPoRejt(minRejting);
    res.json(jelaPoRejt);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});








async function updejtRejtingaJela(nazivJela, promenaRejtinga) {
  try {
    const result = await session.run(
      `
      MATCH (jelo:Jelo {naziv: $nazivJela})
      SET jelo.rejting = jelo.rejting + $promenaRejtinga
      RETURN jelo.rejting AS noviRejting
      `,
      { nazivJela, promenaRejtinga }
    );

    const noviRejtingVrednost = result.records[0].get('noviRejting');
    console.log(`Rejting jela '${nazivJela}' ažuriran na ${noviRejtingVrednost}.`);
  } catch (error) {
    console.error('Greška prilikom ažuriranja rejtinga jela:', error);
    throw error;
  } finally {
    await session.close();
  }
}

//  server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


async function traziPoSastojku(sastojcii) { 
  try {
    const result = await session.run(
      `
      MATCH (jelo:Jelo)-[:SADRZI]->(sastojak:Sastojak)
      WHERE sastojak.ime IN $sastojcii
      RETURN jelo
      `,
      { sastojcii }
    );
    const nadjenaJela = result.records.map(record => record.get('jelo').properties);
    return nadjenaJela;
  } catch (error) {
    console.error('Greška prilikom pretrage jela:', error);
    throw error;
  }
}


async function izvuciJelaPoRejt(minRejting) {//done
  try {
    const result = await session.run(
      `
      MATCH (jelo:Jelo)
      WHERE jelo.rejting >= $minRejting
      RETURN jelo
      `,
      { minRejting }
    );
    const jelaPoRejt = result.records.map(record => record.get('jelo').properties);
    return jelaPoRejt;
  } catch (error) {
    console.error('Greška prilikom pretrage jela po rejtingu:', error);
    throw error;
  }
}


app.get('/jela-po-sastojcima', async (req, res) => {
  const sastojci = req.query.sastojci;

  try {
    const sastojciArray = sastojci.split(',');

    const result = await session.run(
      `
      MATCH (jelo:Jelo)-[:SADRZI]->(sastojak:Sastojak)
      WHERE sastojak.ime IN $sastojci
      RETURN jelo, COLLECT(sastojak) AS sastojci
      `,
      { sastojci: sastojciArray }
    );

    if (result.records.length === 0) {
      res.status(404).json({ error: 'Nijedno jelo nije pronađeno za date sastojke' });
      return;
    }

    const jela = result.records.map(record => {
      const jelo = record.get('jelo').properties;
      const sastojci = record.get('sastojci').map(s => s.properties);
      jelo.sastojci = sastojci;
      return jelo;
    });

    res.json(jela);
  } catch (error) {
    console.error('Greška prilikom dohvatanja jela prema sastojcima:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/obrisi-jelo/:imeJela', async (req, res) => {
  const imeJela = req.params.imeJela;

  try {
    await brisiJelo(imeJela);
    res.json({ message: `Jelo '${imeJela}' uspešno obrisano.` });
  } catch (error) {
    console.error('Greška prilikom brisanja jela:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.post('/dodaj-jelo', async (req, res) => {
    const { naziv, opis, sastojciId, rejting, nacinPripreme } = req.body;
  
    try {
      const countResult = await session.run(
        `
        MATCH (jelo:Jelo)
        RETURN COUNT(jelo) AS count
        `
      );
  
      const jeloId = countResult.records[0].get('count').toNumber() + 1;
  
      const result = await session.writeTransaction(async txc => {
        const sastojciResult = await txc.run(
          `
          UNWIND $sastojciId AS sastojakId
          MATCH (s:Sastojak {sastojakId: sastojakId})
          RETURN s
          `,
          { sastojciId }
        );
  
        const sastojci = sastojciResult.records.map(record => record.get('s'));
  
        const jeloRezultat = await txc.run(
          `
          CREATE (jelo:Jelo {jeloId: $jeloId, naziv: $naziv, opis: $opis, rejting: $rejting, nacinPripreme: $nacinPripreme})
          WITH jelo
          UNWIND $sastojci AS sastojak
          CREATE (jelo)-[:SADRZI]->(sastojak)
          RETURN jelo
          `,
          { jeloId, naziv, opis, rejting, nacinPripreme, sastojci }
        );
  
        return jeloRezultat;
      });
  
      const novoJelo = result.records[0].get('jelo').properties;
      res.status(201).json(novoJelo);
    } catch (error) {
      console.error('Greška prilikom dodavanja jela:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.get('/sastojci', async (req, res) => {
    try {
      const result = await session.run(
        `
        MATCH (sastojak:Sastojak)
        RETURN sastojak
        `
      );
  
      const sastojci = result.records.map(record => record.get('sastojak').properties);
      res.json(sastojci);
    } catch (error) {
      console.error('Greška prilikom dohvatanja svih sastojaka:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/sastojci', async (req, res) => {
    const { naziv, kategorija } = req.body;
  
    try {
      const countResult = await session.run(
        `
        MATCH (s:Sastojak)
        RETURN COUNT(s) AS count
        `
      );
  
      const sastojakId = countResult.records[0].get('count').toNumber() + 1;
  
      const result = await session.run(
        `
        CREATE (s:Sastojak {sastojakId: $sastojakId, naziv: $naziv, kategorija: $kategorija})
        RETURN s
        `,
        { sastojakId, naziv, kategorija }
      );
  
      const noviSastojak = result.records[0].get('s').properties;
      res.status(201).json(noviSastojak);
    } catch (error) {
      console.error('Greška prilikom dodavanja sastojka:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/jela/:kategorija', async (req, res) => {
    const kategorija = req.params.kategorija;
  
    try {
      const result = await session.run(
        `
        MATCH (jelo:Jelo)-[:SADRZI]->(sastojak:Sastojak {kategorija: $kategorija})
        RETURN jelo, COLLECT(sastojak) AS sastojci
        `,
        { kategorija }
      );
  
      if (result.records.length === 0) {
        res.status(404).json({ error: 'Nijedno jelo nije pronađeno za datu kategoriju sastojka' });
        return;
      }
  
      const jela = result.records.map(record => {
        const jelo = record.get('jelo').properties;
        const sastojci = record.get('sastojci').map(s => s.properties);
        jelo.sastojci = sastojci;
        return jelo;
      });
  
      res.json(jela);
    } catch (error) {
      console.error('Greška prilikom dohvatanja jela prema kategoriji sastojka:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/dodaj-jelo-sa-sastojcima', async (req, res) => {
    const { jeloId, sastojciIds } = req.body;
  
    try {
      const result = await session.writeTransaction(async txc => {

        const jeloResult = await txc.run(
          `
          MATCH (jelo:Jelo {jeloId: $jeloId})
          RETURN jelo
          `,
          { jeloId }
        );
  
        const sastojciResult = await txc.run(
          `
          UNWIND $sastojciIds AS sastojakId
          MATCH (s:Sastojak {sastojakId: sastojakId})
          RETURN s
          `,
          { sastojciIds }
        );
  
        await txc.run(
          `
          MATCH (jelo:Jelo), (sastojak:Sastojak)
          WHERE jelo.jeloId = $jeloId AND sastojak.sastojakId IN $sastojciIds
          CREATE (jelo)-[:SADRZI]->(sastojak)
          `,
          { jeloId, sastojciIds }
        );
  
        return jeloResult;
      });
  
      const jelo = result.records[0].get('jelo').properties;
      res.status(201).json(jelo);
    } catch (error) {
      console.error('Greška prilikom dodavanja veza između jela i sastojaka:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  