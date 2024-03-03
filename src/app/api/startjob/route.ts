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

import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSClient } from "@aws-sdk/client-sqs";
// Set the AWS Region.
const REGION = "us-east-2";
// Create SQS service object.
const sqsClient = new SQSClient({ region: REGION });

export async function POST(request: NextRequest) {
    try{
      const { userId } = await getAuth(request);


      const body = await request.json();
      const s3Name = body.s3Name;
      const params = {
        DelaySeconds: 0,
        MessageAttributes: {
        },
        MessageBody:
        s3Name,
        MessageDeduplicationId: s3Name,  //SQS_MESSAGE_DEDUPLICATION_ID; e.g., ‘TheWhistler’
        QueueUrl: "https://sqs.us-east-2.amazonaws.com/471112968137/intonguesverify.fifo", //SQS_QUEUE_URL; e.g., ‘https://sqs.REGION.amazonaws.com/ACCOUNT-ID/QUEUE-NAME’
        MessageGroupId: "Group1", //SQS_MESSAGE_GROUP_ID; e.g., ‘Group1’
      }; 
      

      if(s3Name.split("%")[0] == userId){
        const data = await sqsClient.send(new SendMessageCommand(params));
      }
      
      
      return new Response(JSON.stringify({uploadUrl: "hi"}), { status: 200 })
  }catch(err){
    console.log(err);
    return new Response(err, { status: 500 })
  }
}

