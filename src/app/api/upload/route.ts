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


//@ts-ignore
const createPresignedUrlWithoutClient = async ({ region, bucket, key }) => {
  const url = parseUrl(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
  const presigner = new S3RequestPresigner({
    credentials: fromIni(),
    region,
    sha256: Hash.bind(null, "sha256"),
  });

  const signedUrlObject = await presigner.presign(
    new HttpRequest({ ...url, method: "PUT" }),
  );
  return formatUrl(signedUrlObject);
};
//@ts-ignore
const createPresignedUrlWithClient = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 60 });
};
//@ts-ignore
function put(url, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method: "PUT", headers: { "Content-Length": new Blob([data]).size } },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          resolve(responseBody);
        });
      },
    );
    req.on("error", (err) => {
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

// export const main = async () => {
//   const REGION = "us-east-2";
//   const BUCKET = "intonguesaws";
//   const KEY = "example_file.txt";

//   // There are two ways to generate a presigned URL.
//   // 1. Use createPresignedUrl without the S3 client.
//   // 2. Use getSignedUrl in conjunction with the S3 client and GetObjectCommand.
//   try {
//     const noClientUrl = await createPresignedUrlWithoutClient({
//       region: REGION,
//       bucket: BUCKET,
//       key: KEY,
//     });

//     const clientUrl = await createPresignedUrlWithClient({
//       region: REGION,
//       bucket: BUCKET,
//       key: KEY,
//     });

//     // After you get the presigned URL, you can provide your own file
//     // data. Refer to put() above.
//     console.log("Calling PUT using presigned URL without client");
//     await put(noClientUrl, "Hello World");

//     console.log("Calling PUT using presigned URL with client");
//     await put(clientUrl, "Hello World");

//     console.log("\nDone. Check your S3 console.");
//   } catch (err) {
//     console.error(err);
//   }
// };



export async function POST(request: NextRequest) {
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
    if(user.privateMetadata['fileIndex'] === undefined || user.privateMetadata['fileIndex'] == null){
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          fileIndex: 1
        }
      });
    }
    else{
       await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          // @ts-ignore
          fileIndex: user.privateMetadata['fileIndex'] + 1
        }
      });
    }
    user = await clerkClient.users.getUser(userId)
    console.log("HERE")
    console.log(user.privateMetadata['fileIndex'])
    // console.log(user.privateMetadata['fileIndex']);
    var currIndex = 0
    if(user.privateMetadata['fileIndex']){
      // @ts-ignore
      currIndex = user.privateMetadata['fileIndex'];
    }
    // console.log(user);
    const body = await request.json();
    console.log(body);
    const fileTypeDict = {
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "video/mp4": "mp4",
    };

    const fileType = fileTypeDict[body.filetype as keyof typeof fileTypeDict];
    const filename = body.filename;
    const languages = body.languages;

    const REGION = "us-east-2";
    const BUCKET = "intonguesaws";
    const KEY = `${userId}%${currIndex}.${fileType}`;
    console.log(KEY);
    const clientUrl = await createPresignedUrlWithClient({
        region: REGION,
        bucket: BUCKET,
        key: KEY,
      });
    const prisma = new PrismaClient()

    const file = await prisma.file.create({
      data: {
        s3Name: KEY,
        owner: userId,
        languages: languages,
        original_name: filename,
      },
    })
    
    console.log(clientUrl);
    return new Response(JSON.stringify({uploadUrl: clientUrl, s3Name: KEY, original_name: filename, languages: []}), { status: 200 })
  }catch(err){
    console.log(err);
    //@ts-ignore
    return new Response(err, { status: 500 })
  }
}

