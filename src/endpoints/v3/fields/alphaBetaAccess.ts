import { GraphQLList, GraphQLString } from "graphql";

import { alphaBetaAccessType } from "../types/discordUsers/alphaBetaAccessType";
import { pmdDB } from "../../../db/client";

const betaUsers = pmdDB.collection("betaUsers");
const alphaUsers = pmdDB.collection("alphaUsers");

export const alphaBetaAccess = {
  type: GraphQLList(alphaBetaAccessType),
  args: {
      userId: { type: GraphQLString, defaultValue: null }
  },
  async resolve(_, args: { userId?: string }) {

    const hasBeta = await betaUsers.findOne(
      { userId: args.userId },
      { projection: { _id: false, keysLeft: false } }
    );

    const hasAlpha = await alphaUsers.findOne(
      { userId: args.userId },
      { projection: { _id: false, keysLeft: false } }
    );

    return [{
      betaAccess: hasBeta ? true : false,
      alphaAccess: hasAlpha ? true : false
    }]
  }
}