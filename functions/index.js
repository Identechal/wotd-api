const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { key } = require('./SECRET.json');

admin.initializeApp();
const db = admin.firestore();
const wordsRef = db.collection('words');
const letters = /^[A-Za-z]+$/;

exports.addWord = functions.https.onRequest(async (req, res) => {
  if (req.header('Api-Key') != key) {
    res.send(403, `Invalid API key`);
    return;
  }

  var word = req.query.word;
  if (word == null) {
    res.send(400, `Please provide a word`);
    return;
  }
  word = word.trim().toLowerCase();

  if (word.length == 0) {
    res.send(400, `Words must have at least one letter`);
    return;
  } else if (!word.match(letters)) {
    res.send(400, `Words must only contain letters`);
    return;
  }

  var wordExists = !(await wordsRef.where('word', '==', word).get()).empty;
  if (!wordExists) {
    const snapshot = await wordsRef.doc().set({ word: word });
    res.send(201, `Added ${word}`);
  } else res.send(409, `${word} already exists`);
});

exports.deleteWord = functions.https.onRequest(async (req, res) => {
  if (req.header('Api-Key') != key) {
    res.send(403, `Invalid API key`);
    return;
  }

  var word = req.query.word;
  if (word == null) {
    res.send(400, `Please provide a word`);
    return;
  }
  word = word.trim().toLowerCase();

  if (word.length == 0) {
    res.send(400, `Words must have at least one letter`);
    return;
  } else if (!word.match(letters)) {
    res.send(400, `Words must only contain letters`);
    return;
  }

  var snapshot = await wordsRef.where('word', '==', word).get();
  if (snapshot.empty) {
    res.send(200, `${word} doesn't exist`);
    return;
  }
  snapshot.docs.forEach(async (doc) => {
    await doc.ref.delete();
  });

  res.send(200, `${word} was deleted`);
});

exports.getWord = functions.https.onRequest(async (req, res) => {
  const docs = await wordsRef.listDocuments();
  var doc = docs[Math.round(Math.random() * (docs.length - 1))];
  var word = (await doc.get()).get('word');
  res.send(200, word);
});
