import https from "https";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@smithy/protocol-http";
import {
  getSignedUrl,
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@smithy/hash-node";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server';
import { clerkClient } from "@clerk/nextjs";
import { PrismaClient, Prisma } from '@prisma/client'


export async function GET(request: NextRequest) {
    try{
    const { userId } = await getAuth(request);
    // if(!userId){
    //   return new Response(JSON.stringify({error: "Unauthorized"}), { status: 401 })
    // }
    if(!userId){
      return NextResponse.redirect('/signup');
    }
    var user = await clerkClient.users.getUser(userId);
    
    // console.log(user);
    // console.log(user.privateMetadata['fileIndex']);
    // console.log("HERE")
    // console.log(user.privateMetadata['fileIndex'])
    // console.log(user.privateMetadata['fileIndex']);
    // console.log(user);
    const prisma = new PrismaClient()

    const firstQueryResults = await prisma.file.findMany({
      take: 20,
      where: {
        owner: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    
    console.log(firstQueryResults);
    return new Response(JSON.stringify({files: firstQueryResults}), { status: 200 })
  }catch(err){
    console.log(err);
    // @ts-ignore
    return new Response(err, { status: 500 })
  }
}

