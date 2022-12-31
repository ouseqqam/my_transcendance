// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class FriendService {
//     constructor(private prisma: PrismaService) {}

//     async getFriends(id: number) {
//         return await this.prisma.user.findMany({
//             where: {
//                 OR: [{
//                     sender: {
//                         some: {
//                             accepted: true,
//                             user2: Number(id),
//                         },
//                     }
//                 },
//                 {
//                 reciver: {
//                     some: {
//                         accepted: true,
//                         user1: Number(id),
//                     },
//                 }
//                 }
//             ]
//             },
//         })
//     }
// }
