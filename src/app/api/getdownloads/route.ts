import https from "https";

import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@smithy/hash-node";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server';
import { clerkClient } from "@clerk/nextjs";
import { PrismaClient, Prisma } from '@prisma/client'
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({ region: "us-east-2" }); // specify your region
const SIGNED_URL_EXPIRATION = 900; // The number of seconds that the Signed URL is valid

export async function GET(request: NextRequest) {
    try{
    const { userId } = await getAuth(request);
    // if(!userId){
    //   return new Response(JSON.stringify({error: "Unauthorized"}), { status: 401 })
    // }
    if(!userId){
      return NextResponse.redirect('/signup');
    }
    const prisma = new PrismaClient()
    const firstQueryResults = await prisma.outputFile.findMany({
      take: 20,
      where: {
        orig_file: {
          owner: userId,
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    var downloads = [];
    for(var i = 0; i < firstQueryResults.length; i++){
      var file = firstQueryResults[i];
      var key = file.output_s3Name;
      const bucket = "intonguesaws";
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_EXPIRATION });
      downloads.push(signedUrl);
    }

    
    console.log(firstQueryResults);
    return new Response(JSON.stringify({files: firstQueryResults, downloads: downloads}), { status: 200 })
  }catch(err){
    console.log(err);
    // @ts-ignore
    return new Response(err, { status: 500 })
  }
}

