import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId: string = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

      const jwtToken: string = getToken(event.headers.Authorization)

      await updateTodo(todoId, updatedTodo, jwtToken)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      }
    } catch (e) {
      logger.error('Error', { error: e.message })

      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)
