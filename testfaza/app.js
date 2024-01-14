const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3000;


const driver = neo4j.driver("bolt://localhost:3000", neo4j.auth.basic("StaCuDaJedem", "123qweasdzxc"));
const session = driver.session();

async function traziPoSastojku(sastojcii) {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

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
  } finally {
    await session.close();
    await driver.close();
  }
}

const sastojciiZaPretragu = ['sastojak1', 'sastojak2'];// treba samo uzmes sta korisnik unosi u bar
traziPoSastojku(sastojciiZaPretragu)
  .then(nadjenaJela => {
    console.log('Pronađena jela:', nadjenaJela);
  })
  .catch(error => {
    console.error('Greška:', error);
  });


  async function izvuciJelaPoRejt(minRejting) {
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();
  
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
    } finally {
   
      await session.close();
      await driver.close();
    }
  }

  
  async function brisiJelo(imeJela) {
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();
  
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
    } finally {
      await session.close();
      await driver.close();
    }
  }
  async function dodajJelo(podOJelu) {
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();
  
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
    } finally {
      await session.close();
      await driver.close();
    }
  }
  async function updejtRejtingaJela(imeJela, menjaRejt) {
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();
  
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
    } finally {
      await session.close();
      await driver.close();
    }
  }