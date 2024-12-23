"use server"
// just  to see what is happeing from client send into server side
export const serverLogger = async (variable, state) => {
    console.log(`current ${variable}`, state);
}