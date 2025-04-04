import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// The base callback URL for development
const CALLBACK_BASE_URL = "https://b922-41-80-112-129.ngrok-free.app";

export async function POST(request: Request) {
    try {
        // Verify authentication
        const token = (await cookies()).get("auth_token")?.value;
        if (!token) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        const resolvedPayload = await payload;

        // Check if the payload exists
        if (!resolvedPayload) {
            return NextResponse.json(
                { message: "Invalid or missing user data" },
                { status: 401 }
            );
        }

        const { phoneNumber, amount, description } = await request.json();

        // Validate input
        if (!phoneNumber || !amount) {
            return NextResponse.json(
                { message: "Phone number and amount are required" },
                { status: 400 }
            );
        }

        // For a real implementation, you'd make an API call to MPESA like this:

        const safaricomUrl =
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        // Generate the base64 encoded password
        const dbTimestamp = new Date();
        const timestamp = dbTimestamp
            .toISOString()
            .replace(/[-T:.Z]/g, "")
            .slice(0, 14);
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;

        console.log("shortcode", shortcode);
        console.log("passkey", passkey);
        console.log("timestamp", timestamp);

        const password = Buffer.from(
            `${shortcode}${passkey}${timestamp}`
        ).toString("base64");

        // Format the phone number
        const formattedPhone = formatPhoneNumber(phoneNumber);

        // Get access token from M-Pesa
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

        if (!consumerKey || !consumerSecret) {
            throw new Error(
                "MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set"
            );
        }

        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
            "base64"
        );

        const tokenUrl =
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

        const tokenResponse = await fetch(tokenUrl, {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        if (!tokenResponse.ok) {
            throw new Error(
                `Failed to get access token: ${tokenResponse.statusText}`
            );
        }

        const { access_token } = await tokenResponse.json();

        if (!access_token) {
            throw new Error("Failed to get access token from response");
        }

        // Log the access token for debugging
        console.log("Access Token:", access_token);

        console.log("shortcode", shortcode);
        console.log("callback", `${CALLBACK_BASE_URL}/api/mpesa/callback`);

        let transactionRecord;

        try {
            console.log(
                "Initiating STK Push with payload:",
                JSON.stringify({
                    BusinessShortCode: shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: amount,
                    PartyA: formattedPhone,
                    PartyB: shortcode,
                    PhoneNumber: formattedPhone,
                    CallBackURL: `${CALLBACK_BASE_URL}/api/mpesa/callback`,
                    AccountReference: "Test Payment",
                    TransactionDesc: description || "Test Payment",
                })
            );

            const headers = new Headers();
            headers.append("Authorization", `Bearer ${access_token}`);
            headers.append("Content-Type", "application/json");

            const response = await fetch(safaricomUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    BusinessShortCode: shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: amount,
                    PartyA: formattedPhone,
                    PartyB: shortcode,
                    PhoneNumber: formattedPhone,
                    CallBackURL: `${CALLBACK_BASE_URL}/api/mpesa/callback`,
                    AccountReference: "Test Payment",
                    TransactionDesc: description || "Test Payment",
                }),
            });

            const mpesaResponse = await response.json();
            console.log("MPESA Raw Response:", JSON.stringify(mpesaResponse));

            if (!response.ok) {
                throw new Error(
                    `Failed to initiate STK Push: ${JSON.stringify(
                        mpesaResponse
                    )}`
                );
            }

            const { MerchantRequestID, CheckoutRequestID } = mpesaResponse;
            const { ResponseCode, ResponseDescription } = mpesaResponse;
            const { CustomerMessage } = mpesaResponse;
            const checkoutRequestID = CheckoutRequestID;
            const merchantRequestID = MerchantRequestID;
            const responseCode = ResponseCode;
            const responseDescription = ResponseDescription;
            const customerMessage = CustomerMessage;

            if (responseCode !== "0") {
                return NextResponse.json(
                    { message: responseDescription },
                    { status: 400 }
                );
            }

            // Store the transaction in the database
            try {
                transactionRecord = await prisma.transaction.create({
                    data: {
                        userId: resolvedPayload.userId,
                        amount: parseFloat(amount),
                        phoneNumber: formattedPhone,
                        timestamp: dbTimestamp,
                        description: description || "Test Payment",
                        checkoutRequestId: checkoutRequestID,
                        merchantRequestId: merchantRequestID,
                        responseCode: responseCode,
                        type: "STK Push",
                        customerMessage: customerMessage,
                        status: "PENDING",
                    },
                });
            } catch (dbError) {
                console.error("Database error:", dbError);
                return NextResponse.json(
                    { message: "Failed to record transaction" },
                    { status: 500 }
                );
            }

            const responseData = mpesaResponse;

            return NextResponse.json(responseData, { status: 200 });
        } catch (error) {
            console.error("STK Push API error details:", error);

            // Update transaction status to failed
            try {
                if (transactionRecord) {
                    await prisma.transaction.update({
                        where: { id: transactionRecord.id },
                        data: {
                            status: "FAILED",
                            resultDesc:
                                error instanceof Error
                                    ? error.message
                                    : "Request timeout",
                        },
                    });
                }
            } catch (dbError) {
                console.error("Failed to update transaction status:", dbError);
            }

            return NextResponse.json(
                {
                    message: "Payment request failed. Please try again.",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("STK Push API error:", error);
        return NextResponse.json(
            { message: "An error occurred processing the STK Push request" },
            { status: 500 }
        );
    }
}

// Helper function to format phone number to MPESA requirements
function formatPhoneNumber(phone: string): string {
    // Remove any non-numeric characters
    let cleaned = phone.replace(/\D/g, "");

    // If starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
        cleaned = "254" + cleaned.substring(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith("254")) {
        cleaned = "254" + cleaned;
    }

    return cleaned;
}
