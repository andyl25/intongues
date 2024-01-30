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



export async function GET(request: NextRequest) {
    const { userId } = await getAuth(request);
    // if(!userId){
    //   return new Response(JSON.stringify({error: "Unauthorized"}), { status: 401 })
    // }
    if(!userId){
      return NextResponse.redirect('/signup');
    }
    const user = await clerkClient.users.getUser(userId);
    
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
    // console.log(user.privateMetadata['fileIndex']);
    var currIndex = 0
    if(user.privateMetadata['fileIndex']){
      // @ts-ignore
      currIndex = user.privateMetadata['fileIndex'];
    }
    // console.log(user);
    const searchParams = request.nextUrl.searchParams
    const fileType = searchParams.get("fileType");
    const filename = searchParams.get("filename");

    const REGION = "us-east-2";
    const BUCKET = "intonguesaws";
    const KEY = `${userId}%${currIndex}%${filename}.${fileType}`;
    console.log(KEY);
    const clientUrl = await createPresignedUrlWithClient({
        region: REGION,
        bucket: BUCKET,
        key: KEY,
      });
    return new Response(clientUrl, { status: 200 })
}

