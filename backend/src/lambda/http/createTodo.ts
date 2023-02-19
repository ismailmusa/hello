import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest';
import {createTodo} from "../../businessLogic/Todo";
import { createTodo } from '../../logicLayer/todo'
const logger = createLogger('Todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Implement creating a new TODO item
    
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const Token = split[1];

    const Todo: CreateTodoRequest = JSON.parse(event.body);
    logger.info("processing event ")
    const Items = await createTodo(Todo, Token);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            "item": Items
        }),
    }
};
