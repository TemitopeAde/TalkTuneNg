import { Check } from "lucide-react";
import React from "react";
import PrimaryBtn from "../buttons/PrimaryBtn";

const AuthModal = () => {
  return (
    <div className="absolute flex bg-background/90 h-[500px] z-50 backdrop-blur-lg w-[500px] rounded-lg justify-center items-center ">
      <div className="flex gap-4 flex-col justify-center items-center">
        <div className="bg-green-800 h-20 w-20 justify-center items-center flex rounded-full">
          <Check className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold">Reset Successful</h1>
        <span className="mb-4">Password reset successful proceed to login</span>

        <PrimaryBtn label="Proceed to Login" />
      </div>
    </div>
  );
};

export default AuthModal;
