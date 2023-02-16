import {TodoItem} from "../models/TodoItem";
import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {TodoAccess} from "../dataLayer/todoAcces";
import { createLogger } from '../utils/logger';

const logger = createLogger('TodosAccess')
const uuidv4 = require('uuid/v4');
const data = new TodoAccess();
const Bucketname = process.env.S3_BUCKET_NAME;
const todoId =  uuidv4();
const Url = `https://${Bucketname}.s3.amazonaws.com/${todoId}`

export async function deleteTodo(todo: string, Token: string): Promise<String>  {
    const Id = parseUserId(Token);
    return data.deleteTodo(Id, todo)
}

export function updateTodo(todoUpdate: UpdateTodoRequest, todoId: string, Token: string): Promise<TodoUpdate> {
    const Id = parseUserId(Token);
    return data.updateTodo(todoUpdate, todoId, Id);
}

export async function UploadUrl(Url: string): Promise<string> {
    logger.info(`Generating upload URL for attachment ${Url}`)
    const uploadUrl = await data.GenerateUploadUrl(Url)
    return uploadUrl
  }

  export async function AllTodo(Token: string): Promise<TodoItem[]> {
    const Id = parseUserId(Token);
    return data.GetallTodo(Id);
}

export function createTodo(TodoRequest: CreateTodoRequest, Token: string): Promise<TodoItem> {
    const Id = parseUserId(Token);
    return data.createTodo({
        userId: Id,
        todoId: todoId, 
        createdAt: new Date().getTime().toString(),
        attachmentUrl:  Url, 
        done: false,
        ...TodoRequest,
    });
}


export function generateUploadUrl(todoId: string): Promise<string> {
    return todoAccess.GenerateUploadUrl(todoId);
}

export function deleteTodo(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return todoAccess.deleteTodo(todoId, userId);
}

export function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return todoAccess.updateTodo(updateTodoRequest, todoId, userId);
}
