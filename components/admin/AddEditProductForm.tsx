"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ProductSchema } from "@/lib/validations";
import CategoryCard from "@/components/cards/CategoryCard";
import { z } from "zod";
import {
  createProduct,
  editProduct,
  deleteProduct,
} from "@/lib/actions/product.actions";
import { useToast } from "@/hooks/useToast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { redirect } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Product } from "@/types/global";

interface Props {
  product?: Product;
  isEditAction?: boolean;
}
const AddEditProductDialog = ({ isEditAction, product }: Props) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const schema = ProductSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product?.title ?? "",
      brand: product?.brand ?? "",
      code: product?.code ?? "",
      stock: Number(product?.stock ?? 0) ?? 0,
      description: product?.description ?? "",
      categories: product?.categories
        ? product?.categories.map((e) => e.name)
        : [],
      remark: isEditAction ? "" : "Add Product",
    },
  });

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] }
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const categoryInput = e.currentTarget.value.trim();

      if (
        categoryInput &&
        categoryInput.length < 15 &&
        !field.value.includes(categoryInput)
      ) {
        form.setValue("categories", [...field.value, categoryInput]);
        e.currentTarget.value = "";
        form.clearErrors("categories");
      } else if (categoryInput.length > 15) {
        form.setError("categories", {
          type: "manual",
          message: "Category should be less than 15 characters",
        });
      } else if (field.value.includes(categoryInput)) {
        form.setError("categories", {
          type: "manual",
          message: "Category already exists",
        });
      }
    }
  };

  const handleCategoryRemove = (
    Category: string,
    field: { value: string[] }
  ) => {
    const newCategories = field.value.filter((t) => t !== Category);

    form.setValue("categories", newCategories);

    if (newCategories.length === 0) {
      form.setError("categories", {
        type: "manual",
        message: "Categories are required",
      });
    }
  };

  const handleCreateProduct = async (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      if (isEditAction && product?._id) {
        const result = await editProduct({
          productID: product._id,
          ...data,
          remark: (data?.remark as string) || "",
        });

        if (result.success) {
          toast({
            title: "Success",
            description: "Product updated successfully",
          });

          if (result.data) redirect("/admin/products");
        } else {
          toast({
            type: "error",
            title: `Error ${result.status}`,
            description: result.error?.message || "Something went wrong",
          });
        }
        return;
      }

      const result = await createProduct(data);

      if (result.success) {
        toast({
          title: "Success",
          description: "Product created successfully",
        });

        // if (result.data) redirect(`/admin/products/add`);
      } else {
        toast({
          type: "error",
          title: `Error ${result.status}`,
          description: result.error?.message || "Something went wrong",
        });
      }
    });
  };

  const handleDelete = async () => {
    if (!product?._id) return;
    startTransition(async () => {
      const result = await deleteProduct({ productID: product._id });
      if (result.success) {
        toast({
          title: "Deleted",
          description: "Product deleted successfully",
        });
        redirect("/admin/products");
      } else {
        toast({
          type: "error",
          title: `Error ${result.status}`,
          description: result.error?.message || "Failed to delete product",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <h2 className="h2-semibold text-dark100_light900 mb-6">
        {isEditAction ? "Edit" : "Add"} Product
      </h2>
      <form
        onSubmit={form.handleSubmit(handleCreateProduct)}
        className="space-y-6"
      >
        {(
          Object.keys(form.formState.defaultValues ?? {}) as Array<
            keyof z.infer<typeof schema>
          >
        ).map((field) => {
          if (field === "categories") {
            return null;
          }
          return (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="paragraph-medium text-dark400_light700">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={field.name === "stock" ? "number" : "text"}
                      {...field}
                      {...(field.name === "stock"
                        ? {
                            onChange: (e) =>
                              field.onChange(Number(e.target.value)),
                          }
                        : {})}
                      className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormLabel className="paragraph-medium text-dark400_light700">
                Categories
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder="Add categories..."
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                    className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  />
                  {field.value.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {field?.value?.map((category: string) => (
                        <CategoryCard
                          key={category}
                          _id={category}
                          name={category}
                          compact
                          remove
                          isButton
                          handleRemove={() =>
                            handleCategoryRemove(category, field)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Add up to 3 categories. Press enter to add a category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button
            disabled={form.formState.isSubmitting ?? isPending}
            className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
            type="submit"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 animate-spin" />
                {isEditAction ? "Saving..." : "Creating..."}
              </>
            ) : (
              "Confirm"
            )}
          </Button>

          {isEditAction && product?._id && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="danger-gradient paragraph-medium min-h-12 w-[180px] rounded-2 px-4 py-3 font-inter !text-light-900"
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="background-light900_dark300 text-dark300_light700 light-border-2">
                <DialogHeader>
                  <DialogTitle>Delete product?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the product and remove its associations.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    disabled={isPending}
                    className="secondary-gradient paragraph-medium min-h-12 rounded-2 px-4 py-3 font-inter !text-light-900"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="danger-gradient paragraph-medium min-h-12 rounded-2 px-4 py-3 font-inter !text-light-900"
                  >
                    {isPending ? (
                      <>
                        <ReloadIcon className="mr-2 animate-spin" /> Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AddEditProductDialog;
