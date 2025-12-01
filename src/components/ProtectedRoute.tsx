import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const tokenKeys = ["authToken", "accessToken", "access_token", "refreshToken"];

function hasAnyToken(): boolean {
  return tokenKeys.some((k) => Boolean(localStorage.getItem(k)));
}

type Props = {
  children: React.ReactElement;
};


export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();

  if (hasAnyToken()) {
    return children;
  }

  return <Navigate to="/" replace state={{ from: location }} />;
}
