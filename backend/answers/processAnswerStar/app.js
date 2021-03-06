/*
  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify,
  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict'

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION
const docClient = new AWS.DynamoDB.DocumentClient() 

// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const message = JSON.parse(record.body)
        await saveToDDB(message)
      } catch (err) {
        console.error(`Handler error: ${err}`)
      }
    })
  )
}

// Save single item to DynamoDB
const saveToDDB = async (message) => {
  console.log(message)
  try {
    const body = JSON.parse(message.body)

    const params = {
      TableName: process.env.TableName,
      Item: {
        PK: body.question.rangeKey,
        SK: message.uid,
        latitude: body.question.latitude,
        longitude: body.question.longitude,
        lastUpdated: Date.now(),
        value: body.rating,
        type: 'Star'
      }
    }

    // Save to DDB 
    const result = await docClient.put(params).promise()
    console.log(result)

  } catch (err) {
    console.error(`Error: ${err}`)
  }
}