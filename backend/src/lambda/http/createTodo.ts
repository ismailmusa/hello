import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createTodo } from '../../businessLogic/todos';
import {CreateTodoRequest} from '../../requests/CreateTodoRequest';
import {getUserId} from '../utils';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const Todo: CreateTodoRequest = JSON.parse(event.body);
  const Id = getUserId(event);
  console.log('Processing event: ', event);
  try {
    const Items = await createTodo(Todo, Id);
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: Items
      })
    }

  } catch (e) {
    console.log(e)
    return {
      statusCode: e.status || 500,
      body: JSON.stringify({
        error: `Failed to create todo due to: ${e}`
      })
    }
  }
});

handler.use(
  cors({
    credentials: true
  })
);

