import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../persistence/todos'

import { parseUserId } from '../auth/utils'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import { TodoS3 } from '../s3/todos'

import { createLogger } from '../utils/logger'
const logger = createLogger('Business')

const todoAccess = new TodoAccess()
const todoS3Manager = new TodoS3()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  logger.info('Listing All Todos', {
    jwtToken
  })
  const userId = parseUserId(jwtToken)

  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  logger.info('Creating Todo - createTodo', {
    createTodoRequest,
    jwtToken
  })

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  const bucketName = process.env.TODOS_S3_BUCKET
  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest,
  jwtToken: string
) {
  logger.info('Updating Todo - updateTodo', {
    todoId,
    updateTodoRequest,
    jwtToken
  })

  const userId = parseUserId(jwtToken)

  await todoAccess.updateTodo({
    todoId,
    userId,
    ...updateTodoRequest
  })
}

export async function deleteTodo(todoId: string, jwtToken: string) {
  logger.info('Deleting Todo - deleteTodo', {
    todoId,
    jwtToken
  })

  const userId = parseUserId(jwtToken)

  await todoAccess.deleteTodo(todoId, userId)
}

export async function getTodoUploadUrl(todoId: string, jwtToken: string) {
  logger.info('Getting Upload Url - getTodoUploadUrl', {
    todoId,
    jwtToken
  })

  const bucketName = process.env.TODOS_S3_BUCKET

  const userId = parseUserId(jwtToken)

  const signedUrl = await todoS3Manager.getUploadUrl(todoId)

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await todoAccess.updateTodoUrl(todoId, userId, attachmentUrl)

  return signedUrl
}
