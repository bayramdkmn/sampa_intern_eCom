import { User } from "@/app/types/User";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";

const PersonalInformation = ({ user }: { user: User }) => {
  return (
    console.log(user),
    (
      <div className="text-black flex flex-row justify-between items-center w-full">
        <div>
          <h2 className="text-2xl font-semibold">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="cursor-pointer">
          <EditIcon />
        </div>
      </div>
    )
  );
};

export default PersonalInformation;
