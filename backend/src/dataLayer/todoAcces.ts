import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";


export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }

    

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Create a new todo");

        const keys = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(keys).promise();
        console.log(result);

        return todoItem as TodoItem;
    }

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        console.log("Updating the todo");

        const keys = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate['name'],
                ":dueDate": todoUpdate['dueDate'],
                ":done": todoUpdate['done']
            },
            ReturnValues: "NEW"
        };

        const result = await this.docClient.update(keys).promise();
        console.log(result);
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    async GetallTodo(userId: string): Promise<TodoItem[]> {
        console.log("fetch  all todo");

        const keys = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(keys).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[];
    }

    async deleteTodo(todoId: string, userId: string): Promise<string> {
        console.log("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    async GenerateUploadUrl(todoId: string): Promise<string> {
        console.log("Generating the upload Url");

        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });
        console.log(url);

        return url as string;
    }

}
