import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        // Get callback data from MPESA
        const callbackData = await request.json();
        console.log(
            "MPESA Callback received:",
            JSON.stringify(callbackData, null, 2)
        );

        // Extract the necessary information from the callback
        const { Body } = callbackData;

        if (!Body || !Body.stkCallback) {
            return NextResponse.json(
                { message: "Invalid callback data structure" },
                { status: 400 }
            );
        }

        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
            Body.stkCallback;

        if (ResultCode === 0) {
            // If the transaction was successful, extract additional details
            let amount = 0;
            let phoneNumber = "";
            let transactionId = "";
            let transactionDate = new Date();
            const items = Body.stkCallback.CallbackMetadata.Item;

            // Extract details from callback metadata
            for (const item of items) {
                if (item.Name === "Amount") amount = item.Value;
                if (item.Name === "PhoneNumber")
                    phoneNumber = item.Value.toString();
                if (item.Name === "MpesaReceiptNumber")
                    transactionId = item.Value;
                if (item.Name === "TransactionDate")
                    transactionDate = new Date(item.Value);
            }

            try {
                await prisma.transaction.update({
                    where: {
                        checkoutRequestId: CheckoutRequestID,
                        merchantRequestId: MerchantRequestID,
                        amount: amount,
                        phoneNumber: phoneNumber,
                    },
                    data: {
                        status: "COMPLETED",
                        resultCode: ResultCode,
                        resultDesc: ResultDesc,
                        transactionDate: transactionDate,
                        transactionId: transactionId,
                    },
                });
            } catch (dbError) {
                console.error("Database update error:", dbError);
                // Even if DB update fails, return success to MPESA
                return NextResponse.json({
                    ResultCode: 0,
                    ResultDesc: "Callback received successfully",
                });
            }
        } else if (ResultCode === 1032) {
            // If the transaction failed, update the status in the database
            try {
                await prisma.transaction.update({
                    where: {
                        checkoutRequestId: CheckoutRequestID,
                        merchantRequestId: MerchantRequestID,
                    },
                    data: {
                        status: "FAILED",
                        resultCode: ResultCode,
                        resultDesc: ResultDesc,
                    },
                });
            } catch (dbError) {
                console.error("Database update error:", dbError);
            }
        }

        // Always respond with success to MPESA to acknowledge receipt
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Callback received successfully",
        });
    } catch (error) {
        console.error("MPESA Callback processing error:", error);
        // Still return success to MPESA even if we had an error processing
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Callback received",
        });
    }
}
