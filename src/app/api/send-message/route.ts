import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { Message } from "@/model/User";
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();
  try {
    const result=messageSchema.safeParse({content})
    if(!result.success){
      const messageSchemaError=result.error.format().content?._errors||[];
      return Response.json({
        success: false,
        message:
        messageSchemaError?.length > 0
            ? messageSchemaError.join(",")
            : "Invalid quary paramaters",
      },
      { status: 400 })
    }
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    //is user accepting the messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting the messages",
        },
        { status: 403 }
      );
    }

    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);

    await user.save()
    return Response.json(
      {
        success: true,
        message: "message sent successfully",
      },
      { status: 401 }
    );
    
  } catch (error) {
    console.log("Error in sending message", error);
    return Response.json(
      {
        success: false,
        message: "Error in sending message",
      },
      { status: 500 }
    );
  }
}
