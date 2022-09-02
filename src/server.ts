import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express"
import express from "express"
import { z } from "zod";

interface IUser {
    id: string,
    name: string,
    age: number
}

const users: IUser[] = [{
    id: "1", name: "Henrique", age: 27
}, {
    id: "2", name: "Santos", age: 26
}]

const appRouter = trpc
    .router()
    .query("getUser", {
        input: z.string({ description: "id" }),
        output: z.object({
            id: z.string(),
            name: z.string().min(2),
            age: z.number().int()
        }).optional(),
        async resolve(req) {
            console.log(req)
            return users.find((user) => user.id === req.input)
        }
    })
    .mutation("createUser", {
        input: z.object({
            name: z.string().min(2),
            age: z.number().int()
        }),
        output: z.string(),
        async resolve(req) {
            users.push({ id: Math.random().toString(), name: req.input.name, age: req.input.age })
            return "Create User Success"
        }
    })


const app = express();
const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => ({})
type Context = trpc.inferAsyncReturnType<typeof createContext>;

app.use("/trpc", trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
}))

app.listen(4000, () => console.log("running"))