const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

const wordsRef = db.collection('words');



exports.addWord = functions.https.onRequest(async (req, res) => {
	const word = req.query.word;

	var wordExists = !(await wordsRef.where('word', '==', word).get()).empty;

	if (!wordExists) {
		const snapshot = await wordsRef.doc().set({ 'word': word });
		res.send(201, 'Added ' + word);
	}
	else {
		res.send(409, word + ' already exists');
	}
});

exports.getWord = functions.https.onRequest(async (req, res) => {
	const docs = await wordsRef.listDocuments();

	var doc = docs[Math.round((Math.random() * docs.length))];

	var word = (await doc.get()).get("word");

	res.send(200, word);
});