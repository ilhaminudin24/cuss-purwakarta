"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Controller, Control } from "react-hook-form";
import GoogleMapField from "./GoogleMapField";
import { MapValue } from "../types/map";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
  ),
});

interface MapFieldProps {
  name: string;
  control: Control;
  label: string;
  required?: boolean;
  readonly?: boolean;
}

export default function MapField({
  name,
  control,
  label,
  required = false,
  readonly = false,
}: MapFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <GoogleMapField
            value={value as MapValue}
            onChange={onChange}
            readonly={readonly}
          />
        )}
      />
    </div>
  );
} 