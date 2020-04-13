import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todo-access')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.TODOS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.TODOS_TABLE_IDX
  ) {
    //
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info(`Creating a todo with ID ${todo.todoId}`)

    const newItem = {
      ...todo,
      attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${todo.todoId}`
    }

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newItem
      })
      .promise()

    return todo
  }

  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info(`Updating a todo with ID ${todo.todoId}`)

    const updateExpression = 'set #n = :name, dueDate = :dueDate, done = :done'

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: todo.userId,
          todoId: todo.todoId
        },
        UpdateExpression: updateExpression,
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done,
          ':todoId': todo.todoId
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return todo
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info(`Deleting a todo with ID ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()

    return userId
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}

const createDynamoDBClient = () => {
  return new XAWS.DynamoDB.DocumentClient()
}
