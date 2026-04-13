export async function GET() {
  return Response.json({
    success: true,
    message: "user service healthy",
  });
}
