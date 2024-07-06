import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

initializeApp();
const db = getFirestore();

const API_KEY = defineSecret('API_KEY');
const LETTERS = /^[A-Za-z]+$/;
const WORDS_REF = db.collection('words');

export const addWord = onRequest({ secrets: ['API_KEY'] }, async (req, res) => {
  if (!isValidApiKey(req.header('Api-Key'))) {
    res.status(403).send('Invalid API key');
    return;
  }

  let word = req.query['word'];
  if (typeof word !== 'string') {
    res.status(400).send('Please provide a word as a string');
    return;
  }

  word = word.trim().toLowerCase();

  if (!word) {
    res.status(400).send('Words must have at least one letter');
    return;
  } else if (!word.match(LETTERS)) {
    res.status(400).send('Words must only contain letters');
    return;
  }

  const wordExists = !(
    await db.collection('words').where('word', '==', word).get()
  ).empty;
  if (wordExists) {
    res.status(409).send(`${word} already exists`);
    return;
  }

  await WORDS_REF.add({ word });
  res.status(201).send(`Added ${word}`);
});

export const deleteWord = onRequest(
  { secrets: ['API_KEY'] },
  async (req, res) => {
    if (!isValidApiKey(req.header('Api-Key'))) {
      res.status(403).send('Invalid API key');
      return;
    }

    let word = req.query['word'];
    if (typeof word !== 'string') {
      res.status(400).send('Please provide a word as a string');
      return;
    }

    word = word.trim().toLowerCase();

    if (!word) {
      res.status(400).send('Words must have at least one letter');
      return;
    } else if (!word.match(LETTERS)) {
      res.status(400).send('Words must only contain letters');
      return;
    }

    const snapshot = await WORDS_REF.where('word', '==', word).get();
    if (snapshot.empty) {
      res.status(200).send(`${word} doesn't exist`);
      return;
    }

    snapshot.docs.forEach(async (doc) => {
      doc.ref.delete();
    });

    res.status(200).send(`${word} was deleted`);
  },
);

export const getWord = onRequest(async (_req, res) => {
  const docs = await WORDS_REF.listDocuments();
  const word = (
    await docs[Math.round(Math.random() * (docs.length - 1))].get()
  ).get('word');
  res.status(200).send(word);
});

/**
 * @param {string?} key API Key from request headers
 * @return {boolean} Whether the key is valid
 */
function isValidApiKey(key?: string): boolean {
  return key === API_KEY.value();
}
