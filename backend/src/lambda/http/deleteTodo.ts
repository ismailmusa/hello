import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {deleteTodo} from "../../businessLogic/Todo";
import { createLogger } from '../../utils/logger'
const logger = createLogger('Todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Remove a TODO item by id
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const Token = split[1];
    
    const Id = event.pathParameters.todoId;
    logger.info("Proccessing delete event on todo", event )
    const Data = await deleteTodo(Id, Token);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: Data,
    }
};
