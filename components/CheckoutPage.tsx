"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Button } from "./ui/button";
import Image from "next/image";
import { set } from "mongoose";
interface CheckoutPageProps {
  amount: number;
  imageUrl: string;
  programName: string;
}
const CheckoutPage: React.FC<CheckoutPageProps> = ({
  amount,
  imageUrl,
  programName,
}) => {
  {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        });
    }, [amount]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      if (!stripe || !elements) {
        return;
      }
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setErrorMessage(submitError.message);
        setLoading(false);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: "https://gymtalk.ca/success",
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }

      setLoading(false);
    };

    if (!clientSecret || !stripe || !elements) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="relative w-24 h-24">
            <svg
              className="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="#818cf8"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="#4f46e5"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="py-6 sm:py-8 md:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center px-4 sm:px-6 md:px-8 lg:px-12">
            You Are One Step Away From Taking Your Calisthenics To The Next
            Level
          </h1>
        </div>

        <div className="flex flex-col md:flex-row w-full max-w-[1200px] mx-auto flex-grow px-4 sm:px-6 md:px-8 lg:px-12 gap-8 items-start">
          {/* Left Section (Image) */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="text-center mb-4 h-16 flex items-center justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold px-2">
                Program name: {programName}
              </h2>
            </div>
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt="Calisthenics Program"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right Section (Checkout) */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="text-center mb-4 h-16 flex items-center justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                Secure Checkout with Stripe
              </h2>
            </div>
            <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-white text-black w-full">
              <form onSubmit={handleSubmit} className="flex flex-col">
                {clientSecret && (
                  <div className="mb-6">
                    <PaymentElement />
                  </div>
                )}
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-400 text-primary-foreground py-2 sm:py-3 text-base sm:text-lg font-semibold"
                  disabled={loading || !stripe}
                >
                  {!loading ? `Pay: $${amount} CAD` : "Processing..."}
                </Button>
              </form>
              <div className="mt-6 text-sm text-indigo-600 space-y-2">
                <p>✓ Secure, encrypted payment</p>
                <p>✓ Instant access after payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default CheckoutPage;
