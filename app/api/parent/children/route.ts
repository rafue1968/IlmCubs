// export const runtime = "nodejs"

// import { prisma } from "@/app/lib/prisma";
// import { getOAuthUserId } from "../../../lib/auth/getCurrentUser";
// import { ensureUser } from "../../../lib/user/ensureUser";

// export async function GET() {
//   try {
//     const oauthUserId = await getOAuthUserId();

//     if (!oauthUserId) {
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const user = await ensureUser(oauthUserId);

//     const children = await prisma.child.findMany({
//       where: {
//         parentId: user.parentProfile!.id,
//       },
//       include: {
//         streak: true,
//         bookmarks: true,
//       }
//     });

//     return Response.json({ children });
//   } catch (err) {
//     console.error(err);

//     console.error(err);

//     return Response.json(
//       { error: "Failed to fetch children" },
//       { status: 500 }
//     );
//   }
// }


// export async function POST(req: Request){
//     try {
//         const oauthUserId = await getOAuthUserId();

//         if (!oauthUserId) {
//             return Response.json({error: "Unauthorized"}, {status: 401});
//         }

//         const user = await ensureUser(oauthUserId);

//         const body = await req.json();

//         const {name, age} = body;

//         if (!name){
//             return Response.json(
//                 {error: "Name is required."},
//                 {status: 400}
//             );
//         }

//         const child = await prisma.child.create({
//             data: {
//                 name,
//                 age,

//                 parentId: user.parentProfile!.id,

//                 streak: {
//                     create: {
//                         current: 0,
//                         longest: 0,
//                     },
//                 },
//             },
//             include: {
//                 streak: true,
//             },
//         });

//         return Response.json(
//             {
//                 message: "Child created successfully",
//                 child,
//             },
//             {status: 201}
//         );
//     } catch (err) {
//         console.error(err);

//         return Response.json(
//             {error: "Failed to create child"},
//             {status: 500}
//         )
//     }
// }