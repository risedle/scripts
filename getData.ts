"use strict";
const axios = require('axios');
const ObjectsToCsv = require('objects-to-csv');


const getData = new Promise(async function (resolve, reject) {
  const endpoint = "https://hub.snapshot.org/graphql";
  const headers = {
    "content-type": "application/json",
  };
  const data = [];
  let i = 10; // get only 10 data each time
  let status = true; // true if there is more data to get
  while (status) {
    try {
      const graphqlQuery = {
        "operationName": "Votes",
        "query": `query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {\n  votes(\n    first: $first\n    skip: $skip\n    where: {proposal: $id, vp_gt: 0, voter: $voter}\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n        voter\n    choice\n      }\n}`,
        "variables": {
          "id": "0xdd1c21a41e63df9f23d8ad99c13af492440cc58047f6117dd5021ccec97018bf",
          "first": 10,
          "skip": i // get data from skip to skip + 10
        }
      };
      const response = await axios({
        url: endpoint,
        method: 'post',
        headers: headers,
        data: graphqlQuery
      });
      if (response.data.data.votes) { // check if there is data
        data.push(response.data.data.votes);
        i += 10;
      }
      else {
        status = false;
      }
    }
    catch (err) {
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
      reject(err);
    }
  }
  resolve(data.flat());
});

type Vote = {
  voter: string;
  choice: number;

}
const resolveData = async () => {
  const data = await getData as Array<Vote>;
  const csv = new ObjectsToCsv(data);
  await csv.toDisk('./voteResult.csv');

}

resolveData();




