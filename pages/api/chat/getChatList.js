import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("TalkGPT");
    const chats = await db
      .collection("chats")
      .find(
        {
          userId: user.sub,
        },
        {
          projection: {
            userId: 0,
            messages: 0,
          },
        }
      )
      .sort({
        _id: -1,
      })
      .toArray();

      res.status(200).json({chats})
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred when getting the chat list" });
  }
}