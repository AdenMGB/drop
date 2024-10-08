import clientHandler from "~/server/internal/clients/handler";

export default defineEventHandler(async (h3) => {
  const userId = await h3.context.session.getUserId(h3);
  if (!userId) throw createError({ statusCode: 403 });

  const body = await readBody(h3);
  const clientId = await body.id;

  const data = await clientHandler.fetchInitiateClientMetadata(clientId);
  if (!data)
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired client ID.",
    });

  const token = await clientHandler.generateAuthToken(clientId);

  return `drop://handshake/${clientId}/${token}`;
});
