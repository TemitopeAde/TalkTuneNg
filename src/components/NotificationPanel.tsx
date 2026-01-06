"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { User2 } from "lucide-react";

interface NotificationPanelProps {
  notifications: any[];
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
}) => {
  return (
    <div className="w-full h-full px-4">
      <div className="w-full max-w-md">
        {notifications.map((notification) => {
          const formattedTime = formatDistanceToNow(
            new Date(notification.createdAt),
            { addSuffix: true } // e.g., "5 minutes ago"
          );
          // [#8CBE41] to [#0D1E40D1]

          return (
            <div key={notification.id} className="mb-4 p-[1px] rounded-lg bg-gradient-to-r from-[#8CBE41] to-[#0D1E40D1]">
              <div className="p-4 rounded-lg bg-[#1a2942]">
                <div className="flex items-start space-x-3">
                  <img
                    src="/images/user.png"
                    alt="avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white text-base font-normal leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-white/70 text-sm font-normal mt-2">
                      {formattedTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          );
        })}
      </div>
    </div>
  );
};
