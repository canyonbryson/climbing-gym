import type { SSTConfig } from "sst";
import { Bucket, SolidStartSite, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "gym",
      region: "us-west-2",
      profile: _input.stage === "production" ? "gym-prod" : "gym-dev",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const table = new Table(stack, "userTable", {
        timeToLiveAttribute: "deleteAfter", //if deleteAfter exists on record it will be deleted after deleteAfter expires
        primaryIndex: {
          partitionKey: "pk", //electrodb magic
          sortKey: "sk",
        },
        globalIndexes: {
          gsi1: {
            partitionKey: "gsi1pk",
            sortKey: "gsi1sk",
            projection: "all", //default is all, can be keys or specific attributes
          },
        },
        fields: {
          pk: "string",
          sk: "string",
          gsi1pk: "string",
          gsi1sk: "string",
        },
      });
      const bucket = new Bucket(stack, "users");
      const site = new SolidStartSite(stack, "gym", {
        bind: [bucket, table], //binds bucket and table to site, handles permissions automagically
      });
      stack.addOutputs({
        url: site.url,
      });
    });
  },
} satisfies SSTConfig;
