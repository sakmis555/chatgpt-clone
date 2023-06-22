// edge function
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message } = await req.json();
  } catch (error) {
    console.log("An error occurred in send message:", error);
  }
}
