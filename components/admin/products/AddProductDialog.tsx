"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormControl,
} from "@/components/ui/form";
import { AddProductSchema } from "@/lib/inventoryValidations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Path, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

const AddProductDialog = () => {
  const defaultValues = {
    brand: "",
    category: "",
    code: "",
    description: "",
    stock: 0,
    title: "",
  };
  const form = useForm({
    resolver: zodResolver(AddProductSchema),
    defaultValues,
  });
  return (
    <Dialog>
      <div className="flex items-center justify-between border-b border-dark-400 pb-2">
        <h2 className="h2-semibold text-dark100_light900">
          Products Inventory
        </h2>
        <DialogTrigger asChild>
          <Button className="button_primary">Add product</Button>
        </DialogTrigger>
      </div>
      <DialogContent className="light-border background-light800_dark200 shadow-light100_dark100 min-w-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-[520px] sm:px-8">
        <DialogHeader>
          <DialogTitle className="h3-semibold mb-6 border-b border-dark-400 pb-3">
            Add product
          </DialogTitle>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(() => {})}
              className="mt-10 space-y-6"
            >
              {Object.keys(defaultValues).map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as Path<T>}
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2.5">
                      <FormLabel className="paragraph-medium text-dark400_light700">
                        {field.name.charAt(0).toUpperCase() +
                          field.name.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          type={field.name === "stock" ? "number" : "text"}
                          {...field}
                          className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                disabled={form.formState.isSubmitting}
                className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
              >
                Confirm
              </Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
