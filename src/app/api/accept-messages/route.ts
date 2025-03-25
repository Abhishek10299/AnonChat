import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { acceptMessagesSchema } from "@/schemas/acceptMessageSchema";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }
  const userId = user?._id;

  try {
    const { acceptMessages } = await request.json();
    const result = acceptMessagesSchema.safeParse({ acceptMessages });
    if (!result.success) {
      const acceptMessagesSchemaError =
        result.error.format().acceptMessages?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            acceptMessagesSchemaError?.length > 0
              ? acceptMessagesSchemaError.join(",")
              : "Invalid quary paramaters",
        },
        { status: 400 }
      );
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status to accept messages",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Meassage acceptance status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept messages");
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }
  const userId = user?._id;
  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: false,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept messages");
    return Response.json(
      {
        success: false,
        message: "Error in geting message acceptance status",
      },
      { status: 500 }
    );
  }
}
