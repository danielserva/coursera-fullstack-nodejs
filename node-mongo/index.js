const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dboper = require('./operations');

const url = 'mongodb+srv://admin:Sopinh%401@cluster0.lfgfq.mongodb.net/';
const dbname = 'coursera-nodejs';

MongoClient.connect(url,{poolSize: 10, bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true,useUnifiedTopology: true}, (err, client) => {
    
    assert.strictEqual(err,null);

    console.log('Connected correctly to server');

    const db = client.db(dbname);
    // const collection = db.collection("dishes");
    // collection.insertOne({"name": "Uthappizza", "description": "test"},
    // (err, result) => {
    //     assert.strictEqual(err,null);

    //     console.log("After Insert:\n");
    //     console.log(result.ops);

    //     collection.find({}).toArray((err, docs) => {
    //         assert.strictEqual(err,null);
            
    //         console.log("Found:\n");
    //         console.log(docs);

    //         db.dropCollection("dishes", (err, result) => {
    //             assert.strictEqual(err,null);

    //             client.close();
    //         });
    //     });
    // });

    dboper.insertDocument(db, { name: "Vadonut", description: "Test"},
    "dishes", (result) => {
        console.log("Insert Document:\n", result.ops);

        dboper.findDocuments(db, "dishes", (docs) => {
            console.log("Found Documents:\n", docs);

            dboper.updateDocument(db, { name: "Vadonut" },
                { description: "Updated Test" }, "dishes",
                (result) => {
                    console.log("Updated Document:\n", result.result);

                    dboper.findDocuments(db, "dishes", (docs) => {
                        console.log("Found Updated Documents:\n", docs);
                        
                        db.dropCollection("dishes", (result) => {
                            console.log("Dropped Collection: ", result);

                            client.close();
                        });
                    });
                });
        });
    });

});