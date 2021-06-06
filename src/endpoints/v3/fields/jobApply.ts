import { WebhookClient } from "discord.js";
import { GraphQLList, GraphQLString } from "graphql";

import { pmdDB } from "../../../db/client";
import { getDiscordUser } from "../../../util/functions/getDiscordUser";
import { jobApplyType } from "../types/jobApply/jobApplyType";
import { questionsInputType } from "../types/jobApply/questionType";

const coll = pmdDB.collection("applications");
const webhook = new WebhookClient(
  process.env.DISCORD_WEBHOOK_ID,
  process.env.DISCORD_WEBHOOK_TOKEN
);

export const jobApply = {
  type: jobApplyType,
  args: {
    position: {
      name: "Position",
      type: GraphQLString,
    },
    input: {
      name: "Questions",
      type: GraphQLList(questionsInputType),
    },
    token: {
      name: "User token",
      type: GraphQLString,
    },
  },
  resolve(_, args: { position: string; input: []; token: string }) {
    if (!args.token) {
      return {
        error: 1,
        message: "No token providen.",
      };
    }

    if (!args.input) {
      return {
        error: 2,
        message: "No questions providen.",
      };
    }
    return new Promise((resolve, reject) => {
      getDiscordUser(args.token)
        .then(async (dUser) => {
          if (
            await coll.findOne({
              type: "job",
              userId: dUser.id,
              reviewed: false,
            })
          ) {
            return resolve({
              error: 3,
              message: "You already applied before.",
            });
          }

          coll.insertOne({
            type: "job",
            userId: dUser.id,
            reviewed: false,
            position: { name: args.position, questions: args.input },
          });

          webhook.send({
            embeds: [
              {
                title: `Job Application (${args.position})`,
                description: `By <@${dUser.id}>`,
                fields: args.input.map((q: any) => {
                  return {
                    name: q.label,
                    value: q.response ?? "No response.",
                  };
                }),
                thumbnail: {
                  url: `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`,
                },
              },
            ],
          });
          return resolve({
            message: "Job application submitted",
          });
        })
        .catch((err) => {
          return resolve({
            error: 4,
            message: err,
          });
        });
    });
  },
};
