"use strict";

import { resolve } from "dns";

const axios = require('axios');
const ObjectsToCsv = require('objects-to-csv');
const dayjs = require('dayjs');

const getData = new Promise(async function (resolve, reject) {
  const endpoint = "https://hub.snapshot.org/graphql";
  const headers = {
    "content-type": "application/json",
  };
  const data = [];
  let counter = 0; // for debugging
  let i = 0; // get only 10000 data each time
  let status = true; // true if there is more data to get
  console.log("retrieve data");
  while (status) {
    console.log('get data for page ' + i / 10000);
    try {
      const interval = setInterval(() => {
        counter++;
      }, 1000)
      const graphqlQuery = {
        "operationName": "Votes",
        "query": `query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {\n  votes(\n    first: $first\n    skip: $skip\n    where: {proposal: $id, vp_gt: 0, voter: $voter}\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n        voter\n    choice\n  created    }\n}`,
        "variables": {
          "id": "0xdd1c21a41e63df9f23d8ad99c13af492440cc58047f6117dd5021ccec97018bf",
          "first": 10000,
          "orderBy": "created",
          "orderDirection": "asc",
          "skip": i // get data from skip to skip + 10000
        }
      };
      const response = await axios({
        url: endpoint,
        method: 'post',
        headers: headers,
        data: graphqlQuery
      });
      if (response.data.data.votes.length > 0) { // check if there is data
        data.push(response.data.data.votes);
        i += 10000;
        clearInterval(interval);
        console.log('time to retrieve', counter);
        counter = 0
      }
      else {
        clearInterval(interval);
        console.log("done");
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
  created: number;
  isBeforeDate: number;
}
const resolveData = async () => {
  const data = await getData as Array<Vote>;
  data.map(vote => {
    if (dayjs.unix(vote.created).isBefore(dayjs.unix(1650009900))) {
      vote.isBeforeDate = 1;

    }
    else {
      vote.isBeforeDate = 0;
    }
  })
  const csv = new ObjectsToCsv(data);
  await csv.toDisk('./voteResult.csv');

}

resolveData();




