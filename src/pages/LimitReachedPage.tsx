
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function LimitReachedPage() {
  const handleContactAdmin = () => {
    window.open("https://wa.me/621887013123?text=I%20want%20an%20unlimited%20package%20of%2030%20thousand", "_blank");
  };

  return (
    <Layout title="Daily Limit Reached" showBackButton={true}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Daily Limit Reached
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              You've used all your free daily generations.
            </p>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Daily Usage
              </span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                5/5 used today
              </span>
            </div>
            <Progress value={100} className="h-3 bg-red-100 dark:bg-red-900/30" />
          </div>

          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 my-6 text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Unlock Unlimited Access
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Contact our admin via WhatsApp to get unlimited access to our services
              for only Rp30,000.
            </p>
            <Button
              onClick={handleContactAdmin}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 mx-auto"
            >
              <MessageSquare className="h-5 w-5" />
              Contact Admin on WhatsApp
            </Button>
          </div>

          <div className="text-center text-gray-600 dark:text-gray-300 text-sm">
            <p>
              Your limit will reset in{" "}
              <span className="font-semibold">
                {new Date(new Date().setHours(23, 59, 59, 999)).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>{" "}
              today.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
