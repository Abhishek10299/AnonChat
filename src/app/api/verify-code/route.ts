import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();

    const result = verifySchema.safeParse({ code });
    if (!result.success) {
      const verifySchemaError = result.error.format().code?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            verifySchemaError?.length > 0
              ? verifySchemaError.join(",")
              : "Invalid quary paramaters",
        },
        {
          status: 400,
        }
      );
    }

    const decodedUsername = decodeURIComponent(username);
    console.log(decodedUsername);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 500 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.veriftCodeExpire) > new Date();
    if (isCodeNotExpired && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired please signup again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Varification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error verifying user", error);
    return Response.json(
      {
        success: false,
        message: "Error in verifying user",
      },
      { status: 500 }
    );
  }
}
