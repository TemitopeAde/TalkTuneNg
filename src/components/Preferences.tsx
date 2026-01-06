"use client";

import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import PrimaryBtn from "./buttons/PrimaryBtn";
import { useStore } from "@/hooks/useStore";

interface PreferenceItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface PreferencesProps {
  onPreferenceChange?: (id: string, enabled: boolean) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ onPreferenceChange }) => {
  const { onClose } = useStore();

  const [permissions, setPermissions] = useState<PreferenceItem[]>([
    { id: "contacts", label: "Allow access to contacts", enabled: true },
    { id: "calendar", label: "Allow access to calendar", enabled: true },
  ]);

  const [notifications, setNotifications] = useState<PreferenceItem[]>([
    { id: "notifications", label: "Allow notifications", enabled: true },
    { id: "other", label: "Allow....", enabled: true },
  ]);

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({
    enabled,
    onToggle,
  }) => (
    <button
      onClick={onToggle}
      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors bg-gray-400"
    >
      <span
        className={`inline-block h-[28px] w-[28px] transform rounded-full bg-slate-700 transition-transform ${enabled ? "translate-x-7" : "translate-x-1"
          }`}
      />
    </button>
  );

  const handlePermissionToggle = (id: string) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newEnabled = !item.enabled;
          onPreferenceChange?.(id, newEnabled);
          return { ...item, enabled: newEnabled };
        }
        return item;
      })
    );
  };

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newEnabled = !item.enabled;
          onPreferenceChange?.(id, newEnabled);
          return { ...item, enabled: newEnabled };
        }
        return item;
      })
    );
  };

  return (
    <div className="w-full h-full px-4 pt-8">
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">Preferences</h2>
      <div className="mt-4">
        <h3>Permissions</h3>
        <div className="space-y-6 mt-6">
          {permissions.map((permission) => (
            <div
              key={permission.id}
              className="bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-white text-base font-medium">
                {permission.label}
              </span>
              <ToggleSwitch
                enabled={permission.enabled}
                onToggle={() => handlePermissionToggle(permission.id)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h3>Notification</h3>
        <div className="space-y-6 mt-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-slate-700/60 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-white text-base font-medium">
                {notification.label}
              </span>
              <ToggleSwitch
                enabled={notification.enabled}
                onToggle={() => handleNotificationToggle(notification.id)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center items-center mt-20">
        <PrimaryBtn label="Update" containerclass="w-[400px]" />
      </div>
    </div>
  );
};

export default Preferences;
