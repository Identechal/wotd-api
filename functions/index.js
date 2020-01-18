const functions = require('firebase-functions');
const admin = require('firebase-admin');
// 3rd Party
const HttpStatus = require('http-status-codes');

admin.initializeApp();

const db = admin.firestore();

const wordsRef = db.collection('words');



exports.addWord = functions.https.onRequest(async (req, res) => {
	const original = req.query.word;

	const snapshot = await wordsRef.doc().set({ "word": original });

	res.sendStatus(200);
});

exports.getWord = functions.https.onRequest(async (req, res) => {
	const docs = await wordsRef.listDocuments();

	var doc = docs[Math.round((Math.random() * docs.length))];

	var word = (await doc.get()).get("word");

	res.send(200, word);
});