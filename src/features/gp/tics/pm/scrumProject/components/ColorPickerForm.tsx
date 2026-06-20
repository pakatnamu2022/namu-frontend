"use client";

import Color from "color";
import { useCallback } from "react";
import { Control } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
} from "@/components/ui/color-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrumProjectSchema } from "../lib/scrumProject.schema";

interface Props {
  control: Control<ScrumProjectSchema>;
}

export const ColorPickerForm = ({ control }: Props) => {
  return (
    <FormField
      control={control}
      name="color"
      render={({ field }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const handleChange = useCallback(
          (rgba: Parameters<typeof Color.rgb>[0]) => {
            const hex = Color.rgb(rgba as [number, number, number, number]).hex();
            field.onChange(hex);
          },
          [field.onChange],
        );

        return (
          <FormItem>
            <FormLabel>Color</FormLabel>
            <FormControl>
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <span
                      className="size-5 shrink-0 rounded"
                      style={{ backgroundColor: field.value || "#3B82F6" }}
                    />
                    <span className="text-muted-foreground">{field.value || "#3B82F6"}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <ColorPicker defaultValue={field.value} onChange={handleChange}>
                    <ColorPickerSelection className="h-32" />
                    <ColorPickerHue />
                    <ColorPickerAlpha />
                    <div className="flex items-center gap-2">
                      <ColorPickerEyeDropper />
                      <ColorPickerFormat className="flex-1" />
                    </div>
                  </ColorPicker>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
