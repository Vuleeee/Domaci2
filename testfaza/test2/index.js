const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3000;


const uri = "bolt://localhost:7687";
const user = "neo4j";
const password = "123qweasdzxc";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();


app.get('/trazi-po-sastojku', async (req, res) => {
  try {
    const sastojciiZaPretragu = ['sastojak1', 'sastojak2'];
    const nadjenaJela = await traziPoSastojku(sastojciiZaPretragu);
    res.json(nadjenaJela);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


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


app.get('/brisi-jelo', async (req, res) => {
  try {
    const imeJela = 'neko-jelo';
    await brisiJelo(imeJela);
    res.send(`Jelo '${imeJela}' uspešno obrisano.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/dodaj-jelo', async (req, res) => {
  try {
    const podOJelu = { ime: 'NovoJelo', opis: 'Opis novog jela', nacin_pripreme: 'Nacin pripreme novog jela' };
    await dodajJelo(podOJelu);
    res.send(`Jelo '${podOJelu.ime}' uspešno dodato.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/updejt-rejtinga-jela', async (req, res) => {
  try {
    const imeJela = 'neko-jelo';
    const menjaRejt = 1;
    await updejtRejtingaJela(imeJela, menjaRejt);
    res.send(`Rejting jela '${imeJela}' uspešno ažuriran.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

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


async function izvuciJelaPoRejt(minRejting) {
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


async function brisiJelo(imeJela) {
  try {
    await session.run(
      `
      MATCH (jelo:Jelo {ime: $imeJela})
      DETACH DELETE jelo
      `,
      { imeJela }
    );
    console.log(`Jelo '${imeJela}' uspešno obrisano.`);
  } catch (error) {
    console.error('Greška prilikom brisanja jela:', error);
    throw error;
  }
}


async function dodajJelo(podOJelu) {
  try {
    const result = await session.writeTransaction(async txc => {
      const existingsastojciiResult = await txc.run(
        `
        UNWIND $sastojcii AS sastojak
        MERGE (s:Sastojak {ime: sastojak})
        `,
        { sastojcii: podOJelu.sastojci }
      );

      const jeloRezultat = await txc.run(
        `
        CREATE (jelo:Jelo {ime: $ime, opis: $opis, nacin_pripreme: $nacin_pripreme})
        WITH jelo
        UNWIND $sastojci AS sastojak
        MATCH (s:Sastojak {ime: sastojak})
        CREATE (jelo)-[:SADRZI]->(s)
        `,
        podOJelu
      );

      return jeloRezultat;
    });
    console.log(`Jelo '${podOJelu.ime}' uspešno dodato.`);
  } catch (error) {
    console.error('Greška prilikom dodavanja jela:', error);
    throw error;
  }
}


async function updejtRejtingaJela(imeJela, menjaRejt) {
  try {
    const result = await session.run(
      `
      MATCH (jelo:Jelo {ime: $imeJela})
      SET jelo.rejting = jelo.rejting + $menjaRejt
      RETURN jelo.rejting AS noviRejting
      `,
      { imeJela, menjaRejt }
    );
    const noviRejting = result.records[0].get('noviRejting');
    console.log(`Rejting jela '${imeJela}' ažuriran na ${noviRejting}.`);
  } catch (error) {
    console.error('Greška prilikom ažuriranja rejtinga jela:', error);
    throw error;
  }
}
