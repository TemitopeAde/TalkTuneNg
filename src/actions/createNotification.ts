"use server";

import { revalidatePath } from "next/cache";

export const createNotification = async (title: string, message: string) => {
  const res = await fetch("http://localhost:3000/api/notifications/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, message }),
  });

  if (!res.ok) {
    throw new Error("Failed to create notification");
  }

  revalidatePath("/dashboard/notifications");
  return res.json();
};
